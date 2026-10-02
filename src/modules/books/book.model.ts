import { ObjectId } from "mongodb";
import { Author } from "../authors/author.model";

export interface Book {
    _id?: ObjectId;
    title: string;
    isbn: string;
    authorId: ObjectId;
    year?: number;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookWithAuthor extends Omit<Book, "authorId"> {
    author: Author | null;
}
export interface BookDTO {
    title?: string;
    isbn?: string;
    authorId?: string;
    year?: number;
    available?: boolean;
}

