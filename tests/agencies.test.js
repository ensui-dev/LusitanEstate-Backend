const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Agency Endpoints', () => {
    let adminToken;
    let managerId;
    let agencyId;

    const admin = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    };

    beforeEach(async () => {
        const adminUser = await User.create({
            ...admin,
            isEmailVerified: true
        });
        managerId = adminUser._id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: admin.email,
                password: admin.password
            });

        adminToken = loginRes.body.data.token;
    });

    it('should create an agency (admin only)', async () => {
        const agencyData = {
            name: 'Test Real Estate Agency',
            licenseNumber: 'AMI-AGENCY-001',
            email: 'agency@example.com',
            phone: '+351210000000',
            manager: managerId,
            address: {
                street: 'Av. da Liberdade 100',
                city: 'Lisboa',
                district: 'Lisboa',
                zipCode: '1250-001',
                country: 'Portugal'
            }
        };

        const res = await request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(agencyData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(agencyData.name);
    });

    it('should get all agencies', async () => {
        await request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Public Agency',
                licenseNumber: 'AMI-AGENCY-002',
                email: 'public@example.com',
                phone: '+351210000001',
                manager: managerId,
                address: {
                    street: 'Rua Test',
                    city: 'Porto',
                    district: 'Porto',
                    zipCode: '4000-001',
                    country: 'Portugal'
                }
            });

        const res = await request(app)
            .get('/api/agencies');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get agency by id', async () => {
        const createRes = await request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Get Agency',
                licenseNumber: 'AMI-AGENCY-003',
                email: 'get@example.com',
                phone: '+351210000002',
                manager: managerId,
                address: {
                    street: 'Rua Get',
                    city: 'Braga',
                    district: 'Braga',
                    zipCode: '4700-001',
                    country: 'Portugal'
                }
            });

        agencyId = createRes.body.data._id;

        const res = await request(app)
            .get(`/api/agencies/${agencyId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.agency._id).toBe(agencyId);
    });

    it('should update agency', async () => {
        const createRes = await request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Update Agency',
                licenseNumber: 'AMI-AGENCY-004',
                email: 'update@example.com',
                phone: '+351210000003',
                manager: managerId,
                address: {
                    street: 'Rua Update',
                    city: 'Faro',
                    district: 'Faro',
                    zipCode: '8000-001',
                    country: 'Portugal'
                }
            });

        agencyId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/agencies/${agencyId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                description: 'Updated description'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.description).toBe('Updated description');
    });

    it('should verify agency (admin only)', async () => {
        const createRes = await request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Verify Agency',
                licenseNumber: 'AMI-AGENCY-005',
                email: 'verify@example.com',
                phone: '+351210000004',
                manager: managerId,
                address: {
                    street: 'Rua Verify',
                    city: 'Coimbra',
                    district: 'Coimbra',
                    zipCode: '3000-001',
                    country: 'Portugal'
                }
            });

        agencyId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/agencies/${agencyId}/verify`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isVerified).toBe(true);
    });
});
