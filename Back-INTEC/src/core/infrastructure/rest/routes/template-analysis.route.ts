import { Router } from "express";
import { TemplateAnalysisController } from "../controllers/template-analysis.controller";
import { TemplateAnalysisAdapterRepository } from "../../adapters/template-analysis.adapter";

const templateAnalysisRouter = Router();

const controller = new TemplateAnalysisController(new TemplateAnalysisAdapterRepository);

templateAnalysisRouter.get("/analisis-plantillas", controller.list.bind(controller));

export default templateAnalysisRouter;
