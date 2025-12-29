import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repository/users.repository";
import { UserEntity } from "../../entity/users.entity";
import { config } from 'dotenv';

config();

export class UserController {
  constructor(private userRepository: UserRepository<UserEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const imageBuffer = req.file?.buffer;

      body.role_id = parseInt(body.rol); 

      await this.userRepository.create(body, imageBuffer);
      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el usuario', error });
    }
  }


  async list(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepository.list();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar usuarios', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userRepository.get(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const imageBuffer = req.file?.buffer;

      if (body.rol) {
        body.role_id = { id_role: parseInt(body.rol) };
      }

      await this.userRepository.update(Number(id), body, imageBuffer);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el usuario', error });
      console.error(error);
    }
  }


  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userRepository.remove(Number(id));
      res.status(200).json({ message: 'Eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
  }


}

