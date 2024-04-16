import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()


//app.use(cors()) normal configuration

//when cookies se data aayega
app.use(cors({
    origin: process.env.CORS_ORIGIN, //allow this origin to access
    credentials: true, //allow cookies to send
}))

//when json format me data aayega
app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//routes import
import userRouter from "../src/routes/user.route.js"
//routes decleartion


app.use("/api/v1/users", userRouter)
//url that will be formed
//http://localost:8000/api/v1/users/

export default app