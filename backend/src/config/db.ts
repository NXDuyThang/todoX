import mongoose from 'mongoose';

 export const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.ConnectionString as string);
        console.log("Kết nối thành công với CSDL");
    } 
    catch (error) {

        console.error("Kết nối thất bại với CSDL", error);
        process.exit(1);

    }
};
