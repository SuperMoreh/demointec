import { Router } from "express";
import { DisabilityAdapterRepository } from "../../adapters/disability.adapter";
import { DisabilityController } from "../controllers/disability.controller";

const disabilityRouter = Router();
const disabilityRepository = new DisabilityAdapterRepository();
const disabilityController = new DisabilityController(disabilityRepository);

disabilityRouter.get('/incapacidades', (req, res) => disabilityController.list(req, res));
disabilityRouter.get('/incapacidades/:id', (req, res) => disabilityController.get(req, res));
disabilityRouter.post('/incapacidades', (req, res) => disabilityController.create(req, res));
disabilityRouter.put('/incapacidades/:id', (req, res) => disabilityController.update(req, res));
disabilityRouter.delete('/incapacidades/:id', (req, res) => disabilityController.remove(req, res));

export default disabilityRouter;
