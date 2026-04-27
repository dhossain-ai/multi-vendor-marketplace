# Seller Flow Demo & Manual QA Checklist

Use this checklist to manually verify the full seller lifecycle from registration through fulfillment.

## 1. Registration & Approval

- [ ] 1. Visit `/sell` as an unauthenticated user to read the seller pitch.
- [ ] 2. Go to `/seller/register` while signed out.
- [ ] 3. Sign in or sign up.
- [ ] 4. Submit the seller application form.
- [ ] 5. Confirm you are redirected and see the pending state notice.
- [ ] 6. As an admin, open `/admin/sellers` and find the new application.
- [ ] 7. Open `/admin/sellers/[id]` to review the application details.
- [ ] 8. Reject the seller with a specific reason.
- [ ] 9. As the seller, see the rejection and resubmit via `/seller/register`.
- [ ] 10. As an admin, approve the seller (ensure their email is verified, or it will be blocked).

## 2. Store Setup & Products

- [ ] 11. As the approved seller, confirm the seller dashboard (`/seller`) loads properly.
- [ ] 12. Go to `/seller/settings` and edit the store settings (bio, logo). Notice the slug is locked.
- [ ] 13. Go to `/seller/products/new` and create a draft product without an image.
- [ ] 14. Try to publish an invalid product (missing category or negative stock) and confirm validation blocks it.
- [ ] 15. Publish a valid active product with an image, category, price, and valid stock >= 1.
- [ ] 16. Confirm the product appears publicly on the storefront and `/products/[slug]`.

## 3. Orders & Fulfillment

- [ ] 17. As a customer, add the product to the cart.
- [ ] 18. Complete checkout and payment.
- [ ] 19. As the seller, confirm the paid order appears in `/seller/orders`.
- [ ] 20. Update the fulfillment status to `processing`, then `shipped`, then `delivered`. Add a tracking code and shipment note.
- [ ] 21. Confirm you cannot see the customer's email address on the order detail view.
- [ ] 22. Confirm the seller cannot cancel the paid item or mutate the payment status.

## 4. Suspension

- [ ] 23. As an admin, suspend the seller via `/admin/sellers/[id]`.
- [ ] 24. As the suspended seller, confirm you lose access to active operations (products/orders/settings) and public products are hidden.
