import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import emailTemplate from './email.template.js';

const sendEmail = expressAsyncHandler(async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email_user_name,
      pass: process.env.email_password
    }
  });

  // send mail with defined transport object
  const token = jwt.sign(req.body.email, process.env.EMAIL_SECRET_KEY);
  const info = await transporter.sendMail({
    from: `"Mohamed Ahmed Ali Haroon"<${process.env.email_user_name}>`, // sender address
    to: req.body.email, // list of receivers
    subject: 'Hello ✔', // Subject line
    html: emailTemplate(token)
  });

  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  next();
});

export default sendEmail;
