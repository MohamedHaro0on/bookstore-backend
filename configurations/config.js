/* eslint-disable node/prefer-global/process */
import mongoose from 'mongoose';

const DBconnection = () => {
  try {
    mongoose
      .connect(process.env.DB_URI)
      .then((con) => {
        console.log('the connection was a suscessfull', con.connection.host);
      })
      .catch(() => {
        process.exit();
      });
  } catch (e) {
    console.log('the connection failed : ', e);
    process.exit();
  }
};

export default DBconnection;
