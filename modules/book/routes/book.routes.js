import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} from "../controller/book.controller.js"; 

const bookRouter = express.Router();


router.post("/", createBook);      
router.get("/", getAllBooks);       
router.get("/:id", getBookById);    
router.put("/:id", updateBook);     
router.delete("/:id", deleteBook);  

export default bookRouter;  
