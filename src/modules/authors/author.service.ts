import { ObjectId } from "mongodb";
import { Author, AuthorDTO } from "./author.model";
import { AuthorRepository } from "./author.repository";
import { BookRepository } from "../books/book.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";

export class AuthorService {

    private readonly authorRepository = new AuthorRepository();
    private readonly bookRepository = new BookRepository();

    async create(data: AuthorDTO): Promise<Author> {
        const name = this.requireString(data?.name, "name");
        const nationality = this.requireString(data?.nationality, "nationality");

        const now = new Date();
        const author: Omit<Author, "_id"> = {
            name,
            nationality,
            createdAt: now,
            updatedAt: now,
        };

        // birthYear es opcional: solo se guarda si viene en la petición
        if (data.birthYear !== undefined) {
            author.birthYear = this.positiveInteger(data.birthYear, "birthYear");
        }

        return this.authorRepository.create(author);
    }

    async findAll(): Promise<Author[]> {
        return this.authorRepository.findAll();
    }

    async findById(id: string): Promise<Author> {
        const author = await this.authorRepository.findById(this.toObjectId(id));
        if (!author) {
            throw new NotFoundError("Autor no encontrado");
        }
        return author;
    }

    async update(id: string, data: AuthorDTO): Promise<Author> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Author> = {};

        if (data?.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data?.nationality !== undefined) changes.nationality = this.requireString(data.nationality, "nationality");
        if (data?.birthYear !== undefined) changes.birthYear = this.positiveInteger(data.birthYear, "birthYear");

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }
        changes.updatedAt = new Date();

        const updated = await this.authorRepository.update(objectId, changes);
        if (!updated) {
            throw new NotFoundError("Autor no encontrado");
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);

        // Regla de negocio: no se puede eliminar un autor con libros asociados
        if (await this.bookRepository.existsByAuthorId(objectId)) {
            throw new BadRequestError("No se puede eliminar un autor que tiene libros asociados");
        }

        const deleted = await this.authorRepository.delete(objectId);
        if (!deleted) {
            throw new NotFoundError("Autor no encontrado");
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private positiveInteger(value: unknown, field: string): number {
        if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
            throw new BadRequestError(`El campo '${field}' debe ser un número entero positivo`);
        }
        return value;
    }

    private toObjectId(id: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(`Identificador inválido: ${id}`);
        }
        return new ObjectId(id);
    }
}