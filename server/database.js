import mongoose from 'mongoose';

export const connectDB = () => {
    mongoose.connect(process.env.DB_LOCATION, {
        autoIndex: true,
    }).then(() => {
        console.log("MongoDB connected successfully");
    }).catch(err => {
        console.error("MongoDB connection error: ", err);
    });
};
