import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()


//app.use(cors()) normal configuration

//when cookies se data aayega
app.use(cors({
    origin: process.env.CORS_ORIGIN, //allow this origin to access
    Credential: true, //allow cookies to send
}))

//when json format me data aayega
app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

export default app