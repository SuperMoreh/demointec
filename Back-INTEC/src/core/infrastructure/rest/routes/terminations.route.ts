import { Router } from "express";
import { TerminationAdapterRepository } from "../../adapters/terminations.adapter";
import { TerminationController } from "../controllers/terminations.controller";

const router = Router();
const terminationRepository = new TerminationAdapterRepository();
const terminationController = new TerminationController(terminationRepository);

router.get('/terminations', (req, res) => terminationController.list(req, res));
router.get('/terminations/:id', (req, res) => terminationController.get(req, res));
router.post('/terminations', (req, res) => terminationController.create(req, res));
router.put('/terminations/:id', (req, res) => terminationController.update(req, res));
router.delete('/terminations/:id', (req, res) => terminationController.remove(req, res));

export default router;
