import mongoose from "mongoose";

const DBconnection = () => {
  try {
    mongoose
      .connect(process.env.DB_URI)
      .then((con) => {
        console.log("the connection was a suscessfull", con.connection.host);
      })
      .catch((e) => {
        process.exit();
      });
  } catch (e) {
    process.exit();
  }
};

export default DBconnection;
