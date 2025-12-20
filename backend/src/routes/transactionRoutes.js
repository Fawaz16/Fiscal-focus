const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const TransactionController = require('../controllers/transactionController');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const transactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category_id').isUUID().withMessage('Valid category ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
  body('is_recurring').optional().isBoolean(),
  body('recurrence_pattern').optional().isIn(['daily', 'weekly', 'monthly']),
  body('payment_method').optional().isString()
];

router.post('/', auth, validate(transactionValidation), TransactionController.createTransaction);
router.get('/', auth, TransactionController.getTransactions);
router.get('/stats/:period', auth, TransactionController.getTransactionStats);
router.get('/recurring/process', auth, TransactionController.processRecurringTransactions);
router.get('/:id', auth, TransactionController.getTransaction);
router.put('/:id', auth, validate(transactionValidation), TransactionController.updateTransaction);
router.delete('/:id', auth, TransactionController.deleteTransaction);

module.exports = router;