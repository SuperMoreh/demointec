import { Router } from "express";
import { SalaryTabulatorAdapterRepository } from "../../adapters/salary-tabulator.adapter";
import { SalaryTabulatorController } from "../controllers/salary-tabulator.controller";

const salaryTabulatorRouter = Router();
const salaryTabulatorRepository = new SalaryTabulatorAdapterRepository();
const salaryTabulatorController = new SalaryTabulatorController(salaryTabulatorRepository);

salaryTabulatorRouter.get('/tabulador-general-sueldos', (req, res) => salaryTabulatorController.list(req, res));
salaryTabulatorRouter.get('/tabulador-general-sueldos/:id', (req, res) => salaryTabulatorController.get(req, res));
salaryTabulatorRouter.post('/tabulador-general-sueldos', (req, res) => salaryTabulatorController.create(req, res));
salaryTabulatorRouter.put('/tabulador-general-sueldos/:id', (req, res) => salaryTabulatorController.update(req, res));
salaryTabulatorRouter.delete('/tabulador-general-sueldos/:id', (req, res) => salaryTabulatorController.remove(req, res));

export default salaryTabulatorRouter;
