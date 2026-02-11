import { AppDataSource } from "../../../config/db";
import { CommitteeDocumentEntity } from "../entity/committee-documents.entity";
import { storage } from "../../../firebase/firebase.config";

export class CommitteeDocumentsAdapter {
    async getAllDocuments(): Promise<CommitteeDocumentEntity[]> {
        const repository = AppDataSource.getRepository(CommitteeDocumentEntity);
        return await repository.find();
    }

    async getDocumentsByType(documentType: string): Promise<CommitteeDocumentEntity[]> {
        const repository = AppDataSource.getRepository(CommitteeDocumentEntity);
        return await repository.find({
            where: { document_type: documentType }
        });
    }

    async saveDocument(data: Partial<CommitteeDocumentEntity>): Promise<CommitteeDocumentEntity> {
        const repository = AppDataSource.getRepository(CommitteeDocumentEntity);
        const doc = repository.create(data);
        return await repository.save(doc);
    }

    async deleteDocument(id: number): Promise<void> {
        const repository = AppDataSource.getRepository(CommitteeDocumentEntity);
        const document = await repository.findOne({ where: { id } });
        if (document && document.document_path) {
            const decodedUrl = decodeURIComponent(document.document_path);
            const filePath = decodedUrl.split('/o/')[1]?.split('?')[0];
            if (filePath) {
                try {
                    await storage.file(decodeURIComponent(filePath)).delete();
                } catch (e) {
                    
                }
            }
        }
        await repository.delete(id);
    }
}
