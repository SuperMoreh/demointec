import { Request, Response } from "express";
import { SalaryReportRepository } from "../../../domain/repository/salary-report.repository";

export class SalaryReportController {
    constructor(private salaryReportRepository: SalaryReportRepository) { }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.salaryReportRepository.list();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el tabulador de sueldos', error });
        }
    }
}
