import { Request, Response } from "express";
import { AuthorService } from "./author.service";

export class AuthorController {

    private readonly authorService = new AuthorService();

    create = async (req: Request, res: Response): Promise<void> => {
        const author = await this.authorService.create(req.body);
        res.status(201).json(author);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        const authors = await this.authorService.findAll();
        res.status(200).json(authors);
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const author = await this.authorService.findById(req.params.id);
        res.status(200).json(author);
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const author = await this.authorService.update(req.params.id, req.body);
        res.status(200).json(author);
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.authorService.delete(req.params.id);
        res.status(204).send();
    };
}