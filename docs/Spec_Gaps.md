# Spec Gaps & Questions - Iteration 2

## 1. Ambiguity in Pricing & Quantity Logic
The pricing model has changed from "$10 per page" to flat amounts like "$25", with descriptions like "(One sheet, 4 kneeboard pages)".

**The Critical Question:**
Is the listed price (e.g., $25) the price **per physical sheet** (unit price), or the price for the **entire document** regardless of length?

*   **Scenario:** A user has a 20-page kneeboard PDF. They choose "Full Page (One sheet, 4 kneeboard pages)" ($25).
    *   **Interpretation A (Unit Pricing):** They need 5 sheets (20 / 4). Total = 5 * $25 = **$125**.
    *   **Interpretation B (Flat Pricing):** They pay **$25** total for the whole document.
*   **Recommendation:** Please confirm Interpretation A is correct (Price is per physical unit).

## 2. Missing Shipping Cost Definition
The new pricing list removed the explicit "S&H" costs (previously $10.99, etc.).
*   Line 10 still says "User can see prices and shipping costs."
*   **Question:** What is the shipping cost logic?
    *   Is it a flat rate per order? (e.g., $10.99)
    *   Is it included in the $25? (Free shipping)
    *   Does it scale with weight/quantity?
    *   *Note:* `Stripe.checkout` needs this to potentially add a shipping line item or simple surcharge.

## 3. Order Creation & "Add to Cart"
Step 3 says "User clicks 'Add to Cart'". Step 4 says "User clicks 'Checkout'".
*   **Clarification:** Is this a literal "Shopping Cart" (where users can add multiple different kneeboards/formats before paying), or is "Add to Cart" just a button label for a "Buy Now" flow (Single Item)?
    *   *Assumption:* Single Item flow (Laminate -> Preview -> Buy).
    *   If it's a real cart, we need a `Cart` table and significantly more complex frontend logic.

## 4. Housekeeping & "Willie"
*   **Confirmed:** "Willie" is the daily maintenance cron (`/maintenance/...`).
*   **Action Plan:** I will add a method to `HouseKeeping.ts` (or `Maintenance.ts`) to:
    1.  Select `print_orders` where `status = NEW` AND `created_at < NOW - 7 days`.
    2.  Delete the corresponding blob (using `pdf_url`).
    3.  Update status to `ABANDONED`.

## 5. Technical clarifications
*   **PDF Page Count:** The backend must validate the page count to calculate the price (if Interpretation A is true). I will use `pdfjs-dist` to read the page count from the uploaded Blob buffer before creating the generic order data.
*   **Stripe Reconciliation:** I will use `metadata: { type: 'print_order', print_order_id: ... }` in the Stripe Session to link the webhook back to the DB record.

## 6. Pending Questions Summary
1.  **Pricing:** Is the listed price **per sheet**?
2.  **Shipping:** What is the shipping cost rule?
3.  **Cart:** Is this a single-item checkout or a multi-item cart?
