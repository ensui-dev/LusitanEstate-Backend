# Portuguese Real Estate CMS - Backend API

A comprehensive RESTful API backend for managing real estate listings in Portugal. Built with Node.js, Express, and MongoDB, featuring Portuguese market-specific functionality including IMT tax calculations, energy certificates, and support for all 20 Portuguese districts.

## 🚀 Features

- **Complete REST API** with full CRUD operations
- **JWT Authentication** with role-based access control (Buyer, Seller, Agent, Admin)
- **8 Database Models** including User, Property, Agent, Agency, Inquiry, Review, Favorite, and Settings
- **Portuguese Market Integration** - IMT calculator, 20 districts, energy certificates
- **Admin CMS** with dashboard, user management, and property approval workflow
- **Agency Management System** with subscription tiers and verification
- **Advanced Property Filtering** by district, type, price, features
- **MongoDB Atlas** ready with connection string configuration
- **AWS S3 Integration** - Secure image storage for properties and profiles
- **AWS SES Integration** - Transactional emails (welcome, verification, reset password)
- **Fly.io Deployment** ready with included configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (free tier available) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **AWS Account** - For S3 (storage) and SES (email)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ensui-dev/Real-Estate-CMS-Backend.git
cd Real-Estate-CMS-Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (Web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT authentication)
- bcryptjs (Password hashing)
- cors (Cross-origin resource sharing)
- dotenv (Environment variables)
- express-validator (Input validation)

### Step 3: Set Up MongoDB Atlas

#### 3.1 Create a Free MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Create a New Cluster"
4. Choose **FREE M0 tier**
5. Select **AWS** or **Azure**
6. Choose region: **Frankfurt (eu-central-1)** or **Ireland (eu-west-1)** (closest to Portugal)
7. Cluster Name: `real-estate-cms`
8. Click "Create Cluster" (takes 3-5 minutes)

#### 3.2 Create Database User

1. In Atlas, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `realestate-admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" and **SAVE IT**
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

#### 3.3 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is safe - MongoDB Atlas has built-in security
   - Required for Fly.io and other cloud deployments
4. Click **"Confirm"**

#### 3.4 Get Connection String

1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your username (e.g., `realestate-admin`)
6. Replace `<password>` with your saved password
7. Add database name after `.net/`: `/real-estate-cms`

**Final connection string example:**
```
mongodb+srv://realestate-admin:YourPassword123@cluster0.abc123.mongodb.net/real-estate-cms?retryWrites=true&w=majority
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection String
# Paste your connection string from Step 3.4 here
MONGODB_URI=mongodb+srv://realestate-admin:YourPassword123@cluster0.abc123.mongodb.net/real-estate-cms?retryWrites=true&w=majority

# JWT Secret Key
# Generate a secure random key: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_super_long_random_secret_key_here_at_least_32_characters
JWT_EXPIRE=30d

# Frontend URL (for CORS)
# Development: http://localhost:3000
# Production: https://your-frontend.netlify.app
CLIENT_URL=http://localhost:3000

# AWS S3 Configuration (for image uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# AWS SES Configuration (for email)
AWS_SES_REGION=eu-west-1
AWS_SES_FROM_EMAIL=noreply@lusitanestate.com
AWS_SES_FROM_NAME=LusitanEstate
AWS_SES_REPLY_TO_EMAIL=suporte@lusitanestate.com

# Email Verification
EMAIL_VERIFICATION_EXPIRES=24h
```

**IMPORTANT:**
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- Generate a strong JWT secret using the command above

### Step 5: Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` in the `.env` file.

## 🚦 Running the Application

### Development Mode

Start the server with automatic restart on file changes:

```bash
npm run dev
```

The API will be available at: `http://localhost:5000`

### Production Mode

```bash
npm start
```

### Verify It's Working

Visit `http://localhost:5000` in your browser. You should see:

```json
{
  "success": true,
  "message": "Welcome to Portuguese Real Estate CMS API",
  "version": "2.0.0",
  "description": "Comprehensive real estate listing and CMS platform for Portugal",
  "endpoints": {
    "auth": "/api/auth",
    "properties": "/api/properties",
    "agents": "/api/agents",
    "agencies": "/api/agencies",
    ...
  }
}
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/updateprofile` | Update user profile | Private |

### Properties (`/api/properties`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/properties` | Get all approved properties | Public |
| GET | `/api/properties/:id` | Get single property | Public |
| POST | `/api/properties` | Create property | Private (Seller/Agent/Admin) |
| PUT | `/api/properties/:id` | Update property | Private (Owner/Admin) |
| DELETE | `/api/properties/:id` | Delete property | Private (Owner/Admin) |
| GET | `/api/properties/user/my-properties` | Get user's properties | Private |

### Agents (`/api/agents`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/agents` | Get all agents | Public |
| GET | `/api/agents/:id` | Get agent profile | Public |
| POST | `/api/agents` | Create agent profile | Private |
| PUT | `/api/agents/:id` | Update agent | Private (Owner/Admin) |

### Agencies (`/api/agencies`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/agencies` | Get all agencies | Public |
| GET | `/api/agencies/:id` | Get agency details | Public |
| POST | `/api/agencies` | Create agency | Private (Admin) |
| PUT | `/api/agencies/:id` | Update agency | Private (Manager/Admin) |
| PUT | `/api/agencies/:id/verify` | Verify agency | Private (Admin) |
| GET | `/api/agencies/:id/stats` | Get agency statistics | Private (Manager/Admin) |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/role` | Update user role | Admin |
| GET | `/api/admin/properties` | Get all properties | Admin |
| PUT | `/api/admin/properties/:id/approve` | Approve property | Admin |
| PUT | `/api/admin/properties/:id/reject` | Reject property | Admin |
| PUT | `/api/admin/properties/bulk-approve` | Bulk approve | Admin |
| GET | `/api/admin/settings` | Get settings | Admin |
| PUT | `/api/admin/settings` | Update settings | Admin |

### Inquiries (`/api/inquiries`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/inquiries` | Create inquiry | Private |
| GET | `/api/inquiries/my-inquiries` | Get user's inquiries | Private |
| GET | `/api/inquiries/property/:id` | Get property inquiries | Private (Owner/Agent) |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reviews/property/:id` | Get property reviews | Public |
| GET | `/api/reviews/agent/:id` | Get agent reviews | Public |
| POST | `/api/reviews/property/:id` | Create property review | Private |
| POST | `/api/reviews/agent/:id` | Create agent review | Private |

### Favorites (`/api/favorites`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/favorites` | Get user's favorites | Private |
| POST | `/api/favorites/properties/:id` | Add to favorites | Private |
| DELETE | `/api/favorites/properties/:id` | Remove from favorites | Private |

### Uploads (`/api/upload`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/upload/property-images` | Upload property images (max 10) | Private |
| POST | `/api/upload/profile-image` | Upload profile image | Private |
| DELETE | `/api/upload/delete-image` | Delete image | Private |

## 🧪 Testing the API

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "buyer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Get properties:**
```bash
curl http://localhost:5000/api/properties?district=Lisboa&limit=10
```

### Using Postman/Thunder Client/Insomnia

1. Import the API endpoints
2. Set `BASE_URL` variable to `http://localhost:5000/api`
3. For protected routes, add header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## 🗄️ Database Models

### User
- name, email, password (hashed), role, phone, profilePicture
- Roles: buyer, seller, agent, admin

### Property
- title, description, price, propertyType, status
- Portuguese specifics: district, energyCertificate, squareMeters, IMT
- Admin: approvalStatus, rejectionReason
- Relations: owner, agent, agency

### Agency
- name, licenseNumber (AMI), contact info, address
- manager (User), agents array
- subscription: plan, limits
- Verification status

### Agent
- user (User ref), agency (Agency ref)
- licenseNumber (AMI), specialization, languages
- Performance: ratings, totalSales

### Inquiry
- Property inquiries with status tracking
- Types: viewing, information, offer, general

### Review
- Property and agent reviews (1-5 stars)
- One review per user per property/agent

### Favorite
- User's favorite properties and saved searches

### Settings
- CMS configuration (singleton document)
- Site settings, subscription plans, email config

## 🇵🇹 Portuguese Market Features

### IMT Calculator

Located in `src/utils/portugueseUtils.js`:

```javascript
const { calculateIMT } = require('./utils/portugueseUtils');

const result = calculateIMT(300000, 'residential', 'mainland');
// Returns: { imt: 16025, rate: 5.34, formatted: "€16,025.00" }
```

### 20 Portuguese Districts

All properties must specify one of:
- Aveiro, Beja, Braga, Bragança, Castelo Branco
- Coimbra, Évora, Faro, Guarda, Leiria
- Lisboa, Portalegre, Porto, Santarém, Setúbal
- Viana do Castelo, Vila Real, Viseu
- Açores, Madeira

### Energy Certificates

Required by Portuguese law:
- Ratings: A+, A, B, B-, C, D, E, F
- Includes validity date and certificate number

### Property Types

15 Portuguese property types including:
- Apartment, House, Villa, Townhouse, Penthouse
- Commercial, Office, Warehouse, Retail
- Land, Farm, Garage

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - Secure authentication
- **Role-Based Access Control** - 4 user roles
- **Input Validation** - Mongoose validators + express-validator
- **CORS Protection** - Configured for specific frontend origin
- **Error Handling** - Centralized error middleware
- **MongoDB Injection Protection** - Mongoose sanitization

## 📁 Project Structure

```
Real-Estate-CMS-Backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
├── package.json
├── fly.toml                     # Fly.io deployment config
├── BACKEND-DEPLOYMENT.md        # Deployment guide
└── README.md
```

**Quick deployment:**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Set secrets
flyctl secrets set MONGODB_URI="your_mongodb_connection_string"
flyctl secrets set JWT_SECRET="your_generated_jwt_secret"
flyctl secrets set CLIENT_URL="https://your-frontend.netlify.app"
flyctl secrets set AWS_ACCESS_KEY_ID="your_key"
flyctl secrets set AWS_SECRET_ACCESS_KEY="your_secret"

# Deploy
flyctl deploy
```

Your API will be live at: `https://your-app-name.fly.dev`

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `development` or `production` |
| `PORT` | Yes | Server port | `5000` (dev) or `8080` (production) |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) | Generate with crypto |
| `JWT_EXPIRE` | No | JWT expiration time | `30d` (default) |
| `CLIENT_URL` | Yes | Frontend URL for CORS | `http://localhost:3000` or production URL |
| `AWS_ACCESS_KEY_ID` | Yes | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS Secret Key | `wJalr...` |
| `AWS_REGION` | Yes | AWS Region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | Yes | S3 Bucket Name | `my-real-estate-bucket` |
| `AWS_SES_FROM_EMAIL` | Yes | Verified SES Email | `noreply@example.com` |

## 🐛 Troubleshooting

### Cannot connect to MongoDB

**Error:** `MongoServerError: bad auth`

**Solution:**
1. Check username and password in connection string
2. Verify user exists in MongoDB Atlas → Database Access
3. Ensure password doesn't contain special characters (or URL encode them)

### CORS errors from frontend

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Solution:**
Update `CLIENT_URL` in `.env` to match your frontend URL exactly:
```env
CLIENT_URL=http://localhost:3000
```

### Port already in use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5001 npm run dev
```

### JWT authentication fails

**Error:** `JsonWebTokenError: invalid token`

**Solution:**
1. Ensure JWT_SECRET is set in `.env`
2. Check token is sent in header: `Authorization: Bearer <token>`
3. Verify token hasn't expired
4. Clear browser localStorage and login again

## 📊 Monitoring & Logs

### View logs (Fly.io)
```bash
flyctl logs
```

### Check MongoDB Atlas
1. Go to MongoDB Atlas Dashboard
2. Click **Metrics** tab
3. Monitor connections, queries, storage

### API Health Check
```bash
curl http://localhost:5000/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues:** [Create an issue](https://github.com/ensui-dev/LusitanEstate-Backend/issues)

## 🙏 Acknowledgments

- **MongoDB Atlas** - Database hosting
- **Fly.io** - Application hosting
- **AMI Portugal** - Real estate regulations reference
- **Portuguese Tax Authority** - IMT calculation rules

---

**Built for the Portuguese real estate market with ❤️**

Need the frontend? Check out the [Frontend Repository](https://github.com/ensui-dev/LusitanEstate-Frontend)
