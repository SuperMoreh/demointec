import { Request, Response } from "express";
import { LaborRelationsAdapter } from "../../adapters/labor-relations.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class LaborRelationsController {
    constructor(private laborRelationsAdapter: LaborRelationsAdapter) { }

    // --- Helper: Upload to Firebase ---
    private async uploadFile(file: Express.Multer.File): Promise<string> {
        console.log('Starting file upload to Firebase:', file.originalname, file.mimetype);
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = storage.file(`labor-events/${fileName}`);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                console.error('Firebase Storage Error:', error);
                reject(error);
            });
            blobStream.on('finish', async () => {
                try {
                    console.log('File upload finished, attempting to make public...');
                    // Try to make it public, but don't fail if it's already public or we lack permission
                    // We will assume the bucket allows public read or we return the public URL anyway.
                    // If permissions fail, we just log it.
                    try {
                        await fileUpload.makePublic();
                    } catch (e) {
                        console.warn('Could not make file public (might need IAM permissions):', e);
                    }

                    const publicUrl = `https://storage.googleapis.com/${storage.name}/${fileUpload.name}`;
                    console.log('File public URL:', publicUrl);
                    resolve(publicUrl);
                } catch (error) {
                    console.error('Error in upload finish callback:', error);
                    reject(error);
                }
            });
            blobStream.end(file.buffer);
        });
    }

    // --- Events ---

    async getEvents(req: Request, res: Response): Promise<void> {
        try {
            const { employeeId } = req.params;
            const events = await this.laborRelationsAdapter.getEvents(employeeId);
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener eventos", error });
        }
    }

    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            console.log('createEvent called');
            const body = req.body;
            console.log('Body:', body);
            console.log('File:', req.file);

            // Handle File Upload
            if (req.file) {
                try {
                    const fileUrl = await this.uploadFile(req.file);
                    body.document_path = fileUrl;
                } catch (uploadError) {
                    console.error('Upload failed:', uploadError);
                    res.status(500).json({ message: "Error al subir archivo", error: uploadError });
                    return;
                }
            }

            const event = await this.laborRelationsAdapter.createEvent(body);
            res.status(201).json({ message: "Evento creado correctamente", event });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: "Error al crear evento", error });
        }
    }

    async updateEvent(req: Request, res: Response): Promise<void> {
        try {
            console.log('updateEvent called');
            const { id } = req.params;
            const body = req.body;
            console.log('Update Body:', body);
            console.log('Update File:', req.file);

            // Handle File Upload
            if (req.file) {
                try {
                    const fileUrl = await this.uploadFile(req.file);
                    body.document_path = fileUrl;
                } catch (uploadError) {
                    console.error('Update upload failed:', uploadError);
                    res.status(500).json({ message: "Error al subir archivo en actualización", error: uploadError });
                    return;
                }
            }

            await this.laborRelationsAdapter.updateEvent(Number(id), body);

            res.status(200).json({ message: "Evento actualizado correctamente" });

        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: "Error al actualizar evento", error });
        }
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.laborRelationsAdapter.deleteEvent(Number(id));
            res.status(200).json({ message: "Evento eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar evento", error });
        }
    }

    // --- Uniforms ---

    async getUniforms(req: Request, res: Response): Promise<void> {
        try {
            const { employeeId } = req.params;
            const uniforms = await this.laborRelationsAdapter.getUniforms(employeeId);
            // Return empty object or null if not found, frontend should handle it
            res.status(200).json(uniforms || {});
        } catch (error) {
            res.status(500).json({ message: "Error al obtener uniformes", error });
        }
    }

    async saveUniforms(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            // Body must include id_employee
            if (!body.id_employee) {
                res.status(400).json({ message: "Falta id_employee" });
                return;
            }
            const uniforms = await this.laborRelationsAdapter.saveUniforms(body);
            res.status(200).json({ message: "Uniformes guardados correctamente", uniforms });
        } catch (error) {
            res.status(500).json({ message: "Error al guardar uniformes", error });
        }
    }
}
