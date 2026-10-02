import { ObjectId } from "mongodb";
import { Book, BookDTO, BookWithAuthor } from "./book.model";
import { BookRepository } from "./book.repository";
import { AuthorRepository } from "../authors/author.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";

export class BookService {

    private readonly bookRepository = new BookRepository();
    private readonly authorRepository = new AuthorRepository();

    async create(data: BookDTO): Promise<Book> {
        const title = this.requireString(data?.title, "title");
        const isbn = this.requireString(data?.isbn, "isbn");
        const authorId = this.toObjectId(this.requireString(data?.authorId, "authorId"), "authorId");

        await this.ensureAuthorExists(authorId);
        await this.ensureIsbnIsUnique(isbn);

        const now = new Date();
        const book: Omit<Book, "_id"> = {
            title,
            isbn,
            authorId,
            available: true,
            createdAt: now,
            updatedAt: now,
        };

        if (data.year !== undefined) {
            book.year = this.integer(data.year, "year");
        }
        if (data.available !== undefined) {
            book.available = this.boolean(data.available, "available");
        }

        return this.bookRepository.create(book);
    }

    async findAll(): Promise<BookWithAuthor[]> {
        return this.bookRepository.findAll();
    }

    async findById(id: string): Promise<Book> {
        const book = await this.bookRepository.findById(this.toObjectId(id, "id"));
        if (!book) {
            throw new NotFoundError("Libro no encontrado");
        }
        return book;
    }

    async update(id: string, data: BookDTO): Promise<Book> {
        const objectId = this.toObjectId(id, "id");
        const changes: Partial<Book> = {};

        if (data?.title !== undefined) changes.title = this.requireString(data.title, "title");

        if (data?.isbn !== undefined) {
            const isbn = this.requireString(data.isbn, "isbn");
            await this.ensureIsbnIsUnique(isbn, objectId);
            changes.isbn = isbn;
        }

        if (data?.authorId !== undefined) {
            const authorId = this.toObjectId(this.requireString(data.authorId, "authorId"), "authorId");
            await this.ensureAuthorExists(authorId);
            changes.authorId = authorId;
        }

        if (data?.year !== undefined) changes.year = this.integer(data.year, "year");
        if (data?.available !== undefined) changes.available = this.boolean(data.available, "available");

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }
        changes.updatedAt = new Date();

        const updated = await this.bookRepository.update(objectId, changes);
        if (!updated) {
            throw new NotFoundError("Libro no encontrado");
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.bookRepository.delete(this.toObjectId(id, "id"));
        if (!deleted) {
            throw new NotFoundError("Libro no encontrado");
        }
    }

    // ---------- Validación de relaciones ----------

    private async ensureAuthorExists(authorId: ObjectId): Promise<void> {
        const author = await this.authorRepository.findById(authorId);
        if (!author) {
            throw new BadRequestError("El autor indicado en 'authorId' no existe");
        }
    }

    private async ensureIsbnIsUnique(isbn: string, currentBookId?: ObjectId): Promise<void> {
        const existing = await this.bookRepository.findByIsbn(isbn);
        if (existing && !existing._id?.equals(currentBookId as ObjectId)) {
            throw new BadRequestError(`Ya existe un libro con el ISBN '${isbn}'`);
        }
    }

    // ---------- Validaciones de tipos ----------

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private integer(value: unknown, field: string): number {
        if (typeof value !== "number" || !Number.isInteger(value)) {
            throw new BadRequestError(`El campo '${field}' debe ser un número entero`);
        }
        return value;
    }

    private boolean(value: unknown, field: string): boolean {
        if (typeof value !== "boolean") {
            throw new BadRequestError(`El campo '${field}' debe ser booleano`);
        }
        return value;
    }

    private toObjectId(id: string, field: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(`Identificador inválido en '${field}': ${id}`);
        }
        return new ObjectId(id);
    }
}