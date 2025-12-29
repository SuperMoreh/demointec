import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { ProjectsRepository } from "../../domain/repository/projects_catalog.repository";
import { ProjectEntity } from "../entity/projects_catalog.entity";


export class ProjectsAdapterRepository implements ProjectsRepository<ProjectEntity> {
  
  async create(data: Partial<ProjectEntity>, query?: Query): Promise<ProjectEntity> {
      const repository = database.getRepository(ProjectEntity);
  
      const project = repository.create({
        ...data,
      });
      await repository.save(project);
      await this.createOnFirebase(project);
      return repository.findOneOrFail({
        where: { id_project: data.id_project },
  
      });
  }
    
  async list(query?: Query): Promise<ProjectEntity[]> {
        const repository = database.getRepository(ProjectEntity);
        return repository.find({
        });
  }
    
  async get(id: Id, query?: Query): Promise<ProjectEntity> {
        const repository = database.getRepository(ProjectEntity);
        const data = await repository.findOne({
          where: { id_project: id as string },
        });
        if (!data) {
          throw new NotFound("No existe el proyecto con el id proporcionado");
        }
        return data;
  }
      
  async update(id: Id, data: Partial<ProjectEntity>, query?: Query): Promise<ProjectEntity> {
        const repository = database.getRepository(ProjectEntity);
        await repository.update(id, data);
        const updated = await this.get(id);
        
        // Verificar si existe en Firebase
        const existsInFirebase = await this.existsInFirebase(id.toString());
        
        if (existsInFirebase) {
          await this.updateOnFirebase(updated);
        } else {
          await this.createOnFirebase(updated);
        }
        
        return this.get(id);
  }
      
  async remove(id: Id, query?: Query): Promise<ProjectEntity> {
        const repository = database.getRepository(ProjectEntity);
        const data = await this.get(id, query);
        await repository.update({ id_project: id.toString()  }, { status: false });
        await this.deleteFromFirebase(id.toString());
        return data;
  }

  async syncToFirebase(): Promise<{ sincronizados: number; existentes: number; mensaje: string }> {
      const repository = database.getRepository(ProjectEntity);
      const admin = require('firebase-admin');
      const firestore = admin.firestore();

      try {
        const snapshot = await firestore.collection('CatObras').get();

        if (snapshot.empty) {
          return { sincronizados: 0, existentes: 0, mensaje: 'No se encontraron proyectos en Firestore.' };
        }

        let sincronizados = 0;
        let existentes = 0;

        for (const doc of snapshot.docs) {
          const item = doc.data();
          const firebaseid = doc.id;

          try {
            const existing = await repository.findOne({ where: { id_project: firebaseid } });

            if (!existing) {
              const entity = repository.create({
                id_project: firebaseid,
                name_project: item.nombre || '',
                locationType: item.flocal || '',
                locality: item.localidad || '',
                official: item.oficial || '',
                status: true,
              });

              await repository.save(entity);
              sincronizados++;
            } else {
              existentes++;
            }
          } catch (_) {
            console.error(error);
          }
        }

        return {
          sincronizados,
          existentes,
          mensaje: `Sincronización completada: ${sincronizados} nuevas, ${existentes} existentes.`
        };
      } catch (error) {
        console.error(error)
        throw error;
      }
  }


    
  private async createOnFirebase(body: ProjectEntity): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
      
    await firestore.collection('CatObras').doc(body.id_project).set({
      firebaseid: body.id_project,
      nombre: body.name_project,
      flocal: body.locationType,
      localidad: body.locality,
      oficial: body.official
    });
  }
      
  private async updateOnFirebase(body: ProjectEntity): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
      
      await firestore.collection('CatObras').doc(body.id_project).update({
        firebaseid: body.id_project,
        nombre: body.name_project,
        flocal: body.locationType,
        localidad: body.locality,
        oficial: body.official
      });
  }

   private async existsInFirebase(id: string): Promise<boolean> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
    try {
      const doc = await firestore.collection('CatObras').doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia en Firebase:', error);
      return false;
    }
  }

   private async deleteFromFirebase(id: string): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    await firestore.collection('CatObras').doc(id).delete();
  }

    
     
}