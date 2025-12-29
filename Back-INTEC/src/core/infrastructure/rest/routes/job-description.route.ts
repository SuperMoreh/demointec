import { Router } from "express";
import { JobDescriptionController } from "../controllers/job-description.controller";
import { JobDescriptionAdapter } from "../../adapters/job-description.adapter";

const jobDescriptionRouter = Router();
const adapter = new JobDescriptionAdapter();
const controller = new JobDescriptionController(adapter);

jobDescriptionRouter.get('/job-descriptions', (req, res) => { controller.getAll(req, res); });
jobDescriptionRouter.get('/job-descriptions/:id', (req, res) => { controller.getById(req, res); });
jobDescriptionRouter.post('/job-descriptions', (req, res) => { controller.create(req, res); });
jobDescriptionRouter.put('/job-descriptions/:id', (req, res) => { controller.update(req, res); });
jobDescriptionRouter.delete('/job-descriptions/:id', (req, res) => { controller.delete(req, res); });

export default jobDescriptionRouter;
