const nodemailer = require('nodemailer');

// Create a transporter using Ethereal (free test email service).
// Emails won't arrive in a real inbox, but you can view them at https://ethereal.email
// Replace with real SMTP credentials (Gmail, SendGrid, etc.) for production.
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if real SMTP credentials are configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fall back to Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal test email. View sent emails at: https://ethereal.email');
    console.log(`   Ethereal user: ${testAccount.user}`);
  }

  return transporter;
};

const sendInvitationEmail = async ({ to, inviterName, role, acceptUrl, rejectUrl }) => {
  const transport = await getTransporter();

  const mailOptions = {
    from: `"Freelancer CRM" <${process.env.SMTP_USER || 'noreply@freelancer-crm.com'}>`,
    to,
    subject: `You've been invited to join a team on Freelancer CRM`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        
        <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Freelancer CRM</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Team Collaboration Platform</p>
        </div>

        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 22px;">You're Invited! 🎉</h2>
          
          <p style="color: #475569; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
            <strong style="color: #1e293b;">${inviterName}</strong> has invited you to join their team on Freelancer CRM as a <strong style="color: #4f46e5;">${role}</strong>.
          </p>

          <p style="color: #475569; line-height: 1.7; font-size: 15px; margin: 0 0 30px;">
            Click one of the buttons below to accept or decline this invitation.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-right: 12px; box-shadow: 0 4px 12px rgba(79,70,229,0.35);">
              ✓ Accept Invitation
            </a>
            <a href="${rejectUrl}" style="display: inline-block; background: #f1f5f9; color: #64748b; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; border: 1px solid #e2e8f0;">
              ✗ Decline
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This invitation expires in 7 days. If you did not expect this email, you can safely ignore it.
          </p>
        </div>
      </div>
    `,
  };

  const info = await transport.sendMail(mailOptions);

  // For Ethereal, log the preview URL so the developer can see the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Preview invitation email: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl };
};

module.exports = { sendInvitationEmail };
