import { Router, Request, Response, NextFunction } from "express";
import { CommitteeDocumentsController } from "../controllers/committee-documents.controller";
import { CommitteeDocumentsAdapter } from "../../adapters/committee-documents.adapter";
import { upload } from "../middlewares/upload.middleware";
import multer from "multer";

const committeeDocumentsRouter = Router();
const adapter = new CommitteeDocumentsAdapter();
const controller = new CommitteeDocumentsController(adapter);

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.single('document');
    uploader(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Error en subida de archivos (Multer)", error: err });
        } else if (err) {
            return res.status(500).json({ message: "Error desconocido al subir archivo", error: err });
        }
        next();
    });
};

committeeDocumentsRouter.get('/comisiones-documentos', (req, res) => controller.getDocuments(req, res));
committeeDocumentsRouter.get('/comisiones-documentos/tipo/:documentType', (req, res) => controller.getDocumentsByType(req, res));
committeeDocumentsRouter.post('/comisiones-documentos', uploadMiddleware, (req, res) => controller.uploadDocument(req, res));
committeeDocumentsRouter.delete('/comisiones-documentos/:id', (req, res) => controller.deleteDocument(req, res));

committeeDocumentsRouter.post('/comisiones-documentos-download', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ message: "Falta la URL del archivo" });
            return;
        }

        const response = await fetch(url);
        if (!response.ok) {
            res.status(response.status).json({ message: "Error al descargar archivo desde Firebase" });
            return;
        }

        const buffer = await response.arrayBuffer();
        res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ message: "Error al descargar archivo", error });
    }
});

export default committeeDocumentsRouter;
