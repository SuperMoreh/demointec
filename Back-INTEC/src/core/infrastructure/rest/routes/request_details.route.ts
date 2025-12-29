import { Router } from "express";
import { RequestDetailsController } from "../controllers/request_details.controller";
import { RequestDetailsAdpaterRepository } from "../../adapters/request_details.adapter";


const requestRouter = Router();

const controller = new RequestDetailsController(new RequestDetailsAdpaterRepository);

requestRouter.post("/sincronizar-solicitudesDetalle", controller.syncToFirebase.bind(controller));
requestRouter.post("/solicitudesDetalle", controller.create.bind(controller));
requestRouter.get("/solicitudesDetalle", controller.list.bind(controller));
requestRouter.get("/solicitudesDetalle/folio", controller.getCurrentFolio.bind(controller));
requestRouter.get("/solicitudesDetalle/:id", controller.get.bind(controller));
requestRouter.put("/solicitudesDetalle/:id", controller.update.bind(controller));
requestRouter.delete("/solicitudesDetalle/:id", controller.remove.bind(controller));


export default requestRouter;