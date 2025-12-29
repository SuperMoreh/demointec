import { Router, Request, Response, NextFunction } from "express";
import { LaborRelationsController } from "../controllers/labor-relations.controller";
import { LaborRelationsAdapter } from "../../adapters/labor-relations.adapter";
import { upload } from "../middlewares/upload.middleware";
import multer from "multer";

const laborRelationsRouter = Router();
const adapter = new LaborRelationsAdapter();
const controller = new LaborRelationsController(adapter);

// Debug Middleware for Upload
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Upload Middleware Triggered ---');
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

// Events
laborRelationsRouter.get('/labor-events/:employeeId', (req, res) => controller.getEvents(req, res));
laborRelationsRouter.post('/labor-events', uploadMiddleware, (req, res) => controller.createEvent(req, res));
laborRelationsRouter.put('/labor-events/:id', uploadMiddleware, (req, res) => controller.updateEvent(req, res));
laborRelationsRouter.delete('/labor-events/:id', (req, res) => controller.deleteEvent(req, res));

// Uniforms
laborRelationsRouter.get('/employee-uniforms/:employeeId', (req, res) => controller.getUniforms(req, res));
laborRelationsRouter.post('/employee-uniforms', (req, res) => controller.saveUniforms(req, res));

export default laborRelationsRouter;
