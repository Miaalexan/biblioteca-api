import { getDb } from "../../config/database";
import { Demo } from "./demo.model";
import { Collection, ObjectId } from "mongodb";

export class DemoRepository {

    private collection(): Collection<Demo> {
        return getDb().collection<Demo>("demo");
    }

    async create(data: Omit<Demo, "_id">): Promise<Demo> {
        const result = await this.collection().insertOne(data as Demo);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Demo[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Demo | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Demo>): Promise<Demo | null> {
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
