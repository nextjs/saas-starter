'use server';

import { z } from 'zod';

// Define the schema for contact form validation
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export async function submitContactForm(data: ContactFormData) {
  try {
    // Validate the data
    const validatedData = contactFormSchema.parse(data);

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM or support system
    
    // For now, we'll simulate a successful submission
    console.log('Contact form submission:', validatedData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, you might want to:
    // - Send an email using a service like SendGrid, Resend, or AWS SES
    // - Store in your database using Drizzle ORM
    // - Send to a CRM like HubSpot or Salesforce
    // - Create a ticket in a support system

    // Example database save (uncomment when ready):
    // await db.insert(contactSubmissions).values({
    //   name: validatedData.name,
    //   email: validatedData.email,
    //   message: validatedData.message,
    //   createdAt: new Date(),
    // });

    return { success: true };
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid form data. Please check your inputs.' 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to submit form. Please try again later.' 
    };
  }
}