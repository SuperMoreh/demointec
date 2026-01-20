import { Request, Response } from "express";
import { JobDescriptionAdapter } from "../../adapters/job-description.adapter";

export class JobDescriptionController {
    constructor(private adapter: JobDescriptionAdapter) { }

    async getAll(req: Request, res: Response) {
        try {
            const jobs = await this.adapter.getAll();
            res.json(jobs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener descripciones de puesto" });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const job = await this.adapter.getById(Number(id));
            if (!job) return res.status(404).json({ message: "Descripción de puesto no encontrada" });
            res.json(job);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener descripción de puesto" });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newJob = await this.adapter.create(req.body);
            res.json(newJob);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al crear descripción de puesto" });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedJob = await this.adapter.update(Number(id), req.body);
            if (!updatedJob) return res.status(404).json({ message: "Descripción de puesto no encontrada" });
            res.json(updatedJob);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al actualizar descripción de puesto" });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await this.adapter.delete(Number(id));
            if (!deleted) return res.status(404).json({ message: "Descripción de puesto no encontrada" });
            res.json({ message: "Descripción de puesto eliminada correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al eliminar descripción de puesto" });
        }
    }
}
