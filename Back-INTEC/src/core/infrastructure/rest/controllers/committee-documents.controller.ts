import { Request, Response } from "express";
import { CommitteeDocumentsAdapter } from "../../adapters/committee-documents.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

const VALID_COMMITTEE_FOLDERS: Record<string, string> = {
    'CMPCA': 'Capacitacion(CMPCA)',
    'CGA': 'Cuadro-General-Antiguedades',
    'PTU': 'Participacion-Trabajadores-Utilidades(PTU)',
    'RIT': 'Reglamento-Trabajo(RIT)',
    'CSH': 'Seguridad-Higiene(CSH)'
};

export class CommitteeDocumentsController {
    constructor(private adapter: CommitteeDocumentsAdapter) { }

    private getFolderName(documentType: string): string {
        return VALID_COMMITTEE_FOLDERS[documentType] || documentType;
    }

    private async uploadFile(file: Express.Multer.File, documentType: string): Promise<string> {
        const folder = this.getFolderName(documentType);
        const token = uuidv4();
        const fileName = `${folder}/${token}_${file.originalname}`;
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
            const documents = await this.adapter.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener documentos de comisiones", error });
        }
    }

    async getDocumentsByType(req: Request, res: Response): Promise<void> {
        try {
            const { documentType } = req.params;
            const documents = await this.adapter.getDocumentsByType(documentType);
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener documentos por tipo", error });
        }
    }

    async uploadDocument(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;

            if (!body.document_type) {
                res.status(400).json({ message: "Faltan datos requeridos (document_type)" });
                return;
            }

            if (!VALID_COMMITTEE_FOLDERS[body.document_type]) {
                res.status(400).json({
                    message: "Tipo de documento no válido",
                    valid_types: Object.keys(VALID_COMMITTEE_FOLDERS)
                });
                return;
            }

            if (req.file) {
                try {
                    const fileUrl = await this.uploadFile(req.file, body.document_type);
                    body.document_path = fileUrl;
                    body.name_document = req.file.originalname;
                } catch (uploadError) {
                    res.status(500).json({ message: "Error al subir archivo", error: uploadError });
                    return;
                }
            } else {
                res.status(400).json({ message: "No se envió ningún archivo" });
                return;
            }

            const doc = await this.adapter.saveDocument(body);
            res.status(201).json({ message: "Documento de comisión guardado correctamente", doc });

        } catch (error) {
            res.status(500).json({ message: "Error al guardar documento de comisión", error });
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
            res.status(200).json({ message: "Documento de comisión eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar documento de comisión", error });
        }
    }
}
