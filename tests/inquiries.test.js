const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Property = require('../src/models/Property');

describe('Inquiry Endpoints', () => {
    let buyerToken;
    let sellerToken;
    let buyerUser;
    let propertyId;

    const buyer = {
        name: 'Inquiry Buyer',
        email: 'inquirybuyer@example.com',
        password: 'password123',
        role: 'buyer'
    };

    const seller = {
        name: 'Inquiry Seller',
        email: 'inquiryseller@example.com',
        password: 'password123',
        role: 'seller'
    };

    const propertyData = {
        title: 'Inquiry Test Property',
        description: 'A property for inquiries',
        price: 180000,
        propertyType: 'house',
        status: 'for-sale',
        address: {
            street: 'Rua Inquiry 789',
            city: 'Braga',
            district: 'Braga',
            zipCode: '4700-001',
            country: 'Portugal'
        },
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 120,
        energyCertificate: {
            rating: 'B'
        },
        images: [{
            url: 'https://example.com/inquiry.jpg',
            caption: 'Inquiry property'
        }]
    };

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send(buyer);

        let dbUser = await User.findOne({ email: buyer.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();
        buyerUser = dbUser;

        const buyerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: buyer.email,
                password: buyer.password
            });
        buyerToken = buyerLogin.body.data.token;

        await request(app)
            .post('/api/auth/register')
            .send(seller);

        dbUser = await User.findOne({ email: seller.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();

        const sellerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: seller.email,
                password: seller.password
            });
        sellerToken = sellerLogin.body.data.token;

        const propRes = await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send(propertyData);

        propertyId = propRes.body.data._id;
    });

    it('should create an inquiry', async () => {
        const inquiryData = {
            property: propertyId,
            name: buyerUser.name,
            email: buyerUser.email,
            message: 'I am interested in this property'
        };

        const res = await request(app)
            .post('/api/inquiries')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send(inquiryData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe(inquiryData.message);
    });

    it('should get my inquiries', async () => {
        await request(app)
            .post('/api/inquiries')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                property: propertyId,
                name: buyerUser.name,
                email: buyerUser.email,
                message: 'Test inquiry'
            });

        const res = await request(app)
            .get('/api/inquiries/my-inquiries')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update an inquiry', async () => {
        const createRes = await request(app)
            .post('/api/inquiries')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                property: propertyId,
                name: buyerUser.name,
                email: buyerUser.email,
                message: 'Original message'
            });

        const inquiryId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/inquiries/${inquiryId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                message: 'Updated message'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.message).toBe('Updated message');
    });

    it('should delete an inquiry', async () => {
        const createRes = await request(app)
            .post('/api/inquiries')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                property: propertyId,
                name: buyerUser.name,
                email: buyerUser.email,
                message: 'To be deleted'
            });

        const inquiryId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/inquiries/${inquiryId}`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
