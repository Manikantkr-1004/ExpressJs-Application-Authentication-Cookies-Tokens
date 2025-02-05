import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ConnectMongoDB } from "./Configs/mongodbConfig";
import { userRouter } from "./Routes/userRoutes";
import { taskRouter } from "./Routes/taskRoutes";

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json( { limit: "10mb" } ));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.disable('x-powered-by');

app.use(cors({
    origin: ['https://taskcrud.netlify.app','http://localhost:5173'],
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    credentials: true,
}))

app.use("/auth", userRouter);
app.use("/task", taskRouter);

app.get("/", (req:Request, res:Response) => {
    res.send("Welcome to Task Management API")
})

app.listen(PORT, async(): Promise<void> => {
    try {
        await ConnectMongoDB();
        console.log(`Server is started and listening to ${PORT}`);
    } catch (error) {
        console.log('Server not started',error);
    }
})