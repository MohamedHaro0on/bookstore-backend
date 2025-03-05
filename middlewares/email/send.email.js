/* eslint-disable node/prefer-global/process */

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, HTMLFORM) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email_user_name,
      pass: process.env.email_password
    }
  });
  try {
    // send mail with defined transport object
    console.log('this is the process ', process.env);
    const emailToken = await jwt.sign({ email }, process.env.EMAIL_SECRET_KEY, {
      expiresIn: '1d'
    });
    await transporter.sendMail({
      from: `"Mohamed Ahmed Ali Haroon"<${process.env.email_user_name}>`, // sender address
      to: email, // list of receivers
      subject, // Subject line
      html: HTMLFORM(emailToken)
    });
  } catch (error) {
    console.log('this is the error ', error);
  }
};
export default sendEmail;
