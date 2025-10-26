import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || "My App",
      },
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};