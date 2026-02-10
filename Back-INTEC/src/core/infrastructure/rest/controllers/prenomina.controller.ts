import { Request, Response } from "express";
import { PrenominaRepository } from "../../../domain/repository/prenomina.repository";

export class PrenominaController {
  constructor(private prenominaRepository: PrenominaRepository) {}

  async getList(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ message: 'Faltan parámetros requeridos: startDate, endDate' });
        return;
      }
      const data = await this.prenominaRepository.getList(
        startDate as string,
        endDate as string
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener prenómina', error });
    }
  }
}
