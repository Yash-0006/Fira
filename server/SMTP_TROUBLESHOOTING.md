# SMTP Relay Error - Quick Fix Guide

## Error: "553 Sender is not allowed to relay emails"

This error means your SMTP server is rejecting the email because it doesn't recognize you as an authorized sender.

## Common Causes & Solutions

### 1. **Gmail Users** (Most Common)

If you're using Gmail, you **MUST** use an App Password, not your regular password.

**Steps to fix:**

1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "FIRA Backend"
   - Copy the 16-character password (remove spaces)

3. **Update your `.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char App Password (spaces are OK)
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

4. **Restart your server**

### 2. **Outlook/Hotmail Users**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-regular-password
SMTP_FROM_EMAIL=your-email@outlook.com
```

**Note**: Outlook may require you to enable "Less secure app access" in account settings.

### 3. **Custom SMTP Server**

Make sure:
- Your SMTP server allows relay for authenticated users
- You're using the correct authentication credentials
- The FROM email matches your authenticated user

### 4. **Check Your .env File**

Make sure there are **NO EXTRA SPACES** in your credentials:

❌ **Wrong:**
```env
SMTP_USER= your-email@gmail.com  # Space before email
SMTP_PASS=your-password   # Extra spaces
```

✅ **Correct:**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### 5. **Verify FROM Email Matches**

Your `SMTP_FROM_EMAIL` should match your `SMTP_USER`:

```env
SMTP_USER=your-email@gmail.com
SMTP_FROM_EMAIL=your-email@gmail.com  # Must match!
```

## Testing Your Configuration

After updating your `.env`, restart the server and check the console output:

```
✅ Email service initialized successfully
📧 SMTP Host: smtp.gmail.com
📧 SMTP Port: 587
📧 SMTP User: your-email@gmail.com
📧 Secure: false
```

Then try registering a new account. You should see:
```
✅ OTP email sent successfully: <message-id>
```

## Still Not Working?

### Try Alternative Ports

**For Gmail:**
```env
# Try port 465 with SSL
SMTP_PORT=465
```

**For Outlook:**
```env
# Try port 25
SMTP_PORT=25
```

### Enable Less Secure Apps (Not Recommended)

Some email providers require enabling "less secure app access":
- **Gmail**: No longer supported - MUST use App Password
- **Outlook**: May be required in account settings

### Use a Different Email Service

If you're still having issues, consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Free tier: 62,000 emails/month)

## Quick Test Command

You can test your SMTP settings directly in Node.js:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});
```

## Need More Help?

Check the server console for detailed error messages. The updated email service now shows:
- SMTP configuration being used
- Detailed authentication errors
- Connection status

**Common error messages:**
- "Invalid login" → Wrong password or need App Password
- "Connection timeout" → Firewall blocking port 587
- "Authentication failed" → Check username/password for typos
