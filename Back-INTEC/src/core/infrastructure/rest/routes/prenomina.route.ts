import { Router } from "express";
import { PrenominaController } from "../controllers/prenomina.controller";
import { PrenominaAdapterRepository } from "../../adapters/prenomina.adapter";

const prenominaRouter = Router();

const controller = new PrenominaController(new PrenominaAdapterRepository);

prenominaRouter.get("/prenomina", controller.getList.bind(controller));

export default prenominaRouter;
