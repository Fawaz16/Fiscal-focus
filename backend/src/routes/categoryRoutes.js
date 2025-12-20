const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CategoryController = require('../controllers/categoryController');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('color').optional().isHexColor().withMessage('Color must be valid hex code'),
  body('monthly_budget').optional().isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('budget_threshold').optional().isInt({ min: 1, max: 100 }).withMessage('Threshold must be between 1-100%')
];

router.post('/', auth, validate(categoryValidation), CategoryController.createCategory);
router.get('/', auth, CategoryController.getCategories);
router.get('/stats/:period', auth, CategoryController.getCategoryStats);
router.get('/:id', auth, CategoryController.getCategory);
router.put('/:id', auth, validate(categoryValidation), CategoryController.updateCategory);
router.delete('/:id', auth, CategoryController.deleteCategory);

module.exports = router;