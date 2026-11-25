# UI/UX Design Specification
## CeraVe-Inspired Skincare Storefront

## 1. Design objective

Create an original skincare e-commerce identity inspired by the clean, clinical, product-focused visual language of the CeraVe website.

Use the reference for general layout and visual direction only. Do not copy its logo, exact page content, proprietary assets or brand identity. Use an original store name and product content.

The site should feel:
- Clean and uncluttered.
- Trustworthy and professional.
- Modern and easy to navigate.
- Product-focused.
- Consistent across all pages.

## 2. Colour palette

| Token | Hex | Usage |
|---|---|---|
| Primary navy | `#003B70` | Main brand colour, headings, footer |
| Secondary blue | `#0076B8` | Links, buttons, accents |
| Light blue | `#DCEFFA` | Hero backgrounds and highlights |
| White | `#FFFFFF` | Main page background |
| Light grey | `#F4F6F8` | Product sections and panels |
| Dark text | `#202B35` | Body text |
| Muted text | `#687783` | Secondary information |
| Border | `#E3E9ED` | Dividers and card borders |

Use colours consistently. Avoid adding many unrelated accent colours.

## 3. Typography

- Suggested font: Inter or a similar clean sans-serif.
- Use bold, clear headings.
- Use readable body text with comfortable line-height.
- Product names should be medium or semibold.
- Buttons should use clear labels and consistent font weight.
- Keep a clear hierarchy between page title, section title and body copy.

## 4. Shared layout

### Header
- Optional slim announcement bar.
- Brand logo/name on the left.
- Main navigation: Home, Shop, About.
- Search icon only if it has a working search function; otherwise omit it.
- Account and cart links on the right.
- Mobile navigation must be usable.

### Footer
- Brand name and short description.
- Shop links.
- Account links.
- Basic contact information only if provided.
- Copyright line.

## 5. Landing page layout

Build sections in this order:

1. Announcement bar (optional).
2. Header/navigation.
3. Hero banner with product image, headline, short supporting text and Shop Now CTA.
4. Shop by category section.
5. Featured products grid.
6. Brand/about section.
7. Simple promotional or informational banner.
8. Footer.

Hero design:
- Large, clean product photography.
- Blue or pale-blue background.
- Strong headline and short text.
- One clear primary CTA.
- Balanced text/image layout on desktop; stacked layout on mobile.

## 6. Shop page

- Page heading and short introduction.
- Simple category filter if categories are available.
- Responsive product grid.
- Product card contains image, name, price and View Details/Add to Cart actions.
- Clear empty state when no products are available.
- Do not add advanced filters, sorting or search unless explicitly approved.

## 7. Product detail page

- Large product image.
- Product name and category.
- Price and description.
- Stock availability.
- Quantity selector.
- Add to Cart button.
- Clear success/error feedback after adding to cart.

## 8. Cart and checkout

Cart:
- Simple list of cart items.
- Product thumbnail, name, unit price and quantity controls.
- Remove action.
- Subtotal and total.
- Continue Shopping and Proceed to Checkout actions.
- Empty cart state.

Checkout:
- Simple delivery details form.
- COD payment method clearly shown.
- Order summary.
- Place Order button.
- Confirmation state after a successful order.

## 9. Login and registration

- Minimal centered form.
- Brand mark/name.
- Clear labels and input focus states.
- Password visibility toggle only if simple to implement.
- Validation messages near the relevant fields.
- Link between Login and Register.
- No social login buttons.

## 10. Customer dashboard

Use a simple account layout with:
- Welcome heading.
- Profile summary.
- Order count.
- Recent orders.
- Order history table/list.
- Status labels.
- Profile edit and logout actions.

## 11. Admin dashboard

Use a distinct, functional admin layout:
- Fixed or collapsible left sidebar.
- Main content area.
- Dashboard summary cards.
- Recent orders table.
- Recent activity list.

Admin navigation:
- Dashboard
- Products
- Orders
- Customers
- Activities
- Logout

CRUD screens should use straightforward forms and tables. Include confirmation before deleting records.

## 12. Responsive behaviour

Desktop:
- Full navigation.
- Multi-column product grid.
- Spacious hero layout.
- Admin sidebar.

Tablet:
- Reduced grid columns.
- Adjusted spacing.
- Sidebar may collapse.

Mobile:
- Compact navigation.
- Single-column or two-column product grid as appropriate.
- Stacked hero layout.
- Full-width form controls.
- Tables should become scrollable or use compact cards.
- No horizontal page overflow.

## 13. Interaction and accessibility

- Buttons must have hover, focus and disabled states.
- Links must navigate correctly.
- Forms must show validation and server errors.
- Use semantic headings and labels.
- Provide useful alt text for product images.
- Maintain readable colour contrast.
- Use loading, success, error and empty states.
- Avoid decorative controls that do not work.

## 14. Design constraints

- Do not use a generic dashboard or generic e-commerce template without customization.
- Do not overload pages with animations.
- Do not use excessive gradients, shadows or rounded cards.
- Do not add wishlist, reviews, chatbot, recommendations or other out-of-scope features.
- Prioritize visual consistency and working navigation.
