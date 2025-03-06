import mongoose from 'mongoose';
import process from 'process';

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
