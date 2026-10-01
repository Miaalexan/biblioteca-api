import { Router } from "express";
import authourRoutes from "../../modules/authors/author.routes";
import booksRoutes from "../../modules/books/book.routes";
import loansRoutes from "../../modules/loans/loans.routes";

const router = Router();

router.use("/authors", authourRoutes);
router.use("/books", booksRoutes);
router.use("/loans", loansRoutes);

export default router;
