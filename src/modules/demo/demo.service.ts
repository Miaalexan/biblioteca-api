import { ObjectId } from "mongodb";
import { Demo, DemoDTO } from "./demo.model";
import { DemoRepository } from "./demo.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";

export class DemoService {

    private readonly demoRepository = new DemoRepository();

    async create(data: DemoDTO): Promise<Demo> {
        const name = this.requireString(data?.name, "name");
        const description = this.requireString(data?.description, "description");

        const now = new Date();
        return this.demoRepository.create({
            name,
            description,
            active: typeof data.active === "boolean" ? data.active : true,
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Demo[]> {
        return this.demoRepository.findAll();
    }

    async findById(id: string): Promise<Demo> {
        const demo = await this.demoRepository.findById(this.toObjectId(id));
        if (!demo) {
            throw new NotFoundError("Registro no encontrado");
        }
        return demo;
    }

    async update(id: string, data: DemoDTO): Promise<Demo> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Demo> = {};

        if (data.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data.description !== undefined) changes.description = this.requireString(data.description, "description");
        if (data.active !== undefined) {
            if (typeof data.active !== "boolean") {
                throw new BadRequestError("El campo 'active' debe ser booleano");
            }
            changes.active = data.active;
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }
        changes.updatedAt = new Date();

        const updated = await this.demoRepository.update(objectId, changes);
        if (!updated) {
            throw new NotFoundError("Registro no encontrado");
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.demoRepository.delete(this.toObjectId(id));
        if (!deleted) {
            throw new NotFoundError("Registro no encontrado");
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private toObjectId(id: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(`Identificador inválido: ${id}`);
        }
        return new ObjectId(id);
    }
}
