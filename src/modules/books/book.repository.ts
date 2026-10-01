import { getDb } from "../../config/database";
import { Book } from "./book.model";
import { Collection, ObjectId } from "mongodb";

export class BookRepository {

    private collection(): Collection<Book> {
        return getDb().collection<Book>("books");
    }

    async create(data: Omit<Book, "_id">): Promise<Book> {
        const result = await this.collection().insertOne(data as Book);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Book[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Book | null> {
        return this.collection().findOne({ _id: id });
    }

    async findByIsbn(isbn: string): Promise<Book | null> {
        return this.collection().findOne({ isbn });
    }

    /** Indica si el autor tiene al menos un libro asociado. */
    async existsByAuthorId(authorId: ObjectId): Promise<boolean> {
        const count = await this.collection().countDocuments({ authorId }, { limit: 1 });
        return count > 0;
    }

    async update(id: ObjectId, changes: Partial<Book>): Promise<Book | null> {
        const result = await this.collection().findOneAndUpdate(
            { _id: id },
            { $set: changes },
            { returnDocument: "after" }
        );
        return result ?? null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}