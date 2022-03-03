const nodemailer = require('nodemailer');

//Configure nodemailer with mailtrap
const setNodeMailer = async (options) => {
  //Create the transporter object
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    debug: true,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Configure sendmail options
  await transporter.sendMail({
    from: 'Himeth Dahanayake <daha@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};

module.exports = setNodeMailer;
