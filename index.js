const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => {
  console.log('Chat running on port: ' + port);
});
