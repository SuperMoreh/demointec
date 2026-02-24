import { Request, Response } from "express";
import { SalaryTabulatorRepository } from "../../../domain/repository/salary-tabulator.repository";
import { SalaryTabulatorEntity } from "../../entity/salary-tabulator.entity";

export class SalaryTabulatorController {
    constructor(private salaryTabulatorRepository: SalaryTabulatorRepository<SalaryTabulatorEntity>) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const salaryTabulator = await this.salaryTabulatorRepository.create(body);
            res.status(200).json(salaryTabulator);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear el registro del tabulador', error });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const salaryTabulators = await this.salaryTabulatorRepository.list();
            res.status(200).json(salaryTabulators);
        } catch (error) {
            res.status(500).json({ message: 'Error al listar el tabulador general', error });
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const salaryTabulator = await this.salaryTabulatorRepository.get(Number(id));
            res.status(200).json(salaryTabulator);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el registro del tabulador', error });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;
            const salaryTabulator = await this.salaryTabulatorRepository.update(Number(id), body);
            res.status(200).json(salaryTabulator);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el registro del tabulador', error });
        }
    }

    async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.salaryTabulatorRepository.remove(Number(id));
            res.status(200).json({ message: 'Registro del tabulador eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el registro del tabulador', error });
        }
    }
}
