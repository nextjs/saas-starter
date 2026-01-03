# Testing the Credit System

This document provides instructions on how to test the credit system integration.

## 1. Test Credit Granting

1.  Create a test subscription in Stripe for a user in your application.
2.  Trigger a payment for the subscription. You can do this in the Stripe dashboard or by using the Stripe CLI to trigger a `invoice.payment_succeeded` event.
3.  Check that the credits were granted in your database. You can use a database client to run the following queries:

    ```sql
    -- Replace 'cus_test_customer' with the actual Stripe customer ID
    SELECT * FROM teams WHERE stripe_customer_id = 'cus_test_customer';

    -- Check the credit grants logs
    SELECT * FROM credit_grants_logs ORDER BY created_at DESC LIMIT 5;
    ```

## 2. Test Credit Usage

1.  Use the credit usage API endpoint to simulate credit consumption. You can use `curl` or any API client to send a POST request:

    ```bash
    curl -X POST http://localhost:3000/api/credits/use \
      -H "Content-Type: application/json" \
      -d '{"teamId": 1, "credits": 5, "actionType": "test"}'
    ```

    Replace `teamId` with a valid team ID from your database.

2.  Verify that the credits are deducted from the team's balance in the `teams` table.

## 3. Test UI Components

1.  Navigate to your application's dashboard.
2.  Check that the credit balance is displayed correctly.
3.  Navigate to the new `/credits` page.
4.  Verify that the usage and grants history are displayed correctly.

## 4. Test Webhook Processing

1.  Use the Stripe CLI to forward webhooks to your local development server:

    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```

2.  Use the Stripe CLI to trigger test events:

    ```bash
    # Test credit granting
    stripe trigger invoice.payment_succeeded

    # Test subscription updates
    stripe trigger customer.subscription.updated
    ```

3.  Check your application logs to ensure that the webhooks are being received and processed correctly.

## 5. Test Feature Integration

1.  Add the `AIGenerationComponent` to a page in your application to test the frontend credit check.
2.  Use the component to trigger the AI generation API route.
3.  Verify that credits are deducted and that the feature works as expected when the user has sufficient credits.
4.  Test the behavior when the user has insufficient credits. The "Generate" button should be disabled, and an alert should be displayed.
