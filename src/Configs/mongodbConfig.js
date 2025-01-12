const mongoose = require("mongoose");

const ConnectMongoDB = async() => {
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log('Mongodb Connected');        
    } catch (error) {
        console.log('Mongodb not connected', error);        
    }
};

module.exports = {ConnectMongoDB};