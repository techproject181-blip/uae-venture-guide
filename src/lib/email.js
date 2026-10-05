import nodemailer from "nodemailer";

// Sends email over SMTP with Nodemailer. Without SMTP settings (normal in
// development) the email is printed in the terminal instead, so every flow
// still works and the links can be copied from there.

let transport;

function getTransport() {
  if (transport) return transport;
  transport = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      })
    : nodemailer.createTransport({ jsonTransport: true });
  return transport;
}

/** The address links in emails point to, such as http://localhost:3000. */
export function appUrl(path = "") {
  return `${process.env.APP_URL ?? "http://localhost:3000"}${path}`;
}

/**
 * Sends one email. A failed email is logged but never breaks the request
 * that caused it: the action already happened, and the website shows it too.
 */
export async function sendEmail({ to, subject, text }) {
  try {
    const info = await getTransport().sendMail({
      from: process.env.MAIL_FROM ?? "UAE Venture Guide <no-reply@uaeventureguide.local>",
      to,
      subject,
      text,
    });
    if (!process.env.SMTP_HOST) {
      console.log(`\n--- Email (not sent: SMTP is not set up) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---\n`);
    }
    return info;
  } catch (error) {
    console.error(`Email to ${to} failed:`, error);
    return null;
  }
}
