// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
//   host: 'smtp.mailtrap.io',
//   port: 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendVerificationEmail = async (to, token) => {
  const info = await transporter.sendMail({
    from: '"Eshop" <auspitechsolution@gmail.com>',
    to,
    subject: "Your Verification Code",
    text: `Your verification code is: ${token}`,
    html: `<p>Your verification code is: <strong>${token}</strong></p>`
  });

  console.log("Email sent: %s", info);
  console.log("Email sent successfully to:", to);

};

module.exports = sendVerificationEmail;
