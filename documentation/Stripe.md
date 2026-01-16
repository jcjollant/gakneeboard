## Authtenticating Stripe.exe CLI
.\stripe.exe login --api-key sk_test_51Q...Qtv

## Starting the CLI to redirect the webhook
.\stripe.exe listen --forward-to localhost:3000/stripe/webhook