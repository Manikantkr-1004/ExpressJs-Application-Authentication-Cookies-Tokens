import mongoose from "mongoose";

export const ConnectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGOURL as string);
        console.log('Mongodb Connected');        
    } catch (error) {
        console.log('Mongodb not connected', error);        
    }
};