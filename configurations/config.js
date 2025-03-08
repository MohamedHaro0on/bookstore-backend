import mongoose from 'mongoose';
import process from 'process';

const DBconnection = () => {
  try {

    mongoose
      .connect(process.env.DB_URI)
      .then((con) => {
      })
      .catch(() => {
        process.exit();
      });
  } catch (e) {
    process.exit();
  }
};

export default DBconnection;
