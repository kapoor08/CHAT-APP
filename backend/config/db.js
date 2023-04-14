const mongoose = require("mongoose");

const connectDB = async (uri) =>{
    try {
        // mongoose.set("Strict Query", false)
        return mongoose.connect(uri);
    } catch (error) {
        console.log(`Error : ${error.message}`);
        process.exit();
    }
}

module.exports = connectDB;