require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { ConnectMongoDB } = require("./Configs/mongodbConfig");
const {taskRouter}  = require("./Routes/taskRoutes");
const {userRouter} = require("./Routes/userRoutes");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json( { limit: "10mb" } ));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.disable('x-powered-by');

app.use(cors({
    origin: ['https://basalai.netlify.app','http://localhost:5173'],
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    credentials: true,
}))

app.use("/auth", userRouter);
app.use("/task", taskRouter);

app.get("/", (req, res) => {
    res.send("Welcome to Basal API")
})

app.listen(PORT, async() => {
    try {
        await ConnectMongoDB();
        console.log(`Server is started and listening to ${PORT}`);
    } catch (error) {
        console.log('Server not started',error);
    }
})