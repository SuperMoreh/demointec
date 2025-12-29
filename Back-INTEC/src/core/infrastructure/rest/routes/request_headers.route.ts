import { Router } from "express";
import { RequestHeadersController } from "../controllers/request_headers.controller";
import { RequestHeadersAdpaterRepository } from "../../adapters/request_headers.adapter";


const requestRouter1 = Router();

const controller = new RequestHeadersController(new RequestHeadersAdpaterRepository);

requestRouter1.post("/sincronizar-solicitudesEncabezado", controller.syncToFirebase.bind(controller));
requestRouter1.post("/solicitudesEncabezado", controller.create.bind(controller));
requestRouter1.get("/solicitudesEncabezado", controller.list.bind(controller));
requestRouter1.get("/solicitudesEncabezado/:id", controller.get.bind(controller));
requestRouter1.put("/solicitudesEncabezado/:id", controller.update.bind(controller));
requestRouter1.delete("/solicitudesEncabezado/:id", controller.remove.bind(controller));


export default requestRouter1;