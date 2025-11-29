const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Property = require('../src/models/Property');

describe('Review Endpoints', () => {
    let token;
    let propertyId;

    const user = {
        name: 'Review User',
        email: 'reviewer@example.com',
        password: 'password123',
        role: 'seller'
    };

    const propertyData = {
        title: 'Review Test Property',
        description: 'A property to review',
        price: 150000,
        propertyType: 'apartment',
        status: 'for-sale',
        address: {
            street: 'Rua Review 321',
            city: 'Coimbra',
            district: 'Coimbra',
            zipCode: '3000-001',
            country: 'Portugal'
        },
        bedrooms: 2,
        bathrooms: 1,
        squareMeters: 75,
        energyCertificate: {
            rating: 'C'
        },
        images: [{
            url: 'https://example.com/review.jpg',
            caption: 'Review property'
        }]
    };

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send(user);

        const dbUser = await User.findOne({ email: user.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();

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

    it('should create a review', async () => {
        const reviewData = {
            property: propertyId,
            reviewType: 'property',
            rating: 5,
            comment: 'Excellent property!'
        };

        const res = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send(reviewData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.rating).toBe(5);
    });

    it('should get property reviews', async () => {
        await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send({
                property: propertyId,
                reviewType: 'property',
                rating: 4,
                comment: 'Good property'
            });

        const res = await request(app)
            .get(`/api/reviews/property/${propertyId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update a review', async () => {
        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send({
                property: propertyId,
                reviewType: 'property',
                rating: 3,
                comment: 'Average'
            });

        const reviewId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                rating: 5,
                comment: 'Actually excellent!'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.rating).toBe(5);
    });

    it('should delete a review', async () => {
        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send({
                property: propertyId,
                reviewType: 'property',
                rating: 2,
                comment: 'To be deleted'
            });

        const reviewId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
