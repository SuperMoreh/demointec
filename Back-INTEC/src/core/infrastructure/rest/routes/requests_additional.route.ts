import { Router } from "express";
import { RequestsAdditionalController } from "../controllers/requests_additional.controller";
import { RequestsAdditionalAdapterRepository } from "../../adapters/requests_additional.adapter";


const requestsAdditionalRouter = Router();

const controller = new RequestsAdditionalController(new RequestsAdditionalAdapterRepository);

requestsAdditionalRouter.post("/sincronizar-solicitudesDetalleAdicional", controller.syncToFirebase.bind(controller));
requestsAdditionalRouter.post("/solicitudesDetalleAdicional", controller.create.bind(controller));
requestsAdditionalRouter.get("/solicitudesDetalleAdicional", controller.list.bind(controller));
requestsAdditionalRouter.get("/solicitudesDetalleAdicional/folio", controller.getCurrentFolio.bind(controller));
requestsAdditionalRouter.get("/solicitudesDetalleAdicional/:id", controller.get.bind(controller));
requestsAdditionalRouter.put("/solicitudesDetalleAdicional/:id", controller.update.bind(controller));
requestsAdditionalRouter.delete("/solicitudesDetalleAdicional/:id", controller.remove.bind(controller));


export default requestsAdditionalRouter;

