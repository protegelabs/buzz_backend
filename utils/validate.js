const nodeMail = require("nodemailer");

exports.Mail = async (email, pin) => {
  const transportr = await nodeMail.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  const mailOptio = {
    from: process.env.EMAIL,
    to: email,
    subject: "Welcome To BUZZ",
    html: `hi from buzz your pin is ${pin} `,
  };
  try {
    await transportr.sendMail(mailOptio);
  } catch (error) {
    return error.message;
  }
};
exports.randNum = () => {
  return Math.floor(1000 + Math.random() * 9000);

};