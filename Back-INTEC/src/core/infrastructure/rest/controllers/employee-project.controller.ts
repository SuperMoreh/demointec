import { Request, Response } from "express";
import { EmployeeProjectRepository } from "../../../domain/repository/employee-project.repository";
import { EmployeeEntity } from "../../entity/employees.entity";

export class EmployeeProjectController {
  constructor(private employeeProjectRepository: EmployeeProjectRepository<EmployeeEntity>) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const employees = await this.employeeProjectRepository.list();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar obras de colaboradores', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await this.employeeProjectRepository.get(id);
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la obra del colaborador', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      await this.employeeProjectRepository.update(String(id), body);
      res.status(200).json({ message: 'Obra asignada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al asignar obra al colaborador', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.employeeProjectRepository.remove(String(id));
      res.status(200).json({ message: 'Obra removida correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al remover obra del colaborador', error });
    }
  }
}
