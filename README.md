# Portuguese Real Estate CMS API

A comprehensive full-stack RESTful API and Content Management System for Portuguese real estate market, built with the MERN stack (MongoDB, Express, React, Node.js).

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev

# Start production server
npm start
```

## API Documentation

The API will be running at `http://localhost:5000`

### Quick Test

Visit `http://localhost:5000` to see the welcome message with all available endpoints.

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Key Features

### Core Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Multi-Role System**: Buyer, Seller, Agent, and Admin roles with specific permissions
- **Property Management**: Complete CRUD operations with approval workflow
- **Agency Management**: Full agency system with subscription plans
- **Agent Profiles**: Agent management with verification and performance tracking
- **Admin Dashboard**: Comprehensive analytics and statistics
- **CMS Settings**: Configurable system settings for complete customization

### Portuguese Market Specifics
- **Portuguese Districts**: All 18 mainland districts + Açores and Madeira
- **Energy Certificates**: Required energy certification (A+ to F rating)
- **IMT Calculator**: Automatic calculation of Portuguese property transfer tax
- **Stamp Duty**: Automatic calculation for mortgage transactions
- **Portuguese Zip Codes**: Validation for format XXXX-XXX
- **Square Meters**: Primary measurement (auto-converts to sq ft)
- **Portuguese Property Types**: Apartment, villa, townhouse, commercial, etc.

### CMS Features
- Property approval/rejection workflow
- Bulk operations for property management
- User management (CRUD for all users)
- Agency verification system
- Agent verification system
- Subscription plan management
- System-wide settings configuration
- Real-time dashboard statistics
- Analytics by district, property type, and price range

## Main Endpoints

### Public Endpoints
- **Auth**: `/api/auth`
  - `POST /register` - User registration
  - `POST /login` - User login
  - `GET /me` - Get current user profile (protected)
  - `PUT /updateprofile` - Update user profile (protected)

- **Properties**: `/api/properties`
  - `GET /` - Get all approved properties (with filtering)
  - `GET /:id` - Get single property
  - `POST /` - Create property (seller/agent/admin)
  - `PUT /:id` - Update property (owner/admin)
  - `DELETE /:id` - Delete property (owner/admin)

- **Agents**: `/api/agents`
  - `GET /` - Get all verified agents
  - `GET /:id` - Get agent profile
  - `POST /` - Create agent profile (protected)
  - `PUT /:id` - Update agent profile (owner/admin)

- **Agencies**: `/api/agencies`
  - `GET /` - Get all agencies
  - `GET /:id` - Get agency details
  - `GET /:id/stats` - Get agency statistics (manager/admin)
  - `POST /` - Create agency (admin only)
  - `PUT /:id` - Update agency (manager/admin)

### Protected Endpoints (Authenticated Users)
- **Favorites**: `/api/favorites`
  - `GET /` - Get user favorites
  - `POST /properties/:propertyId` - Add property to favorites
  - `DELETE /properties/:propertyId` - Remove from favorites
  - `POST /searches` - Save search criteria
  - `DELETE /searches/:searchId` - Delete saved search

- **Inquiries**: `/api/inquiries`
  - `POST /` - Create inquiry
  - `GET /my-inquiries` - Get user's inquiries
  - `GET /property/:propertyId` - Get inquiries for property (owner/agent)
  - `PUT /:id` - Update inquiry (owner/agent)

- **Reviews**: `/api/reviews`
  - `GET /property/:propertyId` - Get property reviews
  - `GET /agent/:agentId` - Get agent reviews
  - `POST /property/:propertyId` - Create property review
  - `POST /agent/:agentId` - Create agent review
  - `PUT /:id` - Update review (owner)
  - `DELETE /:id` - Delete review (owner/admin)

### Admin Endpoints (Admin Only)
- **Admin Dashboard**: `/api/admin`
  - `GET /dashboard` - Get comprehensive dashboard statistics
  - `GET /users` - Get all users (with filtering & pagination)
  - `PUT /users/:id/role` - Update user role
  - `DELETE /users/:id` - Delete user
  - `GET /properties` - Get all properties (with admin filters)
  - `PUT /properties/:id/approve` - Approve property
  - `PUT /properties/:id/reject` - Reject property
  - `PUT /properties/bulk-approve` - Bulk approve properties
  - `DELETE /properties/:id` - Delete property
  - `GET /settings` - Get system settings
  - `PUT /settings` - Update system settings

- **Agency Management**: `/api/agencies` (Admin)
  - `PUT /:id/verify` - Verify agency
  - `PUT /:id/unverify` - Remove verification
  - `DELETE /:id` - Delete agency
  - `POST /:id/agents` - Add agent to agency
  - `DELETE /:id/agents/:agentId` - Remove agent from agency

## Database Models

### User Model
- Fields: name, email, password (hashed), role, phone, profilePicture
- Roles: buyer, seller, agent, admin
- Authentication: bcryptjs password hashing, JWT tokens

### Property Model (Enhanced for Portugal)
- **Basic Info**: title, description, price, propertyType, status
- **Location**: street, city, district (20 Portuguese districts), zipCode, coordinates
- **Details**: bedrooms, bathrooms, squareMeters (primary), squareFeet (auto-calculated)
- **Portuguese Specifics**:
  - Energy certificate (rating, validUntil, certificateNumber)
  - Property condition (new, excellent, good, fair, needs-renovation)
  - IMT calculations (estimated tax, rate)
  - Condominium fees
- **Features**: 28 Portuguese-specific amenities (elevator, balcony, pool, etc.)
- **Media**: images, virtual tour URL, video URL, floor plans
- **Admin**: approvalStatus, rejectionReason, approvedBy, approvedAt
- **SEO**: slug, metaDescription, metaKeywords
- **Stats**: views, inquiries, favorites

### Agency Model (NEW)
- **Basic Info**: name, licenseNumber (AMI), email, phone, website, logo
- **Location**: Full Portuguese address with district validation
- **Management**: manager (User ref), agents array
- **Subscription**: plan (free/basic/premium/enterprise), limits
- **Metrics**: totalProperties, activeProperties, totalSales
- **Status**: isActive, isVerified, verifiedAt
- **Social Media**: facebook, instagram, linkedin, twitter
- **Ratings**: average rating, total reviews

### Agent Model (Enhanced)
- **References**: user (User ref), agency (Agency ref - NEW)
- **Credentials**: licenseNumber (AMI), specialization
- **Profile**: bio, yearsOfExperience, languages (Portuguese, English, etc.)
- **Performance**: averageRating, totalReviews, totalSales, totalRentals
- **Verification**: isVerified, verifiedBy, verifiedAt
- **Status**: isActive, availability

### Settings Model (NEW - CMS Configuration)
- **Site Information**: name, description, logo, contact details
- **SEO Settings**: meta tags, analytics IDs (Google, Facebook)
- **Email Settings**: provider, SMTP configuration
- **Property Settings**: approval requirements, max images, featured duration
- **Subscription Plans**: pricing, limits for each tier
- **Agent/Agency Settings**: verification requirements
- **Notifications**: email alerts configuration
- **Map Settings**: provider, API keys, default center (Lisbon)
- **File Upload**: size limits, allowed types
- **Localization**: language, timezone (Europe/Lisbon), currency (EUR)
- **Maintenance Mode**: enabled, message, allowed IPs
- **Legal**: terms, privacy policy, GDPR compliance

### Additional Models
- **Inquiry**: Property inquiries with status tracking
- **Review**: Property and agent reviews (1-5 stars)
- **Favorite**: User favorites and saved searches

## Portuguese Utilities

### IMT Calculator (`src/utils/portugueseUtils.js`)
Calculates Portuguese Property Transfer Tax (Imposto Municipal sobre Transmissões):

```javascript
const { calculateIMT } = require('./utils/portugueseUtils');

// Example: Calculate IMT for a €250,000 residential property in Lisbon
const result = calculateIMT(250000, 'residential', 'mainland');
// Returns: { imt: 8475.00, rate: 3.39, propertyValue: 250000, ... }
```

**Supported property types:**
- `residential` - Primary residence (progressive rates 0-6%)
- `secondary-home` - Secondary/urban property (progressive rates 1-6%)
- `commercial` - Commercial property (flat 6.5%)
- `land` - Land (flat 6.5%)

**Locations:**
- `mainland` - Continental Portugal (standard rates)
- `madeira` - Madeira islands (20% reduction)
- `azores` - Azores islands (20% reduction)

### Other Utilities
- `calculateStampDuty(loanAmount)` - 0.6% of mortgage amount
- `portugueseDistricts` - Complete list of 20 Portuguese districts with cities
- `getDistrictInfo(name)` - Get district details
- `getCitiesByDistrict(name)` - Get cities in a district
- `validatePortugueseZipCode(zipCode)` - Validate XXXX-XXX format
- `formatPortuguesePrice(amount)` - Format as EUR currency
- `squareMetersToFeet(sqm)` / `squareFeetToMeters(sqft)` - Unit conversion

## Project Structure

```
Real-Estate-Listing-API/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── propertyController.js # Property CRUD
│   │   ├── agentController.js    # Agent management
│   │   ├── agencyController.js   # Agency management (NEW)
│   │   ├── adminController.js    # Admin CMS features (NEW)
│   │   ├── inquiryController.js  # Inquiry handling
│   │   ├── reviewController.js   # Review system
│   │   └── favoriteController.js # Favorites & saved searches
│   ├── middleware/
│   │   ├── auth.js              # JWT & role authorization
│   │   ├── validation.js        # Request validation
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Property.js          # Enhanced property schema
│   │   ├── Agent.js             # Enhanced agent schema
│   │   ├── Agency.js            # Agency schema (NEW)
│   │   ├── Settings.js          # CMS settings (NEW)
│   │   ├── Inquiry.js           # Inquiry schema
│   │   ├── Review.js            # Review schema
│   │   └── Favorite.js          # Favorite schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── propertyRoutes.js    # Property endpoints
│   │   ├── agentRoutes.js       # Agent endpoints
│   │   ├── agencyRoutes.js      # Agency endpoints (NEW)
│   │   ├── adminRoutes.js       # Admin endpoints (NEW)
│   │   ├── inquiryRoutes.js     # Inquiry endpoints
│   │   ├── reviewRoutes.js      # Review endpoints
│   │   └── favoriteRoutes.js    # Favorite endpoints
│   ├── utils/
│   │   ├── generateToken.js     # JWT generation
│   │   └── portugueseUtils.js   # Portuguese market utilities (NEW)
│   └── server.js                # Express app setup
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## MERN Project Requirements Compliance

This project meets all requirements for the MERN Web Application project:

✅ **SPA Frontend Ready**: Backend API supports full React frontend integration
✅ **REST API with CRUD**: Complete CRUD operations on multiple models
✅ **3+ Database Models**: User, Property, Agent, Agency, Inquiry, Review, Favorite, Settings (8 models)
✅ **Authentication**: JWT-based auth with encrypted passwords (bcryptjs)
✅ **Authorization**: Role-based access control (buyer, seller, agent, admin)
✅ **Backend Validation**: Mongoose schema validation + custom validation
✅ **Centralized Error Handling**: Global error handler middleware
✅ **GitHub Ready**: Clean commit history, modular code structure
✅ **Deployment Ready**: Environment-based configuration for Fly.io/Netlify
✅ **Documentation**: Comprehensive README with API documentation

### Additional Excellence Features
- Portuguese market-specific functionality (IMT, energy certificates, districts)
- Admin CMS dashboard with analytics
- Agency management system
- Subscription/plan support
- Property approval workflow
- Bulk operations
- SEO optimization (slugs, meta tags)
- Advanced filtering and search
- Statistics and reporting

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Mongoose validators + express-validator
- **Security**: CORS enabled, password hashing
- **Portuguese Market**: Custom utilities for IMT, districts, energy certificates

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/real-estate-cms

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Optional: Email configuration for notifications
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
```

## Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Real-Estate-Listing-API
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Start MongoDB** (if running locally)
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Run the development server**
```bash
npm run dev
```

6. **Test the API**
Visit `http://localhost:5000` to see the welcome message with all available endpoints.

## Testing the API

Use tools like Postman, Insomnia, or Thunder Client to test the endpoints.

### Example: Create Admin User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@realestate.pt",
  "password": "admin123",
  "role": "admin"
}
```

### Example: Create Agency
```bash
POST http://localhost:5000/api/agencies
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Premium Real Estate Lisboa",
  "licenseNumber": "AMI-12345",
  "email": "info@premiumre.pt",
  "phone": "+351 21 123 4567",
  "address": {
    "street": "Avenida da Liberdade, 123",
    "city": "Lisboa",
    "district": "Lisboa",
    "zipCode": "1250-001",
    "country": "Portugal"
  },
  "manager": "<user_id>",
  "description": "Leading real estate agency in Lisbon"
}
```

### Example: Calculate IMT
```javascript
// In your application code
const { calculateIMT } = require('./src/utils/portugueseUtils');

const result = calculateIMT(300000, 'residential', 'mainland');
console.log(`IMT to pay: €${result.imt}`);
console.log(`Effective rate: ${result.rate}%`);
```

## Deployment

### Backend (Fly.io)
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch
fly deploy
```

### Frontend (Netlify)
- Build React frontend connecting to deployed API
- Deploy via Netlify CLI or GitHub integration

## API Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: support@realestate-cms.pt

## Acknowledgments

- Portuguese real estate regulations and tax calculations
- AMI (Associação de Mediadores Imobiliários) - Portuguese Real Estate Association
- MERN stack community

---

**Built with ❤️ for the Portuguese real estate market**
