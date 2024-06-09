import express from 'express';
import { fetchCategories, createCategory } from '../controllers/category.controller';

const router = express.Router();
///categories is already added in base path
router.get('/', fetchCategories).post('/', createCategory)

exports.router = router;
