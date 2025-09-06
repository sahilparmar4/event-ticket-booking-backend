import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL as string;
console.log(mongoUrl);
mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log('Connection has been established successfully');
    })
    .catch((error) => {
        console.log('Error established successfully', error);
    });
