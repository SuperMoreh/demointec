
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { Id, Query, SubcategoriesRepository } from "../../domain/repository/subcategories.repository";
import { SubcategoriesEntity } from "../entity/subCategories.entity";
import { CategoriesEntity } from "../entity/categories.entity";



export class SubcategoriesAdapterRepository implements SubcategoriesRepository<SubcategoriesEntity> {
  
  private toPlainObject(entity: SubcategoriesEntity): any {
    return {
      id_subcategory: entity.id_subcategory,
      name_subcategory: entity.name_subcategory,
      c1: entity.c1,
      c2: entity.c2,
      status: entity.status,
      category_id: entity.category_id?.id_category ?? null,
    };
  }

  async create(data: Partial<SubcategoriesEntity>, query?: Query): Promise<SubcategoriesEntity> {
    const subcategoriesRepository = database.getRepository(SubcategoriesEntity);
    const roleRepository = database.getRepository(CategoriesEntity);
  
    const category = await roleRepository.findOneBy({ id_category: data.category_id as unknown as string });
    if (!category) throw new NotFound("La partida proporcionado no existe");

    const subcategories = subcategoriesRepository.create({
      ...data,
      category_id: category,
    });
    await subcategoriesRepository.save(subcategories);
    await this.createOnFirebase(subcategories)
    return subcategoriesRepository.findOneOrFail({
      where: { category_id: subcategories.category_id },
      relations: ['category_id'],
    });
 } 
  

 async list(query?: Query): Promise<any[]> {
    const repository = database.getRepository(SubcategoriesEntity);
    const result = await repository.find({ relations: ['category_id'] });
    return result.map((entity) => this.toPlainObject(entity));
  }

  
  async get(id: Id, query?: Query): Promise<any> {
    const repository = database.getRepository(SubcategoriesEntity);
    const entity = await repository.findOne({
      where: { id_subcategory: id as string },
      relations: ['category_id'],
    });

    if (!entity) {
      throw new NotFound("No existe la subcategoria con el id proporcionado");
    }

    return this.toPlainObject(entity);
  }

  
  async update(id: Id, data: Partial<SubcategoriesEntity>, query?: Query): Promise<SubcategoriesEntity> {
      const subcategoryRepository = database.getRepository(SubcategoriesEntity);
      const categoryRepository = database.getRepository(CategoriesEntity);
      if (data.category_id?.id_category) {
        const category = await categoryRepository.findOneBy({ id_category: data.category_id.id_category });
        if (!category) throw new NotFound("La partida proporcionado no existe");
        data.category_id = category;
      }
      await subcategoryRepository.update(id, data);
      const updated = await this.get(id);
      
      const existsInFirebase = await this.existsInFirebase(id.toString());
      
      if (existsInFirebase) {
        await this.updateOnFirebase(updated);
      } else {
        await this.createOnFirebase(updated);
      }
      
      return this.get(id);
  }
    
  async remove(id: Id, query?: Query): Promise<SubcategoriesEntity> {
      const repository = database.getRepository(SubcategoriesEntity);  
      const data = await this.get(id, query);
      await repository.update({ id_subcategory: id.toString()  }, { status: false });
      await this.deleteFromFirebase(id.toString())
      return data;
  }

  async syncToFirebase(): Promise<{ }> {
        const repository = database.getRepository(SubcategoriesEntity);
        const admin = require('firebase-admin');
        const firestore = admin.firestore();
    
        try {
        const snapshot = await firestore.collection('CatSubpartidas').get();
    
        for (const doc of snapshot.docs) {
          const firebaseData = doc.data();
          const firebaseId = doc.id;
    
          const newData = {
            name_subcategory: firebaseData.nombre || '',
            c1: firebaseData.c1 || '',
            c2: firebaseData.c2 || '',
            category_id: firebaseData.firebaseidPartida || 0
          };
    
          try {
            const existing = await repository.findOne({ where: { id_subcategory: firebaseId } });
    
            if (!existing) {
              const entity = repository.create({
                id_subcategory: firebaseId,
                ...newData,
                status: true
              });
              
              await repository.save(entity);
            } else {
              const hasChanges = 
                existing.name_subcategory !== newData.name_subcategory ||
                existing.c1 !== newData.c1 ||
                existing.c2 !== newData.c2 ||
                existing.category_id !== newData.category_id;
    
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

  private async createOnFirebase(body: SubcategoriesEntity): Promise<void> {
      const admin = require('firebase-admin');
      const firestore = admin.firestore(); 
      await firestore.collection('CatSubpartidas').doc(body.id_subcategory).set({
        firebaseid: body.id_subcategory,
        nombre: body.name_subcategory,
        firebaseidPartida: body.category_id.id_category,
        c1: body.c1,
        c2: body.c2
      });
  }
        
  private async updateOnFirebase(body: SubcategoriesEntity): Promise<void> {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
        await firestore.collection('CatSubpartidas').doc(body.id_subcategory).update({
          firebaseid: body.id_subcategory,
          nombre: body.name_subcategory,
          firebaseidPartida: body.category_id.id_category,
          c1: body.c1,
          c2: body.c2
        });
  }

  private async existsInFirebase(id: string): Promise<boolean> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
    try {
      const doc = await firestore.collection('CatSubpartidas').doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia en Firebase:', error);
      return false;
    }
  }

  private async deleteFromFirebase(id: string): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    await firestore.collection('CatSubpartidas').doc(id).delete();
  }

   
}