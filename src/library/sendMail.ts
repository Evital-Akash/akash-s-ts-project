import nodemailer from "nodemailer";
import { functions } from "./function";

export async function sendMail(email: any, subject: any, message: any) {
  let functionObj = new functions();

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return functionObj.output(400, 0, "Error..");
    } else {
      return functionObj.output(201, 1, "Email send sucess..");
    }
  });
}
