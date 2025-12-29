import AppDataSource from "../../../config/db";
import { JobDescriptionEntity } from "../entity/job-description.entity";

export class JobDescriptionAdapter {
    private repository = AppDataSource.getRepository(JobDescriptionEntity);

    async getAll() {
        return await this.repository.find({ where: { status: true } });
    }

    async getById(id: number) {
        return await this.repository.findOne({ where: { id, status: true } });
    }

    async create(data: Partial<JobDescriptionEntity>) {
        const newJob = this.repository.create(data);
        return await this.repository.save(newJob);
    }

    async update(id: number, data: Partial<JobDescriptionEntity>) {
        const job = await this.getById(id);
        if (!job) return null;
        this.repository.merge(job, data);
        return await this.repository.save(job);
    }

    async delete(id: number) {
        const job = await this.getById(id);
        if (!job) return null;
        job.status = false;
        return await this.repository.save(job);
    }
}
