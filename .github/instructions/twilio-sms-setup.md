# Twilio SMS Setup Guide

## Overview

Unvios uses Twilio to send SMS verification codes for mobile number verification. This is required for WhatsApp integration.

**Status**: ✅ Implemented and Ready
**Related ADR**: `docs/adr/2025-11-09-mobile-number-whatsapp-integration.md`

---

## Quick Setup (10 minutes)

### Step 1: Get Twilio Credentials

1. Sign up at **[https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)**
2. Get **$15 free credit** (≈750 SMS)
3. From the Twilio Console dashboard, copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "Show" to reveal)
4. Buy a **phone number** (free with trial)

### Step 2: Verify Your Test Number (Trial Only)

For trial accounts, verify recipient numbers:

1. Go to: **Phone Numbers** → **Verified Caller IDs**
2. Click **Add a new Caller ID**
3. Enter your test number (e.g., `+351914127195`)
4. Complete verification via SMS or voice call

### Step 3: Configure Environment

Add to `.env.local`:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Restart Server

```bash
pnpm dev
```

### Step 5: Test

1. Navigate to: `http://localhost:3000/sign-up` or `/dashboard/settings`
2. Enter phone number with country code
3. Click "Send Verification Code"
4. **You should receive SMS within seconds!** 📨

---

## Cost & Pricing

**Free Trial:**

- $15 credit = ~750 SMS
- Can only send to verified numbers
- Includes "Sent from Twilio Trial Account" prefix

**After Trial:**

- No monthly fees (pay-as-you-go)
- Portugal: ~$0.056 per SMS
- US: ~$0.0079 per SMS
- UK: ~$0.044 per SMS

See [Twilio Pricing](https://www.twilio.com/pricing/messaging) for all countries.

---

## Development Without Twilio

**The system works without Twilio configured!**

If `TWILIO_*` variables are missing:

- ✅ Verification codes are logged to console
- ✅ Full functionality for development/testing
- ✅ Look for: `📱 SMS VERIFICATION CODE` in terminal

**Production requires real Twilio setup.**

---

## Upgrading to Production

### 1. Upgrade Account

- Go to: Twilio Console → **Billing**
- Add payment method
- No monthly fees, pay per SMS only

### 2. Enable International SMS

- Go to: **Settings** → **Geo Permissions**
- Enable countries you serve (e.g., Portugal, US)

### 3. Remove Trial Limitations

- Send to any number (not just verified)
- Remove trial message prefix
- Higher sending limits

### 4. Set Up Monitoring

- Configure usage alerts
- Set spending limits
- Monitor delivery rates

---

## Troubleshooting

### No SMS Received?

1. **Check console logs** for errors
2. **Verify phone format**: Must include country code (e.g., `+351914127195`)
3. **Trial accounts**: Recipient number must be verified first
4. **Check Twilio logs**: Console → Monitor → Logs → Messaging

### Environment Variables Not Working?

1. Ensure `.env.local` exists in project root
2. No quotes around values
3. Restart dev server after changes
4. Check for typos in variable names

### Authentication Error?

- Double-check Account SID and Auth Token
- No extra spaces in `.env.local`
- Make sure variables don't have quotes

---

## Implementation Details

**Files:**

- `lib/firebase-admin.ts` - `sendVerificationSMS()` function
- `app/api/user/mobile/route.ts` - API endpoint
- Database: `users` table with mobile verification fields

**Flow:**

1. User enters phone number
2. System generates 6-digit code
3. Code saved to DB with 10-minute expiration
4. SMS sent via Twilio (or logged to console)
5. User enters code to verify
6. Number marked as verified in database

**Security:**

- Codes expire after 10 minutes
- Rate limiting on verification attempts
- Phone numbers validated with E.164 format

---

## Alternative: Firebase Phone Auth

If you prefer Firebase (free up to 10,000/month):

1. Follow [Firebase Phone Auth Setup](https://firebase.google.com/docs/auth/web/phone-auth)
2. Update `lib/firebase-admin.ts` implementation
3. Requires client-side Firebase SDK
4. See Firebase documentation for details

---

## Support & Resources

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Community Support**: https://support.twilio.com/
- **Status Page**: https://status.twilio.com/
- **ADR**: `docs/adr/2025-11-09-mobile-number-whatsapp-integration.md`

---

## Production Checklist

Before going live:

- [ ] Upgrade Twilio account (remove trial limits)
- [ ] Configure geo permissions for target countries
- [ ] Set up usage alerts and spending limits
- [ ] Test with multiple phone numbers
- [ ] Implement rate limiting for SMS sending
- [ ] Monitor delivery rates in Twilio console
- [ ] Add error alerting for failed SMS
- [ ] Document incident response for SMS outages

---

**Ready to go!** Add your credentials and start sending SMS verification codes.
