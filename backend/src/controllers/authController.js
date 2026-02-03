const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, PasswordReset } = require("../models/index");
const { generateToken } = require("../middleware/auth");
const EmailService = require("../services/emailService");

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, date_of_birth, phone_number } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      // Validate date of birth if provided
      if (date_of_birth) {
        const dob = new Date(date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();

        if (age < 13) {
          return res.status(400).json({
            success: false,
            message: "You must be at least 13 years old to register"
          });
        }

        if (age > 120) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid date of birth"
          });
        }
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        date_of_birth: date_of_birth || null,
        phone_number: phone_number || null,
        verification_token: crypto.randomBytes(32).toString("hex"),
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Generate token
      const token = generateToken(user.id);

      // Send welcome email
      // await EmailService.sendWelcomeEmail(user);

      // Send verification email
      // await EmailService.sendVerificationEmail(user, user.verification_token);

      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email for verification.",
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Update last login
      user.last_login = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const userData = req.user.toJSON();

      // Add calculated age to response
      userData.age = req.user.getAge();

      // Check profile visibility settings
      const settings = req.user.settings || {};

      // Hide sensitive info based on profile visibility
      if (settings.profile_visibility === "private") {
        userData.date_of_birth = undefined;
        userData.phone_number = undefined;
        userData.email = undefined;
      } else if (settings.profile_visibility === "friends_only") {
        // You can implement friend logic here
        userData.phone_number = undefined;
      }
      // If 'public', show all info

      res.json({
        success: true,
        data: {
          user: userData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const {
        name,
        currency,
        monthly_income,
        savings_target,
        settings,
        date_of_birth,
        phone_number,
        profile_visibility
      } = req.body;

      const updates = {};

      // Basic info updates
      if (name !== undefined) updates.name = name;
      if (currency !== undefined) updates.currency = currency;
      if (monthly_income !== undefined) updates.monthly_income = monthly_income;
      if (savings_target !== undefined) updates.savings_target = savings_target;

      if (date_of_birth !== undefined) {
        if (date_of_birth) {
          const dob = new Date(date_of_birth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();

          if (age < 13) {
            return res.status(400).json({
              success: false,
              message: "You must be at least 13 years old"
            });
          }
        }
        updates.date_of_birth = date_of_birth || null;
      }

      if (phone_number !== undefined)
        updates.phone_number = phone_number || null;

      // Settings updates
      if (settings !== undefined) {
        updates.settings = { ...req.user.settings, ...settings };

        // Ensure profile_visibility is set properly
        if (settings.profile_visibility !== undefined) {
          updates.settings.profile_visibility = settings.profile_visibility;
        }
      }

      await req.user.update(updates);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: req.user.toJSON(),
          age: req.user.getAge() // Include calculated age in response
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // File information from multer middleware
      const profilePicture = `/uploads/profile/${req.file.filename}`;

      // Update user profile picture
      await req.user.update({ profile_picture: profilePicture });

      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          profile_picture: profilePicture
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeProfilePicture(req, res, next) {
    try {
      // Remove profile picture URL from database
      await req.user.update({ profile_picture: null });

      res.json({
        success: true,
        message: "Profile picture removed successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: {
          verification_token: token,
          verification_expires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token"
        });
      }

      user.is_verified = true;
      user.verification_token = null;
      user.verification_expires = null;
      await user.save();

      res.json({
        success: true,
        message: "Email verified successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await PasswordReset.create({
        email,
        token: resetToken,
        expires_at: resetExpires,
        user_id: user.id
      });

      // Send reset email
      await EmailService.sendPasswordResetEmail(user, resetToken);

      res.json({
        success: true,
        message: "Password reset email sent"
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const resetRecord = await PasswordReset.findOne({
        where: {
          token,
          expires_at: { [Op.gt]: new Date() },
          is_used: false
        },
        include: [User]
      });

      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }

      // Update user password
      resetRecord.User.password = password;
      await resetRecord.User.save();

      // Mark token as used
      resetRecord.is_used = true;
      await resetRecord.save();

      res.json({
        success: true,
        message: "Password reset successful"
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValid = await req.user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified"
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update user with new token
      user.verification_token = verificationToken;
      user.verification_expires = verificationExpires;
      await user.save();

      // Send verification email
      await EmailService.sendVerificationEmail(user, verificationToken);

      res.json({
        success: true,
        message: "Verification email resent successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
