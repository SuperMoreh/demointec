import { Router } from "express";
import { SalaryReportAdapterRepository } from "../../adapters/salary-report.adapter";
import { SalaryReportController } from "../controllers/salary-report.controller";

const salaryReportRouter = Router();
const salaryReportRepository = new SalaryReportAdapterRepository();
const salaryReportController = new SalaryReportController(salaryReportRepository);

salaryReportRouter.get('/tabulador-sueldos', (req, res) => salaryReportController.list(req, res));

export default salaryReportRouter;
