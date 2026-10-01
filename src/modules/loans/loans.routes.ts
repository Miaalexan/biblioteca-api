import { Router } from "express";
import { LoanController } from "./loans.controller";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";

const router = Router();
const loanController = new LoanController();

router.post("/", asyncHandler(loanController.create));
router.get("/", asyncHandler(loanController.findAll));
router.get("/:id", asyncHandler(loanController.findById));
router.put("/:id", asyncHandler(loanController.update));
router.delete("/:id", asyncHandler(loanController.delete));

export default router;