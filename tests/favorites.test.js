const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Property = require('../src/models/Property');

describe('Favorite Endpoints', () => {
    let token;
    let userId;
    let propertyId;

    const user = {
        name: 'Buyer User',
        email: 'buyer@example.com',
        password: 'password123',
        role: 'seller'
    };

    const propertyData = {
        title: 'Favorite Test Property',
        description: 'A property to favorite',
        price: 200000,
        propertyType: 'apartment',
        status: 'for-sale',
        address: {
            street: 'Rua Favorita 456',
            city: 'Porto',
            district: 'Porto',
            zipCode: '4000-001',
            country: 'Portugal'
        },
        bedrooms: 1,
        bathrooms: 1,
        squareMeters: 60,
        energyCertificate: {
            rating: 'A'
        },
        images: [{
            url: 'https://example.com/fav.jpg',
            caption: 'Favorite property'
        }]
    };

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send(user);

        const dbUser = await User.findOne({ email: user.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();
        userId = dbUser._id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password
            });

        token = loginRes.body.data.token;

        const propRes = await request(app)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(propertyData);

        propertyId = propRes.body.data._id;
    });

    it('should add a property to favorites', async () => {
        const res = await request(app)
            .post(`/api/favorites/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('properties');
    });

    it('should get user favorites', async () => {
        await request(app)
            .post(`/api/favorites/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('properties');
    });

    it('should remove a property from favorites', async () => {
        await request(app)
            .post(`/api/favorites/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app)
            .delete(`/api/favorites/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
