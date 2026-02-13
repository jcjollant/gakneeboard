# Kneeboard Store
## Goal
GA Kneeboard store is the place to purchase laminated prints. At a high level, customers will be able to purchase predesigned prints from templates or custom prints for their custom created kneeboards.

Eventually, users will also be able to manage their subscriptions from the store. For the time being, Subscript are still purchased via the Plans page and Account Details dialog.

## Customer Experience
After selecting a kneeboard of their choice, user clicks the print menu action.
In the Print Options dialog, Customers adjust settings and  have access to a new "Laminate" button next to "Print". When clicked, it will take them to the store page.
On the store page, user can see their PDF and select the format they want. User can see prices and shipping costs.
Once their selection is made, they can checkout.
Checkout takes them to Stripe checkout. Where they provide payment information and shipping address. They are not able to edit the order from stripe
If checkout is successful, they should be redirected to GA Kneeboard "Thank You" page.

## Order Fulfillment
Fulfillment will be handled manually.

## Formats and pricing
We will offer the following formats:
1. Full Page : 8.5 x 11 two sided (One sheet, 4 kneeboard pages) $25
2. Half Page, no binding : 5.5 x 8.5 two sided (One sheet, 2 kneeboard pages) $19
3. Half Page, Ring bound : 5.5 x 8.5 two sided (Two sheets, 4 kneeboard pages) $24
4. Half Page, Spiral bound : 5.5 x 8.5 two sided (Two sheet, 4 kneeboard pages) $29
We will provide photos for each format on the store page.

## Admin Screen
Admin users should be able to see a list of all open (NEW | PAID) print orders and their status in a new Card in the admin screen. The card should be titled "Print Orders".
Admin users should be able to change the status of an order to SHIPPED.

## Implementation Directions and Backend consideration
Goal : Keep a record of the order with all necessary information for fullfillement.

### Flow
1. In the frontend, User clicks 'Laminate' button in the Print Options dialog, which generates a PDF of their liking.
2. PDF is uploaded from the frontend to backend via a new API endpoint, then to the Blob Storage. If the upload fails, user should be notified.
3. If the upload is successful, the user is taken to the store page where they can select a print format (from list of 4 formats stated above) and clicks "Add to Cart"
4. User clicks "Checkout" and is taken to Stripe checkout
5. In the backend, a print order is created (status NEW)
6. Stripe webhook invokes Business.createProductPurchase
7. We reconcile the order and change status to PAID
8. Admin user receives an email notification of the new order
9. Admin user views the print order in the admin screen
10. Admin user changes status to SHIPPED when the order is shipped

### Print Orders Table
A new 'print_orders' table should persist orders information. It will contain the following columns:
- id
- user_id
- created_at
- updated_at
- print_format
- pages_count
- pdf_url
- amount_cents (amount in cents)
- shipping_address (populated post checkout)
- order_status (NEW | PAID | SHIPPED | CANCELLED | ABANDONED)
- stripe_session_id (populated post checkout)

I recommend to create an new entry in the print_orders table until payment is confirmed.
We should have a new enum for print formats (FULL-NO-BINDING, HALF-NO-BINDING, HALF-RING, HALF-SPIRAL)
We should be notified of the order via an email message from APU.
Print format, prices and description should be stored in the shared folder, akin to Plans.
Once an order is placed, we should create a usage
We should record a new usage for this operation.
Stale print orders should be set to ABANDONED after 7 days and the associated stored PDF should be deleted. This should be done using the existing housekeeping service (Willie)
If the webook fails, a Ticket should be created (using the existing TicketService) to notify the admin.
While PDF and pages count should be identical, PDF has the source of truth.
