import { getDb } from "../../config/database";
import { Book, BookWithAuthor } from "./book.model";
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

    private authorLookupStages(): object[] {
        return [
            {
                $lookup: {
                    from: "authors",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author",
                },
            },
            {
                $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                // Se omite authorId de la respuesta: el autor ya viene embebido.
                $project: { authorId: 0 },
            },
        ];
    }
 

    async findAllWithAuthor(): Promise<BookWithAuthor[]> {
        return this.collection()
            .aggregate<BookWithAuthor>([
                ...this.authorLookupStages(),
                { $sort: { createdAt: -1 } },
            ])
            .toArray();
    }

    async findByIdWithAuthor(id: ObjectId): Promise<BookWithAuthor | null> {
        const result = await this.collection()
            .aggregate<BookWithAuthor>([
                { $match: { _id: id } },
                ...this.authorLookupStages(),
            ])
            .toArray();
        return result[0] ?? null;
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