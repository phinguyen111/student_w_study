const express = require('express');
const { config } = require('./config');
const { errorHandler } = require('./middleware/error');
const routes = require('./routes');
const app = express();

require('./middleware')(app);

app/use('/api',routes);

app.use(errorHandler);

const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang  chạy trên cổng ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});