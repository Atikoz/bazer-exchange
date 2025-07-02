import 'dotenv/config';
import request from 'supertest';
import { app } from '../../api/server';


describe('User routes E2E', () => {
  it('should return user orders', async () => {
    const userId = 9999;

    // const res = await request(app)
    //   .post('/api/user/get-user-balance')
    //   .send({
    //     email: 'test@example.com',
    //     userId: 9999
    //   });

    const res = await request(app)
      .get(`/api/orders/get-user-orders?userId=${userId}`);

    console.log('📦 Response body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  })
})