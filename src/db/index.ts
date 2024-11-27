import mongoose from 'mongoose';

export const dbConnection = async ()=>{
    try {
        await mongoose.connect(`${process.env.DB_CONNECTION}`, {})
        console.log("DB online");
    } catch (error) {
        console.log(error);
        throw new Error("Error a la hora de iniciar la BD ver logs");
    }
}

