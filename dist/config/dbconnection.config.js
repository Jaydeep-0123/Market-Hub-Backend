import mongoose from "mongoose";
const dbConnection = (url) => {
    try {
        mongoose.connect(url);
        console.log("DB Connected");
    }
    catch (error) {
        if (error instanceof Error)
            console.log(error.message);
        else
            console.log(String(error));
    }
};
export default dbConnection;
