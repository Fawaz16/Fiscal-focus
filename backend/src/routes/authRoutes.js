const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { uploadProfilePicture, handleUploadError } = require('../middleware/upload');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('date_of_birth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        
        if (age < 13) {
          throw new Error('You must be at least 13 years old');
        }
        if (age > 120) {
          throw new Error('Please enter a valid date of birth');
        }
      }
      return true;
    }),
  body('phone_number')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\+]?[1-9][\d]{0,15}$/i)
    .withMessage('Please enter a valid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('date_of_birth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        
        if (age < 13) {
          throw new Error('You must be at least 13 years old');
        }
        if (age > 120) {
          throw new Error('Please enter a valid date of birth');
        }
      }
      return true;
    }),
  body('phone_number')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\+]?[1-9][\d]{0,15}$/i)
    .withMessage('Please enter a valid phone number'),
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a positive number'),
  body('savings_target')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Savings target must be a positive number'),
  body('settings.profile_visibility')
    .optional()
    .isIn(['private', 'friends_only', 'public'])
    .withMessage('Profile visibility must be private, friends_only, or public')
];

// Public routes
router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);
router.post('/forgot-password', validate(forgotPasswordValidation), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes
router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, validate(updateProfileValidation), AuthController.updateProfile);
router.put('/change-password', auth, validate(changePasswordValidation), AuthController.changePassword);

// Profile picture routes
router.post(
  '/profile/picture',
  auth,
  uploadProfilePicture,
  handleUploadError,
  AuthController.uploadProfilePicture
);

router.delete(
  '/profile/picture',
  auth,
  AuthController.removeProfilePicture
);
module.exports = router;