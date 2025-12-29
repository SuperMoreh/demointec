import { LoginRepository } from "../../domain/repository/login.repository";
import { UserEntity } from "../entity/users.entity";
import database from "../../../config/db";
import { NotFound, Unauthorized } from "http-errors";
import * as bcrypt from 'bcrypt';

export class LoginAdapterRepository implements LoginRepository<UserEntity> {
  async login(email: string, password: string): Promise<UserEntity> {
    const repository = database.getRepository(UserEntity);

    const user = await repository.findOne({
      where: { email },
      relations: ['role_id']
    });

    if (!user) {
      throw new NotFound("El usuario no existe");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Unauthorized("La contraseña es incorrecta");
    }

    return user;
  }
}

