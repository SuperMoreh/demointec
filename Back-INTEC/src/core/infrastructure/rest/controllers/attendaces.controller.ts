import { config } from 'dotenv';
import { Request, Response } from "express";
import { AttendanceRepository } from '../../../domain/repository/attendances.repository';
import { AttendanceEntity } from '../../entity/attendances.entity';
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';



config();

export class AttendanceController {
  constructor(private attendanceRepository: AttendanceRepository<AttendanceEntity>) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const attendance = await this.attendanceRepository.create(body);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Error', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const attendances = await this.attendanceRepository.list();
      res.status(200).json(attendances);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar asistencias', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceRepository.get(id);
      res.status(200).json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la asistencia', error });
    }
  }

  async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { uuid, startDate, endDate } = req.body;
      if (!uuid || !startDate || !endDate) {
        res.status(400).json({ message: 'Faltan parámetros requeridos: uuid, startDate, endDate' });
        return;
      }
      const attendances = await (this.attendanceRepository as any).getByUserAndDateRange(uuid, startDate, endDate);
      res.status(200).json(attendances);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener asistencias por rango de fechas', error });
    }
  }


  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceRepository.remove(String(id));
      res.status(200).json({ message: 'Eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar', error });
    }
  }

  async syncToFirebase(req: Request, res: Response): Promise<void> {
    try {
      try {
        await db.ref().child('test').once('value');
      } catch {
        res.status(500).json({ message: 'Error al conectar con Firebase' });
        return;
      }

      await this.attendanceRepository.syncToFirebase();

      const repository = database.getRepository(AttendanceEntity);
      const count = await repository.count();

      res.status(200).json({
        message: 'Sincronización desde Firebase completada correctamente.',
        registrosEnBaseDeDatos: count
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }


}