import { Router } from "express";
import { AuthorController } from "./author.controller";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";

const router = Router();
const authorController = new AuthorController();

router.post("/", asyncHandler(authorController.create));
router.get("/", asyncHandler(authorController.findAll));
router.get("/:id", asyncHandler(authorController.findById));
router.put("/:id", asyncHandler(authorController.update));
router.delete("/:id", asyncHandler(authorController.delete));

export default router;