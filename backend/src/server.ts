import express from 'express';
import cors from 'cors';
import taskRoute from './routes/taskRoute.js';
import { ConnectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

ConnectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/tasks", taskRoute);
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server chạy trên cổng: ${PORT}`);
});
