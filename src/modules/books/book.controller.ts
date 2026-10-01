import { Request, Response } from "express";
import { BookService } from "./book.service";

export class BookController {

    private readonly bookService = new BookService();

    create = async (req: Request, res: Response): Promise<void> => {
        const book = await this.bookService.create(req.body);
        res.status(201).json(book);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        const books = await this.bookService.findAll();
        res.status(200).json(books);
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const book = await this.bookService.findById(req.params.id);
        res.status(200).json(book);
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const book = await this.bookService.update(req.params.id, req.body);
        res.status(200).json(book);
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.bookService.delete(req.params.id);
        res.status(204).send();
    };
}