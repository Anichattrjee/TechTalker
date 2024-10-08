import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
// import User from "./models/user.model.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app=express();

//middlewares
app.use(express.json());
app.use(cookieParser());




//connect to mongodb database
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Database connection successfull");
})
.catch((err)=>{
    console.log("Database connection failed",err)
});


//router for user
app.use("/api/user",userRouter);
app.use("/api/auth",authRouter);
app.use("/api/post",postRouter);
app.use("/api/comment",commentRouter);



app.listen(4000,()=>{
    console.log("Server is running on PORT:4000");
});

//error handling middleware
app.use((err,req,res,next)=>{
    const statusCode=err.statusCode || 500;
    const message=err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        statusCode,
        success:false,
        message
    });
});