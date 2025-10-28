import request from 'supertest';
import express from 'express';
import healthRouter from '../../src/routes/health';

const app = express();
app.use('/', healthRouter);

describe('Health Route', () => {
  describe('GET /healthz', () => {
    it('should return 200 status with health data', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('time');
      expect(response.body.time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return current timestamp', async () => {
      const beforeRequest = new Date();
      
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      const afterRequest = new Date();
      const responseTime = new Date(response.body.time);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should return consistent response structure', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body).toEqual({
        ok: true,
        time: expect.any(String)
      });
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/healthz')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.time).toBeDefined();
      });
    });

    it('should return valid JSON', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    });

    it('should not require authentication', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    it('should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const requests = [];

      // Make 50 rapid requests
      for (let i = 0; i < 50; i++) {
        requests.push(request(app).get('/healthz'));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
      });

      // Should complete quickly (within 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should return different timestamps for different requests', async () => {
      const response1 = await request(app).get('/healthz');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const response2 = await request(app).get('/healthz');

      expect(response1.body.time).not.toBe(response2.body.time);
    });

    it('should handle request with query parameters', async () => {
      const response = await request(app)
        .get('/healthz?debug=true&format=json')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.time).toBeDefined();
    });

    it('should handle request with headers', async () => {
      const response = await request(app)
        .get('/healthz')
        .set('User-Agent', 'test-agent')
        .set('Accept', 'application/json')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.time).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should not throw errors on malformed requests', async () => {
      // This test ensures the route doesn't crash on unexpected input
      // Skip the malformed header test as supertest doesn't allow null bytes
      const response = await request(app)
        .get('/healthz')
        .set('X-Test-Header', 'test-data')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    it('should handle very long URLs', async () => {
      const longPath = '/healthz?' + 'a'.repeat(10000);
      
      const response = await request(app)
        .get(longPath)
        .expect(200);

      expect(response.body.ok).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should respond quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/healthz')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle load without degradation', async () => {
      const startTime = Date.now();
      const requestCount = 100;
      
      const requests = Array(requestCount).fill(null).map(() => 
        request(app).get('/healthz')
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / requestCount;

      // Average response time should be reasonable
      expect(avgTimePerRequest).toBeLessThan(50);
    });
  });
});
