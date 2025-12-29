import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller";
import { CategoriesAdapterRepository } from "../../adapters/categories.adapter";


const categoriesRouter = Router();

const controller = new CategoriesController(new CategoriesAdapterRepository);

categoriesRouter.post("/sincronizar-partidas", controller.syncToFirebase.bind(controller));
categoriesRouter.post("/partidas", controller.create.bind(controller));
categoriesRouter.get("/partidas", controller.list.bind(controller));
categoriesRouter.get("/partidas/:id", controller.get.bind(controller));
categoriesRouter.put("/partidas/:id", controller.update.bind(controller));
categoriesRouter.delete("/partidas/:id", controller.remove.bind(controller));


export default categoriesRouter;