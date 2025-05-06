# Business Functions
## Checkout overview
Customers checkout via Stripe 
## Checkout workflow
Stripe triggers an event captured by Stripe.webhook
Two events are created in DB stripe_event table : checkout.session.completed and customer.sbuscription.updated
On customer.sbuscription.updated, Business.subscriptionUpdate is called