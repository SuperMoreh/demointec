import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { LoginRepository } from "../../../domain/repository/login.repository";
import { UserEntity } from "../../entity/users.entity";
import database from "../../../../config/db";
import { EmployeeEntity } from "../../entity/employees.entity";

config();

export class LoginController {
  constructor(private loginRepository: LoginRepository<UserEntity>) { }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.loginRepository.login(email, password);

      const token = jwt.sign(
        { id: user.id_user, email: user.email },
        process.env.SECRET_KEY!,
        { expiresIn: '8h' }
      );

      res.status(200).json({
        msg: 'Login exitoso',
        token,
        user: {
          name: user.name_user,
          email: user.email,
          role_id: user.role_id.name_role,
          photo: user.photo ? `data:image/png;base64,${user.photo.toString('base64')}` : null,
          pPermisosVacaciones: '0' // Default
        };

        // Fetch Employee Permissions
        const employeeRepo = database.getRepository(EmployeeEntity);
        const employee = await employeeRepo.findOne({ where: { email: user.email } });

        if(employee) {
          responseUser.pPermisosVacaciones = employee.pPermisosVacaciones;
          // Map other permissions if needed
          // responseUser.pAut1 = employee.pAut1;
        }

        res.status(200).json({
          msg: 'Login exitoso',
          token,
          user: responseUser
        });

      } catch (error: any) {
        console.error('Error en login:', error);
        res.status(error.status || 500).json({ message: error.message });
      }
    }
}
