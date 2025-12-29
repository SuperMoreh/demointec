import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { MateralsRepository } from "../../domain/repository/materials_catalog.repository";
import { MaterialEntity } from "../entity/materials_catalog.entity";

export class MaterialsAdapterRepository implements MateralsRepository<MaterialEntity> {
  
   async create(data: Partial<MaterialEntity>, query?: Query): Promise<MaterialEntity> {
      const repository = database.getRepository(MaterialEntity);
  
      const material = repository.create({
        ...data,
      });
      await repository.save(material);
      await this.createOnFirebase(material);
      return repository.findOneOrFail({
        where: { id_material: data.id_material },
  
      });
    }
    
      async list(query?: Query): Promise<MaterialEntity[]> {
        const repository = database.getRepository(MaterialEntity);
        return repository.find({
        });
      }
    
      async get(id: Id, query?: Query): Promise<MaterialEntity> {
        const repository = database.getRepository(MaterialEntity);
        const data = await repository.findOne({
          where: { id_material: id as string },
        });
        if (!data) {
          throw new NotFound("No existe el material con el id proporcionado");
        }
        return data;
      }
      
      async update(id: Id, data: Partial<MaterialEntity>, query?: Query): Promise<MaterialEntity> {
        const repository = database.getRepository(MaterialEntity);
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
      
      async remove(id: Id, query?: Query): Promise<MaterialEntity> {
        const repository = database.getRepository(MaterialEntity);
        const data = await this.get(id, query);
        await repository.update({ id_material: id.toString()  }, { status: false });
        await this.deleteFromFirebase(id.toString())
        return data;
      }

    async syncToFirebase(): Promise<{ }> {
    const repository = database.getRepository(MaterialEntity);
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    try {
    const snapshot = await firestore.collection('CatMateriales').get();

    for (const doc of snapshot.docs) {
      const firebaseData = doc.data();
      const firebaseId = doc.id;

      const newData = {
        name_material: firebaseData.nombre || '',
        code: firebaseData.codigo || '',
        c1: firebaseData.c1 || '',
        c2: firebaseData.c2 || '',
        category: firebaseData.partida || '',
        subcategory: firebaseData.subpartida || '',
        unit: firebaseData.unidad || 0,
        image: firebaseData.foto || 'Sin foto'
      };

      try {
        const existing = await repository.findOne({ where: { id_material: firebaseId } });

        if (!existing) {
          const entity = repository.create({
            id_material: firebaseId,
            ...newData,
            status: true
          });
          
          await repository.save(entity);
        } else {
          const hasChanges = 
            existing.name_material !== newData.name_material ||
            existing.code !== newData.code ||
            existing.c1 !== newData.c1 ||
            existing.c2 !== newData.c2 ||
            existing.category !== newData.category ||
            existing.subcategory !== newData.subcategory ||
            existing.unit !== newData.unit ||
            existing.image !== newData.image;

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

   private async createOnFirebase(body: MaterialEntity): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
  
    await firestore.collection('CatMateriales').doc(body.id_material).set({
      firebaseid: body.id_material,
      nombre: body.name_material,
      c1: body.c1,
      c2: body.c2,
      codigo: body.code,
      foto: body.image,
      partida:body.category,
      subpartida: body.subcategory,
      unidad: body.unit
      });
    }
  
    private async updateOnFirebase(body: MaterialEntity): Promise<void> {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
  
      await firestore.collection('CatMateriales').doc(body.id_material).update({
        firebaseid: body.id_material,
        nombre: body.name_material,
        c1: body.c1,
        c2: body.c2,
        codigo: body.code,
        foto: body.image,
        partida:body.category,
        subpartida: body.subcategory,
        unidad: body.unit
      });
  }

  private async existsInFirebase(id: string): Promise<boolean> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
    try {
      const doc = await firestore.collection('CatMateriales').doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia en Firebase:', error);
      return false;
    }
  }

  private async deleteFromFirebase(id: string): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    await firestore.collection('CatMateriales').doc(id).delete();
  }


    
     
}