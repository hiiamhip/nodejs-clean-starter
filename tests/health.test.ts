import request from 'supertest';
import { app } from '../src/app';

describe('GET /health', () => {
  it('should return 200 OK with health status and timestamp', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Service is healthy');
    expect(response.body.data).toHaveProperty('status', 'UP');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('uptime');
  });

  it('should return 404 for undefined routes with standardized envelope', async () => {
    const response = await request(app).get('/undefined-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Route GET /undefined-route not found');
  });
});
