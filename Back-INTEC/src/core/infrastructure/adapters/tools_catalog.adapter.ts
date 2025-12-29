import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { ToolsRepository } from "../../domain/repository/tools_catalog.repository";
import { ToolsEntity } from "../entity/tools_catalog.entity";



export class ToolsAdapterRepository implements ToolsRepository<ToolsEntity> {
  
  async create(data: Partial<ToolsEntity>, query?: Query): Promise<ToolsEntity> {
      const repository = database.getRepository(ToolsEntity);
  
      const tools = repository.create({
        ...data,
      });
      await repository.save(tools);
      await this.createOnFirebase(tools);
      return repository.findOneOrFail({
        where: { id_tool: data.id_tool },
  
      });
  }
    
  async list(query?: Query): Promise<ToolsEntity[]> {
        const repository = database.getRepository(ToolsEntity);
        return repository.find({
        });
  }
    
  async get(id: Id, query?: Query): Promise<ToolsEntity> {
        const repository = database.getRepository(ToolsEntity);
        const data = await repository.findOne({
          where: { id_tool: id as string },
        });
        if (!data) {
          throw new NotFound("No existe la asistencia con el id proporcionado");
        }
        return data;
  }
      
  async update(id: Id, data: Partial<ToolsEntity>, query?: Query): Promise<ToolsEntity> {
        const repository = database.getRepository(ToolsEntity);
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
      
  async remove(id: Id, query?: Query): Promise<ToolsEntity> {
        const repository = database.getRepository(ToolsEntity);
        const data = await this.get(id, query);
        await repository.update({ id_tool: id.toString()  }, { status: false });
        await this.deleteFromFirebase(id.toString())
        return data;
  }

    
  async syncToFirebase(): Promise<{ }> {
        const repository = database.getRepository(ToolsEntity);
        const admin = require('firebase-admin');
        const firestore = admin.firestore();
    
        try {
        const snapshot = await firestore.collection('CatHerramientas').get();
    
        for (const doc of snapshot.docs) {
          const firebaseData = doc.data();
          const firebaseId = doc.id;
    
          const newData = {
            name_tool: firebaseData.nombre || '',
            code: firebaseData.codigo || '',
            description: firebaseData.descripcion || '',
            image: firebaseData.foto || 'Sin foto'
          };
    
          try {
            const existing = await repository.findOne({ where: { id_tool: firebaseId } });
    
            if (!existing) {
              const entity = repository.create({
                id_tool: firebaseId,
                ...newData,
                status: true
              });
              
              await repository.save(entity);
            } else {
              const hasChanges = 
                existing.name_tool !== newData.name_tool ||
                existing.code !== newData.code ||
                existing.description !== newData.name_tool ||
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

  private async createOnFirebase(body: ToolsEntity): Promise<void> {
        const admin = require('firebase-admin');
        const firestore = admin.firestore(); 
        await firestore.collection('CatHerramientas').doc(body.id_tool).set({
          firebaseid: body.id_tool,
          nombre: body.name_tool,
          codigo: body.code,
          descripcion: body.description,
          foto: body.image
        });
    }
          
    private async updateOnFirebase(body: ToolsEntity): Promise<void> {
        const admin = require('firebase-admin');
        const firestore = admin.firestore();
          await firestore.collection('CatHerramientas').doc(body.id_tool).update({
          firebaseid: body.id_tool,
          nombre: body.name_tool,
          codigo: body.code,
          descripcion: body.description,
          foto: body.image
          });
    }
  
    private async existsInFirebase(id: string): Promise<boolean> {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      
      try {
        const doc = await firestore.collection('CatHerramientas').doc(id).get();
        return doc.exists;
      } catch (error) {
        console.error('Error al verificar existencia en Firebase:', error);
        return false;
      }
    }

    private async deleteFromFirebase(id: string): Promise<void> {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      await firestore.collection('CatHerramientas').doc(id).delete();
    }
     
}