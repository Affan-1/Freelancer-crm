const sendInvitationEmail = async ({
  to,
  inviterName,
  role,
  acceptUrl,
  rejectUrl,
}) => {
  const html = `
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
  `;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(process.env.MAIL_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret: process.env.MAIL_SCRIPT_SECRET,
        to,
        subject: "You've been invited to join Freelancer CRM",
        html,
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!data.success) {
      console.log("Mail script error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Invitation email sent to:", to);
    return data;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { sendInvitationEmail };