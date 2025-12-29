import { Router } from "express";
import { LoginController } from "../controllers/login.controller";
import { LoginAdapterRepository } from "../../adapters/login.adapter";

const loginRouter = Router();

const controller = new LoginController(new LoginAdapterRepository);

loginRouter.post("/login", controller.login.bind(controller));

export default loginRouter;