import { Router } from "express";
import { ProjectsController } from "../controllers/projects_catalog.controller";
import { ProjectsAdapterRepository } from "../../adapters/projects_catalog.adapter";



const projectsRouter = Router();

const controller = new ProjectsController(new ProjectsAdapterRepository);

projectsRouter.post("/sincronizar-obras", controller.syncToFirebase.bind(controller));
projectsRouter.post("/obras", controller.create.bind(controller));
projectsRouter.get("/obras", controller.list.bind(controller));
projectsRouter.get("/obras/:id", controller.get.bind(controller));
projectsRouter.put("/obras/:id", controller.update.bind(controller));
projectsRouter.delete("/obras/:id", controller.remove.bind(controller));


export default projectsRouter;