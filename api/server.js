const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { mongoose } = require('mongoose');
const config = require('../config');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socketHandler');

mongoose.connect(config.dataBaseUrl);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Дозволяє всі домени, налаштуйте для безпеки
    methods: ['GET', 'POST']
  }
})


app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

socketHandler(io);

const PORT = config.serverPort;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});