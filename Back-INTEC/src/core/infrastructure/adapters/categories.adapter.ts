import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { CategoriesRepository } from "../../domain/repository/categories.repository";
import { CategoriesEntity } from "../entity/categories.entity";


export class CategoriesAdapterRepository implements CategoriesRepository<CategoriesEntity> {
  
  async create(data: Partial<CategoriesEntity>, query?: Query): Promise<CategoriesEntity> {
      const repository = database.getRepository(CategoriesEntity);
  
      const categorie = repository.create({
        ...data,
      });
      await repository.save(categorie);
      await this.createOnFirebase(categorie);
      return repository.findOneOrFail({
        where: { id_category: data.id_category },
  
      });
  }
    
  async list(query?: Query): Promise<CategoriesEntity[]> {
      const repository = database.getRepository(CategoriesEntity);
      return repository.find({
      });
  }
    
  async get(id: Id, query?: Query): Promise<CategoriesEntity> {
      const repository = database.getRepository(CategoriesEntity);
      const data = await repository.findOne({
      where: { id_category: id as string },
      });
      if (!data) {
        throw new NotFound("No existe el material con el id proporcionado");
      }
      return data;
  }
      
  async update(id: Id, data: Partial<CategoriesEntity>, query?: Query): Promise<CategoriesEntity> {
      const repository = database.getRepository(CategoriesEntity);
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
      
  async remove(id: Id, query?: Query): Promise<CategoriesEntity> {
        const repository = database.getRepository(CategoriesEntity);
        
        const data = await this.get(id, query);
        await repository.update({ id_category: id.toString()  }, { status: false });
        return data;
  }


  async syncToFirebase(): Promise<{ }> {
    const repository = database.getRepository(CategoriesEntity);
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
        try {
        const snapshot = await firestore.collection('CatPartidas').get();
    
        for (const doc of snapshot.docs) {
          const firebaseData = doc.data();
          const firebaseId = doc.id;
    
          const newData = {
            name_category: firebaseData.nombre || '',
          };
    
          try {
            const existing = await repository.findOne({ where: { id_category: firebaseId } });
    
            if (!existing) {
              const entity = repository.create({
                id_category: firebaseId,
                ...newData,
                status: true
              });
              
              await repository.save(entity);
            } else {
              const hasChanges = 
                existing.name_category !== newData.name_category 
              if (hasChanges) {
                Object.assign(existing, newData);
                await repository.save(existing);
              } 
            }
          } catch (error) {
            console.error(error);
          }
        }
    
        return {
        };
        } catch (error) {
          console.error('Error en sincronización:', error);
          throw error;
         }
  }

  private async createOnFirebase(body: CategoriesEntity): Promise<void> {
  const admin = require('firebase-admin');
  const firestore = admin.firestore();

  await firestore.collection('CatPartidas').doc(body.id_category).set({
    firebaseid: body.id_category,
    nombre: body.name_category
    });
  }

  private async existsInFirebase(id: string): Promise<boolean> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
    try {
      const doc = await firestore.collection('CatPartidas').doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia en Firebase:', error);
      return false;
    }
  }

  private async updateOnFirebase(body: CategoriesEntity): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    await firestore.collection('CatPartidas').doc(body.id_category).update({
      firebaseid: body.id_category,
      nombre: body.name_category,
    });
  }

     
}