import 'dotenv/config';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import apiRoutes from './routes/apiRoutes';
import socketHandler from './ws/socketHandler';

const MONGO_URI = process.env.MONGO_URI;
const SERVER_PORT = process.env.SERVER_PORT

mongoose.connect(MONGO_URI);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/socket.io/'
})


app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

socketHandler(io);


server.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});