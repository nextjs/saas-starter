import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * API handler to save quiz data
 * 
 * Receives quiz answers, form data (email, options), and session details
 * Maps the step data to individual columns in the database
 */
export async function POST(request: Request) {
  try {
    console.log('POST request received at /api/quiz/save');
    
    const data = await request.json();
    const { sessionId, answers, formData, currentStep } = data;
    
    // Log the incoming data
    console.log(`Processing quiz data for session ${sessionId}, step ${currentStep}`);
    console.log('Received answers:', JSON.stringify(answers));
    console.log('Received formData:', JSON.stringify(formData));
    
    // Check if the required sessionId is provided
    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }
    
    // Extract step-specific data for individual column storage
    // This maps the JSON answers to individual DB columns
    const stepData: Record<string, any> = {};
    
    // Process answers for specific steps and map to dedicated columns
    if (answers) {
      console.log('Mapping answers to specific columns...');
      
      // Map individual question answers to specific columns
      if (answers[1]) {
        stepData.q1_gender = answers[1];
        console.log('Mapped q1_gender:', answers[1]);
      }
      if (answers[2]) {
        stepData.q2_age_group = answers[2];
        console.log('Mapped q2_age_group:', answers[2]);
      }
      if (answers[3]) {
        stepData.q3_goal = answers[3];
        console.log('Mapped q3_goal:', answers[3]);
      }
      if (answers[4]) {
        stepData.q4_income_source = answers[4];
        console.log('Mapped q4_income_source:', answers[4]);
      }
      if (answers[5]) {
        stepData.q5_work_hours = answers[5];
        console.log('Mapped q5_work_hours:', answers[5]);
      }
      if (answers[7]) {
        stepData.q7_income_range = answers[7];
        console.log('Mapped q7_income_range:', answers[7]);
      }
      if (answers[8]) {
        stepData.q8_income_goal = answers[8];
        console.log('Mapped q8_income_goal:', answers[8]);
      }
      if (answers[10]) {
        stepData.q10_work_life_harmony = answers[10];
        console.log('Mapped q10_work_life_harmony:', answers[10]);
      }
      if (answers[11]) {
        stepData.q11_passion_prevented = answers[11];
        console.log('Mapped q11_passion_prevented:', answers[11]);
      }
      if (answers[12]) {
        stepData.q12_flexibility_priority = answers[12];
        console.log('Mapped q12_flexibility_priority:', answers[12]);
      }
      if (answers[14]) {
        stepData.q14_outside_employment = answers[14];
        console.log('Mapped q14_outside_employment:', answers[14]);
      }
      if (answers[15]) {
        stepData.q15_contractor_consideration = answers[15];
        console.log('Mapped q15_contractor_consideration:', answers[15]);
      }
      if (answers[16]) {
        stepData.q16_ai_experience = answers[16];
        console.log('Mapped q16_ai_experience:', answers[16]);
      }
      if (answers[17]) {
        stepData.q17_ai_awareness = answers[17];
        console.log('Mapped q17_ai_awareness:', answers[17]);
      }
      if (answers[20]) {
        stepData.q20_marketing_capabilities = answers[20];
        console.log('Mapped q20_marketing_capabilities:', answers[20]);
      }
      if (answers[24]) {
        stepData.q24_monthly_income_goal = answers[24];
        console.log('Mapped q24_monthly_income_goal:', answers[24]);
      }
      if (answers[26]) {
        stepData.q26_daily_time_commitment = answers[26];
        console.log('Mapped q26_daily_time_commitment:', answers[26]);
      }
      
      // Handle multi-choice answers
      if (Array.isArray(answers[19])) {
        stepData.q19_professional_domains = answers[19];
        console.log('Mapped q19_professional_domains (array):', answers[19]);
      }
      if (Array.isArray(answers[22])) {
        stepData.q22_ai_platforms = answers[22];
        console.log('Mapped q22_ai_platforms (array):', answers[22]);
      }
      if (Array.isArray(answers[25])) {
        stepData.q25_success_celebration = answers[25];
        console.log('Mapped q25_success_celebration (array):', answers[25]);
      }
    }
    
    // Add last completed step
    if (currentStep && !isNaN(Number(currentStep))) {
      stepData.lastCompletedStep = Number(currentStep);
      console.log('Set lastCompletedStep:', Number(currentStep));
      
      // Record timestamp for milestone questions
      const now = new Date();
      // First question
      if (Number(currentStep) >= 1 && !stepData.q1_completed_at) {
        stepData.q1_completed_at = now;
        console.log('Set milestone timestamp for q1');
      }
      // Midpoint
      if (Number(currentStep) >= 10 && !stepData.q10_completed_at) {
        stepData.q10_completed_at = now;
        console.log('Set milestone timestamp for q10');
      }
      // Near-end
      if (Number(currentStep) >= 20 && !stepData.q20_completed_at) {
        stepData.q20_completed_at = now;
        console.log('Set milestone timestamp for q20');
      }
      // Summary view
      if (Number(currentStep) >= 27 && !stepData.q27_completed_at) {
        stepData.q27_completed_at = now;
        console.log('Set milestone timestamp for q27');
      }
    }
    
    // Handle form data specifically
    if (formData) {
      console.log('Processing form data...');
      if (formData.email) {
        stepData.email = formData.email;
        stepData.registeredEmail = formData.email;
        console.log('Set email and registeredEmail:', formData.email);
      }
      if (formData.newsletter_optin !== undefined) {
        stepData.newsletterOptedIn = !!formData.newsletter_optin;
        console.log('Set newsletterOptedIn:', !!formData.newsletter_optin);
      }
      if (formData.terms_acceptance !== undefined) {
        stepData.termsAccepted = !!formData.terms_acceptance;
        console.log('Set termsAccepted:', !!formData.terms_acceptance);
      }
    }
    
    // Store analytics data if available
    if (data.analytics) {
      console.log('Processing analytics data...');
      const { referrer, utm_source, utm_medium, utm_campaign, browser, device } = data.analytics;
      if (referrer) {
        stepData.referrer = referrer;
        console.log('Set referrer:', referrer);
      }
      if (utm_source) {
        stepData.utmSource = utm_source;
        console.log('Set utmSource:', utm_source);
      }
      if (utm_medium) {
        stepData.utmMedium = utm_medium;
        console.log('Set utmMedium:', utm_medium);
      }
      if (utm_campaign) {
        stepData.utmCampaign = utm_campaign;
        console.log('Set utmCampaign:', utm_campaign);
      }
      if (browser) {
        stepData.browser = browser;
        console.log('Set browser:', browser);
      }
      if (device) {
        stepData.device = device;
        console.log('Set device:', device);
      }
    }
    
    // Calculate time spent if timestamp info is available
    if (data.startTime && data.currentTime) {
      console.log('Calculating time spent...');
      const startTime = new Date(data.startTime).getTime();
      const currentTime = new Date(data.currentTime).getTime();
      if (!isNaN(startTime) && !isNaN(currentTime)) {
        stepData.timeSpentSeconds = Math.floor((currentTime - startTime) / 1000);
        console.log('Set timeSpentSeconds:', stepData.timeSpentSeconds);
      }
    }
    
    console.log('Prepared stepData for database:', JSON.stringify(stepData));
    
    try {
      // Check if a record with this sessionId already exists
      console.log('Checking if record exists for sessionId:', sessionId);
      const existingRecord = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.sessionId, sessionId))
        .limit(1);
        
      console.log('Existing record check result:', existingRecord.length > 0 ? 'Found' : 'Not found');
      
      let result;
      
      if (existingRecord.length > 0) {
        // Update existing record - merge stepData with other required fields
        console.log('Updating existing record...');
        result = await db
          .update(quizResults)
          .set({
            answers: answers, // Store the complete answers object
            currentStep: Number(currentStep) || existingRecord[0].currentStep,
            score: data.score || existingRecord[0].score,
            updatedAt: new Date(),
            completedAt: currentStep === 'final' ? new Date() : existingRecord[0].completedAt,
            ...stepData // Add all the individual step data
          })
          .where(eq(quizResults.sessionId, sessionId))
          .returning();
        
        console.log('Record updated successfully');
      } else {
        // Create new record
        console.log('Creating new record...');
        result = await db
          .insert(quizResults)
          .values({
            sessionId: sessionId,
            answers: answers,
            currentStep: Number(currentStep),
            score: data.score || null,
            completedAt: currentStep === 'final' ? new Date() : null,
            ...stepData // Add all the individual step data
          })
          .returning();
        
        console.log('New record created successfully');
      }
      
      console.log('Database operation result:', result);
      
      // Return success response with processed data
      return NextResponse.json({ 
        success: true,
        sessionId,
        message: 'Quiz data saved successfully',
        data: result[0],
        processedSteps: Object.keys(stepData).length
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: (dbError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in quiz/save API handler:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz data', details: (error as Error).message },
      { status: 500 }
    );
  }
} 