import { ObjectId } from "mongodb";
import { Loan, LoanDTO } from "./loans.model";
import { LoanRepository } from "./loans.repository";
import { BookRepository } from "../books/book.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";

export class LoanService {

    private readonly loanRepository = new LoanRepository();
    private readonly bookRepository = new BookRepository();

    async create(data: LoanDTO): Promise<Loan> {
        const userName = this.requireString(data?.userName, "userName");
        const loanDate = this.parseDate(data?.loanDate, "loanDate", true);
        const bookId = this.toObjectId(this.requireString(data?.bookId, "bookId"), "bookId");

        // Relación: el libro debe existir
        const book = await this.bookRepository.findById(bookId);
        if (!book) {
            throw new BadRequestError("El libro indicado en 'bookId' no existe");
        }

        // Regla de negocio: el libro debe estar disponible
        if (!book.available) {
            throw new BadRequestError("El libro no está disponible para préstamo");
        }

        const now = new Date();
        const loan = await this.loanRepository.create({
            bookId,
            userName,
            loanDate: loanDate as Date,
            returned: false,
            createdAt: now,
            updatedAt: now,
        });

        // Regla de negocio: al prestarlo, el libro pasa a no disponible
        await this.bookRepository.update(bookId, { available: false, updatedAt: new Date() });

        return loan;
    }

    async findAll(): Promise<Loan[]> {
        return this.loanRepository.findAll();
    }

    async findById(id: string): Promise<Loan> {
        const loan = await this.loanRepository.findById(this.toObjectId(id, "id"));
        if (!loan) {
            throw new NotFoundError("Préstamo no encontrado");
        }
        return loan;
    }

    async update(id: string, data: LoanDTO): Promise<Loan> {
        const objectId = this.toObjectId(id, "id");
        const loan = await this.loanRepository.findById(objectId);
        if (!loan) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        if (data?.bookId !== undefined) {
            throw new BadRequestError("No se puede cambiar el libro de un préstamo; elimínalo y crea uno nuevo");
        }

        const changes: Partial<Loan> = {};

        if (data?.userName !== undefined) changes.userName = this.requireString(data.userName, "userName");
        if (data?.loanDate !== undefined) changes.loanDate = this.parseDate(data.loanDate, "loanDate", true) as Date;

        // Devolución
        let justReturned = false;
        if (data?.returned !== undefined) {
            if (typeof data.returned !== "boolean") {
                throw new BadRequestError("El campo 'returned' debe ser booleano");
            }
            if (data.returned === false && loan.returned) {
                throw new BadRequestError("No se puede reabrir un préstamo que ya fue devuelto");
            }
            if (data.returned === true && !loan.returned) {
                justReturned = true;
                changes.returned = true;
                // Regla de negocio: al devolver se asigna returnDate
                changes.returnDate = this.parseDate(data.returnDate, "returnDate", false) ?? new Date();
            }
        }

        // returnDate solo tiene sentido si el préstamo está (o queda) devuelto
        if (data?.returnDate !== undefined && !justReturned) {
            if (!loan.returned) {
                throw new BadRequestError("'returnDate' solo se asigna al marcar el préstamo como devuelto");
            }
            changes.returnDate = this.parseDate(data.returnDate, "returnDate", true) as Date;
        }

        // Coherencia de fechas
        const finalLoanDate = changes.loanDate ?? loan.loanDate;
        const finalReturnDate = changes.returnDate ?? loan.returnDate;
        if (finalReturnDate && finalReturnDate < finalLoanDate) {
            throw new BadRequestError("'returnDate' no puede ser anterior a 'loanDate'");
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No se enviaron campos para actualizar");
        }
        changes.updatedAt = new Date();

        const updated = await this.loanRepository.update(objectId, changes);
        if (!updated) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        // Regla de negocio: al devolver, el libro vuelve a estar disponible
        if (justReturned) {
            await this.bookRepository.update(loan.bookId, { available: true, updatedAt: new Date() });
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id, "id");
        const loan = await this.loanRepository.findById(objectId);
        if (!loan) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        await this.loanRepository.delete(objectId);

        // Si el préstamo seguía activo, se libera el libro
        if (!loan.returned) {
            await this.bookRepository.update(loan.bookId, { available: true, updatedAt: new Date() });
        }
    }

    // ---------- Validaciones ----------

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private parseDate(value: unknown, field: string, required: boolean): Date | undefined {
        if (value === undefined || value === null) {
            if (required) {
                throw new BadRequestError(`El campo '${field}' es obligatorio`);
            }
            return undefined;
        }
        if (typeof value !== "string") {
            throw new BadRequestError(`El campo '${field}' debe ser una fecha válida (ej: 2026-10-01)`);
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestError(`El campo '${field}' debe ser una fecha válida (ej: 2026-10-01)`);
        }
        return date;
    }

    private toObjectId(id: string, field: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(`Identificador inválido en '${field}': ${id}`);
        }
        return new ObjectId(id);
    }
}