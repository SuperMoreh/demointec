import { Query, UserRepository, Id } from "../../domain/repository/users.repository";
import { UserEntity } from "../entity/users.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { RoleEntity } from "../entity/roles.entity";
import * as bcrypt from 'bcrypt';
import { Console } from "console"



export class UserAdapterRepository implements UserRepository<UserEntity> {

  async create(data: Partial<UserEntity>, imageBuffer?: Buffer, query?: Query): Promise<UserEntity> {
    const userRepository = database.getRepository(UserEntity);
    const roleRepository = database.getRepository(RoleEntity);

    const role = await roleRepository.findOneBy({ id_role: data.role_id as unknown as number });
    if (!role) throw new NotFound("El rol proporcionado no existe");

    const hashPassword = await bcrypt.hash(data.password!, 10);

    const user = userRepository.create({
      ...data,
      password: hashPassword,
      role_id: role,
      photo: imageBuffer, 
    });

    console.log(user)

    await userRepository.save(user);

    return userRepository.findOneOrFail({
      where: { id_user: user.id_user },
      relations: ['role_id'],
    });
  }

  

  async list(query?: Query): Promise<any[]> {
      const repository = database.getRepository(UserEntity);

      const users = await repository.find({
        relations: ['role_id'],
      });

      return users.map(user => ({
        id_user: user.id_user,
        name_user: user.name_user,
        email: user.email,
        password: user.password,
        phone: user.phone,
        photo: user.photo? `data:image/png;base64,${user.photo.toString('base64')}`: null,
        createdAt: user.createdAt,
        status: user.status,
        role_id: user.role_id.id_role, 
      }));
  }

  
    async get(id: Id): Promise<any> {
      const repository = database.getRepository(UserEntity);

      const user = await repository.findOne({
        where: { id_user: id as number },
        relations: ['role_id'],
      });

      if (!user) {
        throw new NotFound("No existe el usuario con el id proporcionado");
      }
      return {
        id_user: user.id_user,
        name_user: user.name_user,
        email: user.email,
        password: user.password,
        phone: user.phone,
        photo: user.photo? `data:image/png;base64,${user.photo.toString('base64')}`: null,
        createdAt: user.createdAt,
        status: user.status,
        role_id: user.role_id.id_role
      };
  }

  
   async update(id: Id, data: Partial<UserEntity>, imageBuffer?: Buffer, query?: Query): Promise<UserEntity> {
      const userRepository = database.getRepository(UserEntity);
      const roleRepository = database.getRepository(RoleEntity);

      delete data.createdAt;

      const existingUser = await userRepository.findOne({
        where: { id_user: Number(id) },
        relations: ['role_id'],
      });

      if (!existingUser) {
        throw new NotFound("El usuario no existe");
      }

      if (typeof data.role_id === 'number') {
        const role = await roleRepository.findOneBy({ id_role: data.role_id });
        if (!role) throw new NotFound("El rol proporcionado no existe");
        data.role_id = role; 
      } else {
        data.role_id = existingUser.role_id;
      }

      if (!data.password || data.password.trim() === '') {
        data.password = existingUser.password;
      } else {
        data.password = await bcrypt.hash(data.password, 10);
      }

      if (imageBuffer) {
        data.photo = imageBuffer;
      } else {
        data.photo = existingUser.photo;
      }

      if (typeof data.status === 'string') {
        data.status = data.status === 'true';
      } else if (typeof data.status !== 'boolean') {
        data.status = existingUser.status;
      }

      await userRepository.update(id, data);
      return this.get(id);
    }


    
    async remove(id: Id, query?: Query): Promise<UserEntity> {
      const userRepository = database.getRepository(UserEntity);
      const user = await this.get(id);
      await userRepository.update({ id_user: Number(id) }, { status: false });
      return user;
    }
}