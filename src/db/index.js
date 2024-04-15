import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        //console.log(connectionInstance)
        console.log(`MONGODB connected !! DB Host: ${connectionInstance.connection.host}`)
        //connectionInstance ko check karna hai what does it consist of

    } catch (error) {
        console.error("MONGO DB error", error)
        process.exit(1);
    }
}

export default connectDB