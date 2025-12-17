# Environment Variables Template for FIRA Backend

Copy and rename this file to `.env` and fill in the values:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development

# JWT Secret for authentication (to be used later)
JWT_SECRET=your-super-secret-jwt-key

# Payment Gateway (to be configured later)
PAYMENT_GATEWAY_KEY=
PAYMENT_GATEWAY_SECRET=
```
