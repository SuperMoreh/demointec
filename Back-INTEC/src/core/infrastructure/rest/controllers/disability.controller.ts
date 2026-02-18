import { Request, Response } from "express";
import { DisabilityRepository } from "../../../domain/repository/disability.repository";
import { DisabilityEntity } from "../../entity/disability.entity";

export class DisabilityController {
    constructor(private disabilityRepository: DisabilityRepository<DisabilityEntity>) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const disability = await this.disabilityRepository.create(body);
            res.status(200).json(disability);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la incapacidad', error });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const disabilities = await this.disabilityRepository.list();
            res.status(200).json(disabilities);
        } catch (error) {
            res.status(500).json({ message: 'Error al listar incapacidades', error });
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const disability = await this.disabilityRepository.get(Number(id));
            res.status(200).json(disability);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la incapacidad', error });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;
            const disability = await this.disabilityRepository.update(Number(id), body);
            res.status(200).json(disability);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la incapacidad', error });
        }
    }

    async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.disabilityRepository.remove(Number(id));
            res.status(200).json({ message: 'Incapacidad eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la incapacidad', error });
        }
    }
}
