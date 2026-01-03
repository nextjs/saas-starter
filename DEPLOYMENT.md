# Deploying the Credit System

This document provides instructions on how to deploy the credit system to a production environment.

## 1. Production Environment Variables

Before deploying, ensure that you have set the following environment variables in your production environment:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CREDIT_METER_ID=meter_...
```

-   `STRIPE_SECRET_KEY`: Your live Stripe secret key.
-   `STRIPE_WEBHOOK_SECRET`: Your live Stripe webhook secret. You can get this from the Stripe dashboard when you create a webhook endpoint.
-   `STRIPE_CREDIT_METER_ID`: The ID of the billing meter created in your live Stripe account.

## 2. Run Production Setup

You need to run the `stripe-setup-script.js` in your production environment to create the billing meter in your live Stripe account.

```bash
STRIPE_SECRET_KEY=sk_live_... node stripe-setup-script.js setup
```

This will create the billing meter and output the `STRIPE_CREDIT_METER_ID` that you need to set in your environment variables.

## 3. Update Webhook Endpoint

In your Stripe Dashboard, update the webhook endpoint to point to your production URL. The endpoint should be `https://your-domain.com/api/webhooks/stripe`.

## 4. Migrate Existing Customers

If you have existing customers, you need to run the `full-setup` command to update their subscriptions with the new metered price.

```bash
STRIPE_SECRET_KEY=sk_live_... node stripe-setup-script.js full-setup
```

This will:

1.  Create the billing meter if it doesn't exist.
2.  Create a metered price for each of your existing products.
3.  Update all active subscriptions to include the new metered price.

**Note:** It's recommended to test this process in a staging environment before running it in production.

## 5. Monitor and Verify

After deploying, it's important to monitor the system to ensure that everything is working as expected.

1.  **Check Webhook Delivery:** In the Stripe Dashboard, check the webhook delivery logs to ensure that your production endpoint is receiving events successfully.
2.  **Monitor Credit Granting:** For new payments, verify that credits are being granted correctly by checking the `credit_grants_logs` table in your database.
3.  **Verify Credit Usage Tracking:** Test credit usage in your production application and verify that the usage is being tracked in the `credit_usage_logs` table and reported to the Stripe billing meter.
4.  **Check Database Logs:** Monitor your database logs for any errors related to the credit system.
