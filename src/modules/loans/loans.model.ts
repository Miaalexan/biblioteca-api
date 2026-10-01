import { ObjectId } from "mongodb";

export interface Loan {
    _id?: ObjectId;
    bookId: ObjectId;
    userName: string;
    loanDate: Date;
    returnDate?: Date;
    returned: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface LoanDTO {
    bookId?: string;
    userName?: string;
    loanDate?: string;
    returnDate?: string;
    returned?: boolean;
}