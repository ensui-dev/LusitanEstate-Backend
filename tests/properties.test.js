const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Property = require('../src/models/Property');

describe('Property Endpoints', () => {
    let token;
    let userId;

    const user = {
        name: 'Seller User',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller'
    };

    const propertyData = {
        title: 'Test Property',
        description: 'A beautiful test property',
        price: 250000,
        propertyType: 'apartment',
        status: 'for-sale',
        address: {
            street: 'Rua Teste 123',
            city: 'Lisboa',
            district: 'Lisboa',
            zipCode: '1000-001',
            country: 'Portugal'
        },
        bedrooms: 2,
        bathrooms: 1,
        squareMeters: 90,
        energyCertificate: {
            rating: 'B'
        },
        images: [{
            url: 'https://example.com/image.jpg',
            caption: 'Test image'
        }]
    };

    beforeEach(async () => {
        // Create user
        await request(app)
            .post('/api/auth/register')
            .send(user);

        // Manually verify user in DB
        const dbUser = await User.findOne({ email: user.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();
        userId = dbUser._id;

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password
            });

        token = loginRes.body.data.token;
    });

    it('should create a new property', async () => {
        const res = await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(propertyData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe(propertyData.title);
    });

    it('should get all properties', async () => {
        // Create a property first
        await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(propertyData);

        const res = await request(app)
            .get('/api/properties');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update a property', async () => {
        // Create property
        const createRes = await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(propertyData);

        const propertyId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ price: 300000 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.price).toBe(300000);
    });

    it('should delete a property', async () => {
        // Create property
        const createRes = await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(propertyData);

        const propertyId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Verify it's gone
        const getRes = await request(app).get(`/api/properties/${propertyId}`);
        expect(getRes.statusCode).toEqual(404);
    });
});
