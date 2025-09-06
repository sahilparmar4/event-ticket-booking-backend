import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { router } from "./routes/route";

dotenv.config();
import('./db/conn');
const app: Express = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(cors())

app.use("/api", router)

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});