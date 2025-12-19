# Environment Variables Setup Guide

This document explains how to configure the environment variables for the FIRA backend server.

## Required Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fira
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fira

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Fira - Let's Celebrate
SMTP_FROM_EMAIL=your-email@gmail.com

# Client URL (for email links)
CLIENT_URL=http://localhost:3000
```

## SMTP Configuration Guide

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FIRA Backend" as the name
   - Click "Generate"
   - Copy the 16-character password
3. **Update `.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Using Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Using Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit the `.env` file to version control
- Use strong, unique passwords
- Change the `JWT_SECRET` to a random string in production
- Use environment-specific values for development, staging, and production

## Testing Email Configuration

After setting up your SMTP credentials, the server will automatically verify the connection on startup. Check the console for:

```
✅ Email service initialized successfully
✅ Email service connection verified
```

If you see errors, double-check your SMTP credentials and ensure:
- 2FA is enabled (for Gmail)
- App Password is correctly generated
- Firewall allows outbound SMTP connections
- SMTP_PORT is correct (usually 587 for TLS or 465 for SSL)

## Troubleshooting

### Gmail "Less secure app access" Error
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Gmail setup above)

### Connection Timeout
- Check if your firewall blocks port 587
- Try port 465 with `SMTP_PORT=465`
- Verify SMTP_HOST is correct

### Authentication Failed
- Double-check SMTP_USER and SMTP_PASS
- Ensure no extra spaces in credentials
- For Gmail, use the App Password, not your regular password

### Emails Not Received
- Check spam/junk folder
- Verify SMTP_FROM_EMAIL is valid
- Check server logs for sending errors
- Test with a different email provider

## Development vs Production

### Development
```env
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/fira
```

### Production
```env
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fira
# Use environment variables from your hosting provider
```

## Additional Resources

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
