# Kneeboard Store
## Goal
Enable GA Kneeboard users to purchase physical, laminated copies of standard and custom kneeboards.

Input: A standard or custom kneeboard PDF.
Output: A physical product mailed to them.
Pricing: Fixed price for standard kneeboards, dynamic based on the number of physical sheets required for custom kneeboards.

## Customer Experience
Customer can access the store from the main menu or from the print options dialog. 
1. From the main menu, user can select between standard kneeboards. That can be added to cart.
2. From the print options dialog, user can select "Laminate" button next to "Print". When clicked, it will take them to the store page.On the store page, user can see their kneeboard layout and select the format they want. As they make selections, pricing is reflected. 
Once their selection is made, they can checkout.
Checkout takes them to Stripe checkout. Where they provide payment information and shipping address. They are not able to edit the order from stripe
If checkout is successful, they should be redirected to GA Kneeboard "Thank You" page.

## Order Fulfillment
Fulfillment will be handled manually.

## Offering and pricing
### Offering
We have two tiers of offering.
1. Standard kneeboards, fixed price (high volumes)
2. Custom kneeboards, modular pricing (low volume)

We will offer two standard kneeboards initially. Both are one Half Page, Double Sided, No binding.
1. Reference card
2. Seattle GA Airports

For custom kneeboard, our printing evolves along two dimensions : 
- Format : Full Page (letter size), Half Page
- Binding : No binding, Ring bound, Spiral bound

### Pricing Strategy
We utilize a split pricing strategy: **Fixed** for standard inventory and **Dynamic** for custom user creations.

#### 1. Standard Kneeboards (Fixed Price)
Pre-designed reference cards (e.g., "Seattle GA Airports").
* **Format:** Half Page, Double Sided, No Binding (`HALF_LOOSE`).
* **Price:** **$9.99** (Flat rate, includes shipping).
* **Logic:** These ignore page counts; the price is hardcoded.

#### 2. Custom Kneeboards (Dynamic Price)
User-generated checklists. Prices are calculated based on the **Binding Format** and **Sheet Count**.
* **Definition:** 1 Physical Sheet = 2 Digital Pages (Duplex).
* **Formula:** `Total = Base_Price + (Extra_Sheets * Overage_Rate)`
* **Overage Rate:** **$2.00** per additional sheet (beyond the first).

**Base Prices (Includes 1st Sheet + Shipping):**
| Format Code | Description | Base Price |
| :--- | :--- | :--- |
| `HALF_LOOSE` | Half Page (No Binding) | **$19.00** |
| `HALF_RING` | Half Page (Ring Bound) | **$24.00** |
| `HALF_SPIRAL` | Half Page (Spiral Bound) | **$29.00** |
| `FULL_STD` | Full Page (8.5 x 11) | **$25.00** |

**Calculation Example (Custom Spiral, 6 Pages):**
1.  **Sheets:** `CEILING(6 pages / 2)` = 3 Sheets.
2.  **Base (includes 1 sheet):** $29.00.
3.  **Extra Sheets:** 3 - 1 = 2.
4.  **Overage:** 2 * $2.00 = $4.00.
5.  **Final Price:** $29.00 + $4.00 = **$33.00**.

#### 3. Database & Implementation Note
To support this in the `print_orders` table, the backend should treat "Standard" items as:
* `print_format`: `HALF_LOOSE`
* `amount_cents`: 999
* `sheets_count`: 1 (Fixed)
* **Constraint:** The frontend must flag these as "Standard" so the dynamic pricing logic is bypassed.

## Admin Screen
Admin users should be able to see a list of all open print orders and their status in a new Card in the admin screen. The card should be titled "Print Orders".
Admin users should be able to change the status of an order to SHIPPED.

## User Experience & Flow
### Phase A: Adding to Cart
#### Scenario 1: Standard Item
1. User click the "Store" button in the main menu.
2. User is presented with a list of standard kneeboard along with prices. Shipping is free on all items. 
3. User selects "Reference Card"
4. System checks for an existing print_order with status DRAFT for this user.
    - If none exists, create one.
5. System creates a print_order_item:
    - product_type: STANDARD
    - price_cents: 999
6. User sees "Added to Cart" toast.

#### Scenario 2: Custom Item
1. User customizes a print from the print dialog with regular print options
2. User clicks "Laminate" in Print Dialog Actions which takes them to the Store Page.
    - The corresponding PDF is generated and uploaded to Blob.
3. User selects Format (e.g., Spiral) on Store Page.
4. System calculates price based on page count.
5. User clicks "Add to Cart".
6. System adds print_order_item to the DRAFT order:
    - product_type: CUSTOM
    - pdf_url: {new_blob_url}
    - price_cents: {calculated_amount}

### Phase B: Checkout (The Cart)
1. Review: User clicks "Cart" icon. System displays list of items in the DRAFT order and a "Total Price".
2. Checkout: User clicks "Proceed to Checkout".
3. Stripe Init: Backend constructs Stripe Session.
4. CRITICAL: Iterate through print_order_items and add each as a line_item in the Stripe payload.
5. client_reference_id: {order_id}
6. Redirect: User pays on Stripe.

### Phase C: Fulfillment & Reconciliation
1. Webhook: checkout.session.completed fires.
2. Update: System finds print_order by ID.
3. Sets status to PAID.
4. Saves shipping_address.
5. Clean Up: The user now has no DRAFT order (cart is empty).
6. Admin user receives an email notification of the new order (from APU)
7. Admin: Dashboard shows the Order. Clicking the order reveals the list of Items (PDFs) to print.
8. Admin user changes status to SHIPPED when the order is shipped


## Implementation Directions and Backend consideration
- Cart Persistence: The DRAFT order acts as the persistent cart. If a user leaves and comes back, fetch the DRAFT order to show their cart.
- Inventory Security: For STANDARD items, hardcode the PDF URL in the backend configuration; do not let the frontend dictate the asset URL.
- Pricing Security: Recalculate the total amount_cents on the backend by summing the items before initializing Stripe. Do not trust the frontend total.
- Print format, prices and description should be stored in the shared folder, akin to Plans.
- Stale print orders should be set to ABANDONED after 7 days and the associated stored PDF should be deleted. This should be done using the existing housekeeping service (Willie)
- If the webook fails, a Ticket should be created (using the existing TicketService) to notify the admin.

### Print Orders Table
A new print_orders table should persist print orders information for the full order lifecycle. It will contain the following columns:
| Column | Type | Description |
| :--- | :--- | :--- |
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key |
| status | ENUM | DRAFT (Cart), PAID, SHIPPED, ABANDONED |
| amount_cents | INTEGER | Sum of all line items |
| stripe_session_id | STRING | Stripe Checkout Session ID |
| shipping_address | JSON | Populated via Webhook |
| created_at | TIMESTAMP | |

### Print Items Table
A new 'print_order_items' table should persist print items information until the order has been shipped It will contain the following columns:
| Column | Type | Description |
| :--- | :--- | :--- |
| id | UUID | Primary Key |
| order_id | UUID | Foreign Key to print_orders |
| product_type | ENUM | STANDARD, CUSTOM |
| display_name | STRING | e.g., "Seattle Airports" or "My C172 Checklist" |
| format_code | ENUM | HALF_LOOSE, HALF_RING, HALF_SPIRAL, FULL_STD |
| pdf_url | STRING | URL to Blob (Custom) or Static Asset (Standard) |
| pages_count | INTEGER | Page count (Used for pricing) |
| sheets_count | INTEGER | Calculated physical sheets |
| price_cents | INTEGER | Final price for this specific item |

## Pricing Considerations (for reference only)
### Cost of goods at home
Paper : $17.19 per 500 sheets => $0.04 per sheet
Lamination : $27.00 per 100 pouches => $0.27 per sheet
Print : $0.65 per sheet
Examples:
- Half Sheet, 1 sheet, 2 pages : $0.04 + $0.27 + $0.65 = $0.96
- Full Sheet, 1 sheet, 4 pages : $0.04 + $0.27 + $0.65 * 2 = $1.61
### Cost of printing at Mail Store
Paper : $0.31 per sheet for 60 lbs paper
Print : $0.61 per side
Lamination : $3.99 per sheet
Examples : 
- Half Sheet, 2 pages, 2 sides : $0.61 * 2 + $0.31 * 1 + $3.99 * 1 = $5.22
- Full Sheet, 4 pages, 2 sides : $0.61 * 2 + $0.31 * 1 + $3.99 * 1 = $6.22
### Cost of shipping
- Half Page Loose : One stamp + envelope : $0.68 + $0.10 = $0.78
- Half Page Ring bound : One stamp + envelope : $0.68 + $0.10 = $0.78
- Half Page Spiral bound : One stamp + envelope : $0.68 + $0.10 = $0.78
- Full Sheet, 4 pages, 2 sides : One stamp + envelope : $0.68 + $0.10 = $0.78