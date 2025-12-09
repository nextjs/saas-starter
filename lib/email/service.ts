import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const from = options.from || process.env.EMAIL_FROM || 'noreply@example.com';

    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendBatchEmails(emails: EmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result, index) => ({
    email: emails[index].to,
    status: result.status,
    result: result.status === 'fulfilled' ? result.value : result.reason,
  }));
}
