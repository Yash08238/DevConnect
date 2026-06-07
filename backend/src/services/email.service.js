const createTransporter = require("../config/email");

const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
};

exports.sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <h1>Verify Your DevConnect Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}" target="_blank">Verify Email</a>
  `;
  await sendEmail({ email, subject: "Verify Your DevConnect Email", html });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <h1>Reset Your DevConnect Password</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail({ email, subject: "DevConnect Password Reset", html });
};
