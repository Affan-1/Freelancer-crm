const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvitationEmail = async ({
  to,
  inviterName,
  role,
  acceptUrl,
  rejectUrl,
}) => {
  const mailOptions = {
    from: `"Freelancer CRM" <${process.env.EMAIL_USER}>`,
    to,
    subject: "You've been invited to join Freelancer CRM",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">

      <h2>Freelancer CRM</h2>

      <p>Hello,</p>

      <p><strong>${inviterName}</strong> invited you to join their team as <strong>${role}</strong>.</p>

      <p>Please choose one of the options below:</p>

      <a href="${acceptUrl}"
      style="background:#4f46e5;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;margin-right:10px;">
      Accept
      </a>

      <a href="${rejectUrl}"
      style="background:#dc2626;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;">
      Decline
      </a>

      <br><br>

      <p>This invitation expires in 7 days.</p>

      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Email sent:", info.messageId);

  return info;
};

module.exports = { sendInvitationEmail };