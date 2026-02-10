import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { AttendanceRepository } from "../../domain/repository/attendances.repository";
import { AttendanceEntity } from "../entity/attendances.entity";
import { db } from '../../../firebase/firebase.config';
import { error } from "console";



export class AttendaceAdapterRepository implements AttendanceRepository<AttendanceEntity> {

  async create(data: Partial<AttendanceEntity>, query?: Query): Promise<AttendanceEntity> {
    const repository = database.getRepository(AttendanceEntity);

    const attendance = repository.create({
      ...data,
    });
    await repository.save(attendance);
    return repository.findOneOrFail({
      where: { id_attendance: data.id_attendance },

    });
  }

  async list(query?: Query): Promise<AttendanceEntity[]> {
    const repository = database.getRepository(AttendanceEntity);
    return repository.find({
    });
  }

  async get(id: Id, query?: Query): Promise<AttendanceEntity> {
    const repository = database.getRepository(AttendanceEntity);
    const data = await repository.findOne({
      where: { id_attendance: id as string },
    });
    if (!data) {
      throw new NotFound("No existe la asistencia con el id proporcionado");
    }
    return data;
  }

  async update(id: Id, data: Partial<AttendanceEntity>, query?: Query): Promise<AttendanceEntity> {
    const repository = database.getRepository(AttendanceEntity);
    await repository.update(id, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<AttendanceEntity> {
    const repository = database.getRepository(AttendanceEntity);

    const data = await this.get(id, query);
    await repository.update({ id_attendance: id.toString() }, { status: false });
    return data;
  }

  async getByUserAndDateRange(uuid: string, startDate: string, endDate: string): Promise<AttendanceEntity[]> {
    const repository = database.getRepository(AttendanceEntity);
    return repository.createQueryBuilder('attendance')
      .where('attendance.uuid = :uuid', { uuid })
      .andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.date', 'ASC')
      .addOrderBy('attendance.hour', 'ASC')
      .getMany();
  }

  async syncToFirebase(): Promise<{}> {
    const repository = database.getRepository(AttendanceEntity);
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    try {
      const snapshot = await firestore.collection('Checador').get();

      for (const doc of snapshot.docs) {
        const item = doc.data();
        const id = doc.id;

        try {
          const existing = await repository.findOne({ where: { id_attendance: id } });

          if (!existing) {
            const entity = repository.create({
              id_attendance: id,
              name_user: item.nombre || '',
              date: item.fecha || new Date().toISOString().split('T')[0],
              hour: item.hora || '',
              latitude: item.latitud || 0,
              length: item.longitud || 0,
              observation: item.observacion || '',
              type: item.tipo || '',
              uuid: item.uuid || '',
              status: true,
            });

            await repository.save(entity);

          } else {
          }
        } catch (_) {
          console.error(error);
        }
      }

      return {
      };
    } catch (error) {
      throw error;
    }
  }



}