import { Request, Response } from "express";
import { TemplateAnalysisRepository } from "../../../domain/repository/template-analysis.repository";

export class TemplateAnalysisController {
  constructor(private templateAnalysisRepository: TemplateAnalysisRepository) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.templateAnalysisRepository.list();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el análisis de plantillas', error });
    }
  }
}
