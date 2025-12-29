import { Router } from "express";
import { AttendanceController } from "../controllers/attendaces.controller";
import { AttendaceAdapterRepository } from "../../adapters/attendances.adapter";


const attendaceRouter = Router();

const controller = new AttendanceController(new AttendaceAdapterRepository);

attendaceRouter.post("/sincronizar-asistencias", controller.syncToFirebase.bind(controller));
attendaceRouter.get("/asistencias", controller.list.bind(controller));
attendaceRouter.get("/asistencias/:id", controller.get.bind(controller));
attendaceRouter.post("/asistencias/rango", controller.getByDateRange.bind(controller));



export default attendaceRouter;