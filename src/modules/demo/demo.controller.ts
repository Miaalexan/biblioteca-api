import { Request, Response } from "express";
import { DemoService } from "./demo.service";

export class DemoController {

    private readonly demoService = new DemoService();

    create = async (req: Request, res: Response): Promise<void> => {
        const demo = await this.demoService.create(req.body);
        res.status(201).json(demo);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        const demos = await this.demoService.findAll();
        res.status(200).json(demos);
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const demo = await this.demoService.findById(req.params.id);
        res.status(200).json(demo);
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const demo = await this.demoService.update(req.params.id, req.body);
        res.status(200).json(demo);
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.demoService.delete(req.params.id);
        res.status(204).send();
    };
}
