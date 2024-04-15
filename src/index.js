import dotenv from "dotenv"
import mongoose, { connect } from "mongoose";
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js";


dotenv.config({
    path: './.env'
})

try {
    connectDB()
    console.log("connecton established");
} catch (error) {
    console.log("coonection failed", error );
}
