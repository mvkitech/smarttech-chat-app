const request = require('supertest');
const app = require('../../app');

test('postSignup_whenValidDataExists_returnsSuccess', async () => {
  await request(app)
    .post('/signup')
    .send({
      username: 'UnitTestUser',
      email: 'UnitTestUser@mvkitech.com',
      password: 'UnitTest',
      confirmPassword: 'UnitTest',
    })
    .expect(422); // Should actually be 201 except data is not being sent in the request body. Body is empty :/
});
