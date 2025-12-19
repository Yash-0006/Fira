const nodemailer = require('nodemailer');
const emailTemplates = require('../utils/emailTemplates');

/**
 * Email Service for FIRA
 * Handles all email sending functionality
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Initialize email transporter with SMTP configuration
   */
  initialize() {
    try {
      // Validate required environment variables
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Missing SMTP configuration. Please check your .env file.');
        console.error('Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
        return;
      }

      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        // Add debug logging
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development'
      };

      this.transporter = nodemailer.createTransport(smtpConfig);

      console.log('✅ Email service initialized successfully');
      console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
      console.log(`📧 SMTP Port: ${smtpConfig.port}`);
      console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
      console.log(`📧 Secure: ${smtpConfig.secure}`);
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  /**
   * Send OTP verification email
   * @param {string} email - Recipient email
   * @param {string} otp - 4-digit OTP code
   * @param {string} name - User's name
   * @returns {Promise<boolean>} - Success status
   */
  async sendOTPEmail(email, otp, name) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Fira - Let\'s Celebrate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: `${otp} is your FIRA verification code`,
        html: emailTemplates.otpVerification(name, otp),
        text: `Hey ${name}!\n\nYour FIRA verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n- FIRA Team`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  /**
   * Send welcome email after successful verification
   * @param {string} email - Recipient email
   * @param {string} name - User's name
   * @param {string} role - User's role
   * @returns {Promise<boolean>} - Success status
   */
  async sendWelcomeEmail(email, name, role) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Fira - Let\'s Celebrate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to FIRA! 🎉',
        html: emailTemplates.welcome(name, role),
        text: `Hey ${name}!\n\nWelcome to FIRA! Your email has been successfully verified.\n\nStart exploring amazing venues and events now!\n\n- FIRA Team`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      // Don't throw error for welcome email, it's not critical
      return false;
    }
  }

  /**
   * Verify email service configuration
   * @returns {Promise<boolean>} - Verification status
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
