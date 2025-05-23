import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore: missing type declarations for nodemailer
import nodemailer from 'nodemailer';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const userName = formData.get('userName') as string || user.name || 'Unknown User';
    const userEmail = formData.get('userEmail') as string || user.email;

    // Get attachments
    const attachments: nodemailer.Attachment[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof Blob) {
        const filename = (value as File).name;
        const contentType = (value as File).type;
        
        // Convert file to Buffer
        const buffer = Buffer.from(await (value as File).arrayBuffer());
        
        attachments.push({
          filename,
          content: buffer,
          contentType
        });
      }
    }

    // Create email transporter using the same configuration as password reset
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Format the email content
    const htmlContent = `
      <h2>Support Request from ${userName}</h2>
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Description:</strong></p>
      <p>${description.replace(/\n/g, '<br>')}</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'pomoc@dexterlab.pl',
      subject: `Support Request: ${subject}`,
      html: htmlContent,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing support request:', error);
    return NextResponse.json(
      { error: 'Failed to process support request' },
      { status: 500 }
    );
  }
} 