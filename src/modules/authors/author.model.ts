import { ObjectId } from "mongodb";

export interface Author {
    _id?: ObjectId;
    name: string;
    nationality: string;
    birthYear?: number;
    createdAt: Date;
    updatedAt: Date;
}


export interface AuthorDTO {
    name?: string;
    nationality?: string;
    birthYear?: number;
}