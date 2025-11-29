const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
    const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.message).toEqual(expect.stringContaining('verify'));
    });

    it('should login a user', async () => {
        // Create user first
        const createdUser = await User.create(user);

        // Manually verify email
        createdUser.isEmailVerified = true;
        await createdUser.save();

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('success', false);
    });
});
