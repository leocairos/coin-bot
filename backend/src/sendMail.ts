import nodemailer from 'nodemailer';
import { config } from './config';

interface IMailPar {
  subject: string;
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = async (parms: IMailPar) => {

  const { subject, html } = parms;
  const configs = await config();
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: configs.mailTo,
    subject,
    html
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

export default sendMail;