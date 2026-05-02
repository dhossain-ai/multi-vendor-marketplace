# Mobile Header Navigation Fix

## Summary

Fixed the mobile storefront header so it behaves like a compact ecommerce shell instead of showing every navigation link as stacked buttons. Mobile now keeps the brand, cart access, hamburger menu, and one product search bar visible while moving browse/account/seller/admin links into an accessible collapsible menu.

## Files Changed

- `src/components/layout/site-header.tsx`
- `src/components/layout/mobile-nav-drawer.tsx`
- `src/features/cart/components/cart-nav.tsx`

## Mobile Behavior

- The mobile top row shows the Northstar Market brand, cart access, and hamburger menu.
- The product search form remains visible below the compact brand row.
- Browse, category, featured, new arrivals, auth, account, orders, seller, and admin links move into a collapsible mobile menu.
- Link visibility still comes from the existing server-loaded auth/profile/seller state.

## Desktop Behavior Preserved

- Desktop keeps the existing inline product search, browse navigation, cart, account/orders, seller, and admin links.
- The hamburger menu is hidden at desktop width.

## Responsive And Accessibility Notes

- The menu button exposes `aria-expanded`, `aria-controls`, and a clear accessible label.
- The collapsible menu has an explicit mobile navigation label.
- Header links and menu controls keep visible focus states.
- Mobile header vertical space is reduced because the full navigation list is no longer always rendered inline.

## Checks Run

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed
