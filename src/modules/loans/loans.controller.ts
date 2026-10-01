import { Request, Response } from "express";
import { LoanService } from "./loans.service";

export class LoanController {

    private readonly loanService = new LoanService();

    create = async (req: Request, res: Response): Promise<void> => {
        const loan = await this.loanService.create(req.body);
        res.status(201).json(loan);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        const loans = await this.loanService.findAll();
        res.status(200).json(loans);
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const loan = await this.loanService.findById(req.params.id);
        res.status(200).json(loan);
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const loan = await this.loanService.update(req.params.id, req.body);
        res.status(200).json(loan);
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.loanService.delete(req.params.id);
        res.status(204).send();
    };
}