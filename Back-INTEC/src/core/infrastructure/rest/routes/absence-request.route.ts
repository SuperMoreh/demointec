import { Router } from "express";
import { AbsenceRequestAdapterRepository } from "../../adapters/absence-request.adapter";
import { AbsenceRequestController } from "../controllers/absence-request.controller";

const absenceRequestRouter = Router();
const absenceRequestRepository = new AbsenceRequestAdapterRepository();
const absenceRequestController = new AbsenceRequestController(absenceRequestRepository);

absenceRequestRouter.get('/solicitudes-ausencia', (req, res) => absenceRequestController.list(req, res));
absenceRequestRouter.get('/solicitudes-ausencia/:id', (req, res) => absenceRequestController.get(req, res));
absenceRequestRouter.post('/solicitudes-ausencia', (req, res) => absenceRequestController.create(req, res));
absenceRequestRouter.put('/solicitudes-ausencia/:id', (req, res) => absenceRequestController.update(req, res));
absenceRequestRouter.delete('/solicitudes-ausencia/:id', (req, res) => absenceRequestController.remove(req, res));

export default absenceRequestRouter;
