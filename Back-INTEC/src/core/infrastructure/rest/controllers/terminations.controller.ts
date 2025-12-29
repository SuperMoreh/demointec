import { Request, Response } from "express";
import { TerminationRepository } from "../../../domain/repository/terminations.repository";
import { TerminationEntity } from "../../entity/terminations.entity";

export class TerminationController {
    constructor(private terminationRepository: TerminationRepository<TerminationEntity>) { }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const terminations = await this.terminationRepository.list();
            res.status(200).json(terminations);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al listar bajas', error });
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const termination = await this.terminationRepository.get(id);
            res.status(200).json(termination);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la baja', error });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const termination = await this.terminationRepository.create(body);
            res.status(200).json(termination);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la baja', error });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;
            const termination = await this.terminationRepository.update(id, body);
            res.status(200).json(termination);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la baja', error });
        }
    }

    async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.terminationRepository.remove(id);
            res.status(200).json({ message: 'Baja eliminada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la baja', error });
        }
    }
}
