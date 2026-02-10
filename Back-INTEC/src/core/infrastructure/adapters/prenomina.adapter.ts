import database from "../../../config/db";
import { PrenominaRepository } from "../../domain/repository/prenomina.repository";
import { EmployeeEntity } from "../entity/employees.entity";
import { AttendanceEntity } from "../entity/attendances.entity";

export class PrenominaAdapterRepository implements PrenominaRepository {

  async getList(startDate: string, endDate: string): Promise<any[]> {
    const employeeRepo = database.getRepository(EmployeeEntity);
    const attendanceRepo = database.getRepository(AttendanceEntity);

    const employees = await employeeRepo.find({
      where: { status: true },
      select: ['id_employee', 'name_employee', 'project'],
    });

    const attendances = await attendanceRepo
      .createQueryBuilder('a')
      .where('a.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('a.status = :status', { status: true })
      .getMany();

    const attendanceMap = new Map<string, AttendanceEntity[]>();
    for (const att of attendances) {
      const dateKey = String(att.date);
      const key = `${att.uuid}_${dateKey}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, []);
      }
      attendanceMap.get(key)!.push(att);
    }

    const dates = this.getDateRange(startDate, endDate);
    const results: any[] = [];

    for (const employee of employees) {
      for (const dateKey of dates) {
        const key = `${employee.id_employee}_${dateKey}`;
        const dayAttendances = attendanceMap.get(key) || [];

        const entrada = dayAttendances.find(a => a.type === 'Entrada');
        const salida = dayAttendances.find(a => a.type === 'Salida');

        results.push({
          name_employee: employee.name_employee,
          project: employee.project || '',
          date: dateKey,
          status: entrada ? 'En Obra' : 'Falta',
          entry_time: entrada ? entrada.hour : null,
          exit_time: salida ? salida.hour : null,
        });
      }
    }

    return results;
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const current = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}
