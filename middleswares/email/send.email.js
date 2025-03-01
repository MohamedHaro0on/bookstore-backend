import expressAsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import emailTemplate from "./email.template.js";
import jwt from "jsonwebtoken";
const sendEmail = expressAsyncHandler(async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email_user_name,
      pass: process.env.email_password,
    },
  });

  // send mail with defined transport object
  let token = jwt.sign(req.body.email, process.env.SECRET_KEY);
  const info = await transporter.sendMail({
    from: `"Mohamed Ahmed Ali Haroon"<${process.env.email_user_name}>`, // sender address
    to: req.body.email, // list of receivers
    subject: "Hello ✔", // Subject line
    html: emailTemplate(token),
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  next();
});

export default sendEmail;
