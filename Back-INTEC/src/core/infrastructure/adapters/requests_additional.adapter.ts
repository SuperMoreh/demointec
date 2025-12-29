import { Query, Id } from "../../domain/repository/requests_additional.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { RequestsAdditionalEntity } from "../entity/requests_additional.entity";
import { RequestsAdditionalRepository } from "../../domain/repository/requests_additional.repository";
import { db } from "../../../firebase/firebase.config";



export class RequestsAdditionalAdapterRepository implements RequestsAdditionalRepository<RequestsAdditionalEntity> {
  
  async create(data: Partial<RequestsAdditionalEntity>[] | Partial<RequestsAdditionalEntity>): Promise<RequestsAdditionalEntity[] | RequestsAdditionalEntity> {
    const repository = database.getRepository(RequestsAdditionalEntity);

    const materiales: RequestsAdditionalEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      materiales.push(entity);
    }

    await this.incrementFolioRequest();

    await this.createOnFirestore(materiales);

    return Array.isArray(data) ? materiales : materiales[0];
  }

    
  async list(query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    return repository.find({
    });
  }
    
  async get(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    const data = await repository.find({
      where: { id_detail: id as string },
    });
    if (!data.length) {
      throw new NotFound("No existen materiales adicionales con el id_detail proporcionado");
    }
    return data;
  }

      
  async update(data: Partial<RequestsAdditionalEntity>[], query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    const updatedMaterials: RequestsAdditionalEntity[] = [];
    const toCreate: RequestsAdditionalEntity[] = [];
    const toUpdate: RequestsAdditionalEntity[] = [];

    try {
      for (const item of data) {
        if (!item.id_detail) {
          throw new Error('Cada material adicional debe tener su id_detail para poder actualizar');
        }

        if (!item.id) {
          throw new Error('Cada material adicional debe tener su id para poder actualizar');
        }

        const existingRecord = await repository.findOne({ 
          where: { id: item.id } 
        });

        if (!existingRecord) {
          throw new Error(`No se encontró el detalle adicional con id: ${item.id}`);
        }

        const updatedEntity = repository.create(item);
        await repository.save(updatedEntity);
        
        const updatedRecord = await repository.findOne({ where: { id: item.id } });
        if (updatedRecord) {
          updatedMaterials.push(updatedRecord);
        }
        
        const existsInRTDB = await this.existsInFirestore(item.id_detail);
        
        if (existsInRTDB) {
          if (updatedRecord) toUpdate.push(updatedRecord);
        } else {
          if (updatedRecord) toCreate.push(updatedRecord);
        }
      }

      if (toCreate.length > 0) {
        await this.createOnFirestore(toCreate);
      }
      
      if (toUpdate.length > 0) {
        await this.updateOnFirestore(toUpdate);
      }
      
      return updatedMaterials;
    } catch (error) {
      console.error('Error en update del adapter de adicionales:', error);
      throw error;
    }
  }


      
  async remove(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]> {
  const repository = database.getRepository(RequestsAdditionalEntity);
  const data = await this.get(id, query);

  if (!data.length) {
    throw new Error("No se encontraron detalles adicionales con el ID proporcionado");
  }

  await repository.update({ id_detail: id.toString() }, { status: false });
  await this.deleteFromFirestore(id.toString());

  return data;
}

  async getCurrentFolio(): Promise<number> {
    try {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      const doc = await firestore.collection('Catalogos').doc('FoliosAdicionales').get();
      const data = doc.exists ? doc.data() || {} : {};
      const rawValue = (data && (data.Valor ?? data.SolicitudesAdicionales)) as number | string | undefined;
      const currentFolio = Number(rawValue) || 0;

      const nextFolio = currentFolio + 1;
      console.log(`Folio adicional actual en Firestore: ${currentFolio}, retornando: ${nextFolio}`);
      return nextFolio;
    } catch (error) {
      console.error('Error al obtener el folio adicional actual:', error);
      throw new Error('No se pudo obtener el folio adicional actual');
    }
  }


  async syncToFirebase(): Promise<{ success: boolean }> {
    const repository = database.getRepository(RequestsAdditionalEntity);

    try {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      const [seccionesSnapshot, itemsGroupSnapshot] = await Promise.all([
        firestore.collection('SolicitudesCom').get(),
        firestore.collectionGroup('items').get()
      ]);

      const seccionIds = new Set<string>();
      for (const doc of seccionesSnapshot.docs) {
        if (doc.id) seccionIds.add(doc.id);
      }
      for (const itemDoc of itemsGroupSnapshot.docs) {
        const parent = itemDoc.ref.parent.parent;
        if (parent?.id) seccionIds.add(parent.id);
      }

      const idsToProcess = Array.from(seccionIds).filter((id) => id.startsWith('A'));
      if (idsToProcess.length === 0) {
        console.log('No se encontraron secciones A para sincronizar.');
        return { success: false };
      }

      const operaciones: Promise<void>[] = [];

      for (const seccionId of idsToProcess) {
        const itemsSnapshot = await firestore
          .collection('SolicitudesCom')
          .doc(seccionId)
          .collection('items')
          .get();

        for (const itemDoc of itemsSnapshot.docs) {
          const item = itemDoc.data();

          if (!item) continue;

          const newData = {
            name: item.nombre || '',
            code: item.codigo || '',
            c1: item.c1 || '',
            c2: item.c2 || '',
            amount: item.cantidad || '',
            unit_cost: item.costoUnit || '',
            folio_request: item.folioSol || '',
            description: item.descripcion || '',
            observation: item.observaciones || '',
            category1: item.categoria || '',
            category: item.partida || '',
            subcategory: item.subpartida || '',
            unit: item.unidad || 0
          };

          operaciones.push(
            (async () => {
              try {
                const existing = await repository.findOne({ where: { id_detail: seccionId } });

                if (!existing) {
                  const entity = repository.create({
                    id_detail: seccionId,
                    ...newData,
                    status: true
                  });

                  await repository.save(entity);
                } else {
                  const hasChanges =
                    existing.name !== newData.name ||
                    existing.code !== newData.code ||
                    existing.amount !== newData.amount ||
                    existing.c1 !== newData.c1 ||
                    existing.c2 !== newData.c2 ||
                    existing.unit !== newData.unit ||
                    existing.unit_cost !== newData.unit_cost ||
                    existing.description !== newData.description ||
                    existing.observation !== newData.observation ||
                    existing.category1 !== newData.category1 ||
                    existing.category !== newData.category ||
                    existing.subcategory !== newData.subcategory ||
                    existing.folio_request !== newData.folio_request;

                  if (hasChanges) {
                    Object.assign(existing, newData);
                    await repository.save(existing);
                  }
                }
              } catch (error) {
                console.error(`Error procesando sección adicional ${seccionId}:`, error);
              }
            })()
          );
        }
      }

      await Promise.all(operaciones);
      return { success: true };
    } catch (error) {
      console.error('Error en sincronización de materiales adicionales (Firestore):', error);
      throw error;
    }
  }

  private async createOnFirestore(materiales: RequestsAdditionalEntity[]): Promise<void> {
    if (materiales.length === 0) return;

    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    const groupByIdDetail: Record<string, RequestsAdditionalEntity[]> = {};

    for (const material of materiales) {
      if (!material.id_detail) {
        throw new Error('id_detail es requerido en cada material adicional');
      }
      if (!groupByIdDetail[material.id_detail]) {
        groupByIdDetail[material.id_detail] = [];
      }
      groupByIdDetail[material.id_detail].push(material);
    }

    for (const [idDetail, items] of Object.entries(groupByIdDetail)) {
      const seccionRef = firestore.collection('SolicitudesCom').doc(idDetail);
      await seccionRef.set(
        { _createdAt: require('firebase-admin').firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      const itemsRef = seccionRef.collection('items');
      const existing = await itemsRef.get();

      let index = existing.size > 0 ? existing.size + 1 : 1;

      for (const material of items) {
        const data = {
          nombre: String(material.name || ''),
          cantidad: String(material.amount ?? ''),
          codigo: String(material.code || ''),
          c1: String(material.c1 || ''),
          c2: String(material.c2 || ''),
          unidad: String(material.unit || ''),
          costoUnit: String(material.unit_cost ?? ''),
          descripcion: String(material.description || ''),
          observaciones: String(material.observation || ''),
          folioSol: String(material.folio_request || ''),
          categoria: String(material.category1 || ''),
          partida: String(material.category || ''),
          subpartida: String(material.subcategory || ''),
        };

        const docId = `item${index}`;
        await itemsRef.doc(docId).set(data);
        index++;
      }
    }
  }

  private async updateOnFirestore(materiales: RequestsAdditionalEntity[]): Promise<void> {
    if (!materiales.length) return;

    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    const groupBySeccion: Record<string, RequestsAdditionalEntity[]> = {};

    for (const mat of materiales) {
      if (!mat.id_detail) {
        throw new Error('id_detail es requerido para actualizar en Firebase adicionales');
      }

      if (!groupBySeccion[mat.id_detail]) {
        groupBySeccion[mat.id_detail] = [];
      }

      groupBySeccion[mat.id_detail].push(mat);
    }

    for (const [seccion, mats] of Object.entries(groupBySeccion)) {
      const seccionRef = firestore.collection('SolicitudesCom').doc(seccion);
      const existDoc = await seccionRef.get();
      if (!existDoc.exists) {
        await seccionRef.set(
          { _createdAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
      const itemsRef = seccionRef.collection('items');

      for (let i = 0; i < mats.length; i++) {
        const mat = mats[i];
        const data = {
          nombre: String(mat.name || ''),
          c1: String(mat.c1 || ''),
          c2: String(mat.c2 || ''),
          costoUnit: String(mat.unit_cost ?? ''),
          cantidad: String(mat.amount ?? ''),
          descripcion: String(mat.description || ''),
          observaciones: String(mat.observation || ''),
          folioSol: String(mat.folio_request || ''),
          codigo: String(mat.code || ''),
          categoria: String(mat.category1 || ''),
          partida: String(mat.category || ''),
          subpartida: String(mat.subcategory || ''),
          unidad: String(mat.unit || '')
        };

        const docId = `item${i + 1}`;
        await itemsRef.doc(docId).set(data);
      }
    }
  }


  private async existsInFirestore(id: string): Promise<boolean> {
    try {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      const doc = await firestore.collection('SolicitudesCom').doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia adicional en Firestore:', error);
      return false;
    }
  }

  private async incrementFolioRequest(): Promise<void> {
    try {
      const admin = require('firebase-admin');
      const firestore = admin.firestore();
      const docRef = firestore.collection('Catalogos').doc('FoliosAdicionales');
      const snapshot = await docRef.get();
      const data = snapshot.exists ? snapshot.data() || {} : {};
      const rawValue = (data && (data.Valor ?? data.SolicitudesAdicionales)) as number | string | undefined;
      const currentFolio = Number(rawValue) || 0;
      const newFolio = currentFolio + 1;

      await docRef.set({ Valor: newFolio }, { merge: true });

      console.log(`Folio adicional incrementado de ${currentFolio} a ${newFolio} en Firestore`);
    } catch (error) {
      console.error('Error al incrementar el folio adicional (Firestore):', error);
      throw new Error('No se pudo incrementar el folio de la solicitud adicional');
    }
  }

  private async deleteFromFirestore(id_detail: string, materialKey?: string): Promise<void> {
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    if (materialKey) {
      await firestore.collection('SolicitudesCom').doc(id_detail).collection('items').doc(materialKey).delete();
      return;
    }

    await firestore.collection('SolicitudesCom').doc(id_detail).delete();
  }
   
}



