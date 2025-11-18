# Mobile Number Verification for WhatsApp Integration

**Date:** November 9, 2025
**Status:** Implemented
**Decision Makers:** Development Team

## Context

The platform requires users to provide and verify their mobile phone numbers to enable WhatsApp service integration. This allows the system to:

- Add verified mobile numbers to a whitelist for WhatsApp agent access
- Send SMS verification codes to confirm number ownership
- Provide secure, authenticated access to WhatsApp-based features
- Comply with best practices for phone number collection and verification

## Decision

We implemented a comprehensive mobile number verification system with the following components:

### 1. Database Schema Changes

Added five new columns to the `users` table:

- `mobile_country_code`: VARCHAR(10) - Stores country code (e.g., "+1", "+351", "+1234")
  - Note: Increased from VARCHAR(5) to VARCHAR(10) to support all international codes
- `mobile_number`: VARCHAR(20) - Stores phone number without country code
- `mobile_verified`: TIMESTAMP - Verification timestamp (NULL if unverified)
- `mobile_verification_token`: VARCHAR(10) - 6-digit verification code
- `mobile_verification_expires`: TIMESTAMP - Expiration time for verification code (10 minutes)

**Migrations:**

- Migration 0004: Added initial mobile number fields
- Migration 0005: Increased country code length from 5 to 10 characters

### 2. User Experience Flow

**Sign-up:**

- New users must provide mobile number during registration
- Phone input uses `react-phone-number-input` library for professional UI with country code dropdown
- Number is stored but not initially verified
- User can complete sign-up and access dashboard with unverified number

**Existing Users:**

- Dashboard displays prominent amber banner prompting mobile number addition
- Banner appears on all dashboard pages except /dashboard/settings
- Can be dismissed temporarily but persists across sessions until number is added

**Verification Process:**

1. User enters mobile number in international format (+[country code][number])
2. System generates 6-digit verification code valid for 10 minutes
3. Code is logged to console (dev) and would be sent via SMS (production)
4. User enters code to verify number ownership
5. Verified status is recorded with timestamp

**Number Management:**

- Users can view, change, and re-verify their mobile number in /dashboard/settings
- Changing number resets verification status
- Visual indicators show verification status (✓ Verified / ⚠ Not verified)

### 3. API Endpoints

**POST /api/user/mobile**

- Updates user's mobile number
- Generates and sends verification code
- Resets verification status when number changes

**POST /api/user/mobile/verify**

- Validates verification code
- Checks expiration (10-minute window)
- Marks number as verified on success

### 4. UI Components

**react-phone-number-input Integration:**

- Professional country code dropdown with flags
- Automatic formatting as user types
- International phone number validation
- Custom CSS styling matching app design (orange theme, rounded inputs)

**Mobile Number Card (Dashboard Settings):**

- Display current number and verification status
- Change number functionality
- Verification code input
- Clear success/error messaging
- Loading states for async operations

### 5. Security Considerations

- Verification codes expire after 10 minutes
- Codes are 6 digits (100,000 - 999,999)
- Only authenticated users can update/verify numbers
- Verification token stored separately from phone number
- Token cleared after successful verification

## Rationale

### Why This Approach?

**Separate Country Code Storage:**

- Enables easier filtering and validation by country
- Simplifies SMS provider integration (most require separate country code)
- Improves data quality and prevents formatting inconsistencies

**Optional Verification at Sign-up:**

- Reduces friction in registration flow
- Allows users to explore platform before committing to SMS verification
- Persistent prompts ensure compliance without blocking access

**Time-limited Verification Codes:**

- Industry standard for SMS verification
- Balances security with user convenience
- 10-minute window is long enough for most scenarios but short enough to prevent abuse

**Professional Phone Input Library:**

- `react-phone-number-input` is widely used and maintained
- Provides excellent UX with country detection and formatting
- Reduces user errors with visual feedback
- Matches enterprise-level phone input patterns

## Trade-offs

### Advantages

- ✅ Smooth user onboarding (doesn't block registration)
- ✅ Professional, familiar phone input UI
- ✅ Clear verification status and easy number management
- ✅ Ready for SMS provider integration (Twilio, AWS SNS, etc.)
- ✅ Secure verification flow with expiration

### Disadvantages

- ⚠️ SMS integration not yet implemented (logged to console in dev)
- ⚠️ Users can access dashboard with unverified numbers
- ⚠️ Banner can be dismissed (though it reappears)
- ⚠️ Additional database fields increase schema complexity

## Migration Steps

### Completed

1. ✅ Database migration adding mobile fields to users table
2. ✅ Updated sign-up form with phone input field
3. ✅ Created mobile number management UI in settings
4. ✅ Implemented verification API endpoints
5. ✅ Added dashboard banner for existing users
6. ✅ Updated sign-up action to handle mobile numbers

### Pending Production Setup

1. **Integrate SMS Provider** ✅ **COMPLETED - Using Twilio**

   - ✅ Installed `twilio` package
   - ✅ Created helper function in `lib/firebase-admin.ts`
   - ✅ Updated `/api/user/mobile/route.ts` to send actual SMS
   - ✅ Added environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
   - ✅ Created setup guide in `docs/TWILIO_SETUP.md`
   - 🔜 Add rate limiting to prevent SMS spam

2. **WhatsApp Whitelist Integration**

   - Create endpoint to sync verified numbers to WhatsApp service
   - Schedule periodic sync job for verified numbers
   - Handle number removal when users delete accounts

3. **Rate Limiting**

   - Limit verification code requests (e.g., max 3 per hour per user)
   - Implement cooldown between verification attempts
   - Log suspicious patterns for security monitoring

4. **Testing**
   - Test with international numbers across different countries
   - Verify SMS delivery in production environment
   - Test error scenarios (expired codes, invalid numbers)

## Rollback Plan

If issues arise with the mobile number feature:

1. **Database:** Migration can be rolled back by running:

   ```sql
   ALTER TABLE users DROP COLUMN mobile_country_code;
   ALTER TABLE users DROP COLUMN mobile_number;
   ALTER TABLE users DROP COLUMN mobile_verified;
   ALTER TABLE users DROP COLUMN mobile_verification_token;
   ALTER TABLE users DROP COLUMN mobile_verification_expires;
   ```

2. **Code:** Revert commits related to:

   - Sign-up form changes
   - Dashboard layout banner
   - General settings mobile card
   - API route handlers
   - Schema updates

3. **Users:** Existing data preserved; removing columns doesn't affect other user data

## Next Steps

1. **Short-term (before production launch):**

   - Integrate Twilio or AWS SNS for SMS sending
   - Add rate limiting to verification endpoints
   - Set up monitoring for verification success/failure rates
   - Write integration tests for verification flow

2. **Medium-term:**

   - Build admin dashboard to view mobile verification stats
   - Implement phone number portability checks
   - Add support for voice call verification as fallback
   - Create analytics around WhatsApp usage by verified users

3. **Long-term:**
   - Consider supporting additional auth methods (WhatsApp auth)
   - Evaluate two-factor authentication using mobile numbers
   - Build automated fraud detection for phone verification
   - Support international number formats comprehensively

## SMS Provider Options

### Free Tier Options for Development/Small Scale

1. **Twilio** (Recommended for starting)

   - Free trial: $15 credit (≈500-750 SMS)
   - After trial: Pay-as-you-go ($0.0079/SMS for US, varies by country)
   - Pros: Easy integration, excellent documentation, reliable
   - Setup time: ~15 minutes
   - Best for: Development and initial production

2. **AWS SNS (Simple Notification Service)**

   - Free tier: First 100 SMS/month free (indefinitely)
   - After free tier: $0.00645/SMS for US
   - Pros: Part of AWS ecosystem, good if already using AWS
   - Setup time: ~30 minutes
   - Best for: AWS-based infrastructure

3. **Vonage (formerly Nexmo)**

   - Free trial: €2 credit (≈50 SMS)
   - After trial: Pay-as-you-go (€0.04/SMS for EU)
   - Pros: Good international coverage
   - Setup time: ~20 minutes
   - Best for: European markets

4. **MessageBird**
   - Free trial: €10 credit
   - After trial: Pay-as-you-go pricing
   - Pros: Good API, multi-channel support
   - Setup time: ~20 minutes

### Truly Free Alternatives (Limited/Not Recommended for Production)

5. **Firebase Phone Authentication**

   - Free quota: 10,000 verifications/month on Spark plan
   - Pros: Completely free for low volume, handles SMS internally
   - Cons: Less control, tied to Firebase ecosystem
   - Best for: MVP/small apps with <10k users/month

6. **Email-based Verification as Fallback**
   - Cost: Free
   - Implementation: Send verification code via email instead
   - Pros: No SMS costs, works for all users
   - Cons: Less secure, doesn't verify phone ownership
   - Best for: Backup when SMS fails or budget constrained

### Recommended Approach for Your Use Case

**Phase 1 - Development & Testing:**

- Use console logging (current implementation)
- Or use Twilio free trial for real SMS testing

**Phase 2 - Initial Launch:**

- **Firebase Phone Auth** if expecting <10k verifications/month
- **Twilio** if needing more control and willing to pay $0.01/SMS
- Budget estimate: 1000 users × 2 verifications (signup + re-verify) = $20/month

**Phase 3 - Scale:**

- Migrate to AWS SNS if using AWS infrastructure (cheaper at scale)
- Implement email fallback for cost-sensitive users
- Add rate limiting to prevent abuse

### Cost Comparison Example (1000 users/month)

| Provider       | First Month                 | Ongoing/Month | Notes                |
| -------------- | --------------------------- | ------------- | -------------------- |
| Twilio Trial   | Free ($15 credit)           | ~$15-20       | Easy to start        |
| AWS SNS        | $6 (100 free + 900×$0.0065) | $6-13         | After first 100 free |
| Firebase       | Free                        | Free          | If under 10k/month   |
| Email fallback | Free                        | Free          | Not phone verified   |

### Implementation Priority

For your WhatsApp integration:

1. ✅ Console logging (current) - Development
2. 🔜 Firebase Phone Auth - Quick free production start
3. 🔜 Twilio - When needing reliability/scale
4. 📅 AWS SNS - Long-term if scaling significantly

### Quick Implementation Examples

**Option A: Twilio (Easiest to integrate)**

```typescript
// Install: pnpm add twilio
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Your verification code is: ${verificationToken}`,
  to: `${countryCode}${phoneNumber}`,
  from: process.env.TWILIO_PHONE_NUMBER,
});
```

**Option B: Firebase Phone Auth (Free up to 10k/month)**

```typescript
// Install: pnpm add firebase firebase-admin
import admin from "firebase-admin";

// Initialize once
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Send SMS
const phoneNumber = `${countryCode}${phoneNumber}`;
await admin.auth().createCustomToken(userId, { phoneNumber });
// Firebase handles SMS sending automatically through their SDK
```

**Option C: AWS SNS (100 free/month)**

```typescript
// Install: pnpm add @aws-sdk/client-sns
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

await snsClient.send(
  new PublishCommand({
    Message: `Your verification code is: ${verificationToken}`,
    PhoneNumber: `${countryCode}${phoneNumber}`,
  })
);
```

## References

- [react-phone-number-input documentation](https://www.npmjs.com/package/react-phone-number-input)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Firebase Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [AWS SNS SMS](https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html)
- [E.164 phone number format](https://en.wikipedia.org/wiki/E.164)
- [OWASP Phone Number Verification Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Phone_Number_Verification_Cheat_Sheet.html)

## Notes

- The implementation follows industry best practices for phone number collection
- UI/UX patterns mirror those used by major platforms (Google, WhatsApp, Telegram)
- Code is ready for SMS provider integration with minimal changes
- Existing users are gently prompted but not forced to add numbers
- New users must provide a number at sign-up for immediate WhatsApp access
