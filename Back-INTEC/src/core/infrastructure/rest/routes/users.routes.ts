import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { UserAdapterRepository } from "../../adapters/users.adapter";
import { verifyToken } from "../../../middleware/auth.middleware";
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });

const userRouter = Router();

const controller = new UserController(new UserAdapterRepository);
userRouter.post('/usuarios', upload.single('imagen'), controller.create.bind(controller));
userRouter.get("/usuarios", controller.list.bind(controller));
userRouter.get("/usuarios/:id", controller.get.bind(controller));
userRouter.put("/usuarios/:id", upload.single('imagen'), controller.update.bind(controller));
userRouter.delete("/usuarios/:id", controller.remove.bind(controller));


export default userRouter;
