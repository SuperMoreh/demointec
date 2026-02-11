import { Request, Response } from "express";
import { EmployeeDocumentsAdapter } from "../../adapters/employee-documents.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class EmployeeDocumentsController {
    constructor(private adapter: EmployeeDocumentsAdapter) { }

    private async uploadFile(file: Express.Multer.File): Promise<string> {
        const token = uuidv4();
        const fileName = `docs/${token}_${file.originalname}`;
        const fileUpload = storage.file(fileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    firebaseStorageDownloadTokens: token
                }
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                reject(error);
            });
            blobStream.on('finish', () => {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${token}`;
                resolve(publicUrl);
            });
            blobStream.end(file.buffer);
        });
    }

    async getDocuments(req: Request, res: Response): Promise<void> {
        try {
            const { employeeId } = req.params;
            const documents = await this.adapter.getDocumentsByEmployee(employeeId);
            res.status(200).json(documents);
        } catch (error) {
            console.error('Error getting documents:', error);
            res.status(500).json({ message: "Error al obtener documentos", error });
        }
    }

    async uploadDocument(req: Request, res: Response): Promise<void> {
        try {
            console.log('uploadDocument called');
            const body = req.body; // Should contain id_employee, document_type
            console.log('Body:', body);
            console.log('File:', req.file);

            if (!body.id_employee || !body.document_type) {
                res.status(400).json({ message: "Faltan datos requeridos (id_employee, document_type)" });
                return;
            }

            if (req.file) {
                try {
                    console.log('[DEBUG] Uploading file to Firebase...');
                    const fileUrl = await this.uploadFile(req.file);
                    console.log('[DEBUG] Firebase upload OK. URL:', fileUrl);
                    body.document_path = fileUrl;
                } catch (uploadError) {
                    console.error('[ERROR] Document upload failed:', uploadError);
                    res.status(500).json({ message: "Error al subir archivo", error: uploadError });
                    return;
                }
            } else {
                res.status(400).json({ message: "No se envió ningún archivo" });
                return;
            }

            console.log('[DEBUG] Saving to DB with data:', JSON.stringify(body));
            const doc = await this.adapter.saveDocument(body);
            console.log('[DEBUG] Document saved to DB:', JSON.stringify(doc));
            res.status(201).json({ message: "Documento guardado correctamente", doc });

        } catch (error: any) {
            console.error('[ERROR] Error saving document:', error?.message || error);
            console.error('[ERROR] Stack:', error?.stack);
            res.status(500).json({ message: "Error al guardar documento", error: error?.message });
        }
    }

    async deleteDocument(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Falta el ID del documento" });
                return;
            }
            await this.adapter.deleteDocument(Number(id));
            res.status(200).json({ message: "Documento eliminado correctamente" });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ message: "Error al eliminar documento", error });
        }
    }
}
