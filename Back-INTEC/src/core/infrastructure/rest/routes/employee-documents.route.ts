import { Router, Request, Response, NextFunction } from "express";
import { EmployeeDocumentsController } from "../controllers/employee-documents.controller";
import { EmployeeDocumentsAdapter } from "../../adapters/employee-documents.adapter";
import { upload } from "../middlewares/upload.middleware";
import multer from "multer";

const employeeDocumentsRouter = Router();
const adapter = new EmployeeDocumentsAdapter();
const controller = new EmployeeDocumentsController(adapter);

// Debug Middleware for Upload (Reused)
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Document Upload Middleware Triggered ---');
    const uploader = upload.single('document');
    uploader(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(500).json({ message: "Error en subida de archivos (Multer)", error: err });
        } else if (err) {
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ message: "Error desconocido al subir archivo", error: err });
        }
        console.log('Multer processed file successfully. File:', req.file);
        next();
    });
};

employeeDocumentsRouter.get('/employee-documents/:employeeId', (req, res) => controller.getDocuments(req, res));
employeeDocumentsRouter.post('/employee-documents', uploadMiddleware, (req, res) => controller.uploadDocument(req, res));
employeeDocumentsRouter.delete('/employee-documents/:id', (req, res) => controller.deleteDocument(req, res));

export default employeeDocumentsRouter;
