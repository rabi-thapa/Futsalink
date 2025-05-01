const mongoose= require('mongoose');
const connectDB= async()=>{
    try{
        await mongoose.connect(
            'mongodb+srv://thaparabi8848:xDw0cXFYxNXDTqcM@cluster0.kvr6r.mongodb.net/futsalBookingDB'
        );
        console.log("DB connected")
    }catch(exception){
        console.log('DB connection Error'+ exception);
    }
};

module.exports= connectDB;