import { Request, Response } from "express";
import { EmployeeDocumentsAdapter } from "../../adapters/employee-documents.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class EmployeeDocumentsController {
    constructor(private adapter: EmployeeDocumentsAdapter) { }

    // --- Helper: Upload to Firebase (Reused Logic) ---
    private async uploadFile(file: Express.Multer.File): Promise<string> {
        console.log('Starting document upload to Firebase:', file.originalname);
        const fileName = `docs/${uuidv4()}_${file.originalname}`;
        const fileUpload = storage.file(fileName);

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
                    const fileUrl = await this.uploadFile(req.file);
                    body.document_path = fileUrl;
                } catch (uploadError) {
                    console.error('Document upload failed:', uploadError);
                    res.status(500).json({ message: "Error al subir archivo", error: uploadError });
                    return;
                }
            } else {
                res.status(400).json({ message: "No se envió ningún archivo" });
                return;
            }

            const doc = await this.adapter.saveDocument(body);
            res.status(201).json({ message: "Documento guardado correctamente", doc });

        } catch (error) {
            console.error('Error saving document:', error);
            res.status(500).json({ message: "Error al guardar documento", error });
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
