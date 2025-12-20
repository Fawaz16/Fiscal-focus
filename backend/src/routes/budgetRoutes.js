const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const BudgetController = require('../controllers/budgetController');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const budgetValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1-12'),
  body('year').isInt({ min: 2000 }).withMessage('Year must be valid'),
  body('total_budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number')
];

router.post('/', auth, validate(budgetValidation), BudgetController.createBudget);
router.get('/', auth, BudgetController.getBudgets);
router.get('/overview', auth, BudgetController.getBudgetOverview);
router.get('/:id', auth, BudgetController.getBudget);
router.put('/:id', auth, validate(budgetValidation), BudgetController.updateBudget);
router.delete('/:id', auth, BudgetController.deleteBudget);

module.exports = router;