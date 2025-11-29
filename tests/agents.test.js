const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Agency = require('../src/models/Agency');

describe('Agent Endpoints', () => {
    let agentToken;
    let agencyId;
    let agentId;

    const agent = {
        name: 'Test Agent',
        email: 'agent@example.com',
        password: 'password123',
        role: 'agent'
    };

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send(agent);

        const dbUser = await User.findOne({ email: agent.email });
        dbUser.isEmailVerified = true;
        await dbUser.save();

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: agent.email,
                password: agent.password
            });

        agentToken = loginRes.body.data.token;

        // Create an agency for the agent
        const agency = await Agency.create({
            name: 'Test Agency for Agents',
            licenseNumber: 'AMI-AGENT-AGENCY-001',
            email: 'agencyforagents@example.com',
            phone: '+351210999999',
            manager: dbUser._id,
            address: {
                street: 'Rua Agent Test',
                city: 'Lisboa',
                district: 'Lisboa',
                zipCode: '1000-001',
                country: 'Portugal'
            }
        });
        agencyId = agency._id;
    });

    it('should create an agent profile', async () => {
        const agentData = {
            agency: agencyId,
            licenseNumber: 'AMI-12345',
            phone: '+351912345678',
            specialization: ['residential', 'commercial'],
            bio: 'Experienced real estate agent'
        };

        const res = await request(app)
            .post('/api/agents')
            .set('Authorization', `Bearer ${agentToken}`)
            .send(agentData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.licenseNumber).toBe(agentData.licenseNumber);
    });

    it('should get all agents', async () => {
        await request(app)
            .post('/api/agents')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({
                agency: agencyId,
                licenseNumber: 'AMI-11111',
                phone: '+351911111111'
            });

        const res = await request(app)
            .get('/api/agents');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get agent by id', async () => {
        const createRes = await request(app)
            .post('/api/agents')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({
                agency: agencyId,
                licenseNumber: 'AMI-22222',
                phone: '+351922222222'
            });

        agentId = createRes.body.data._id;

        const res = await request(app)
            .get(`/api/agents/${agentId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(agentId);
    });

    it('should update agent profile', async () => {
        const createRes = await request(app)
            .post('/api/agents')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({
                agency: agencyId,
                licenseNumber: 'AMI-33333',
                phone: '+351933333333'
            });

        agentId = createRes.body.data._id;

        const res = await request(app)
            .put(`/api/agents/${agentId}`)
            .set('Authorization', `Bearer ${agentToken}`)
            .send({
                bio: 'Updated bio'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.bio).toBe('Updated bio');
    });

    it('should delete agent profile', async () => {
        const createRes = await request(app)
            .post('/api/agents')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({
                agency: agencyId,
                licenseNumber: 'AMI-44444',
                phone: '+351944444444'
            });

        agentId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/agents/${agentId}`)
            .set('Authorization', `Bearer ${agentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
