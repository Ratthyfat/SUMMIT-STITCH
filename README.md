# Summit & Stitch — Shopify Theme

*Made by hand. Built to keep.*

A custom Shopify Online Store 2.0 theme for Summit & Stitch, a hand-knit
knitwear brand in Colorado Springs, CO. Built lean and from scratch — no
Dawn scaffolding, no apps required for launch — so nothing feels like a
template out of the box.

## Design system

| Token | Hex | Usage |
|---|---|---|
| Aged Linen | `#F2EDE3` | Primary background |
| Midnight Navy | `#1E2D40` | Anchor/hero color |
| Slate | `#3D4A52` | Body text |
| Faded Brick | `#A0473A` | CTAs, warmth accent |
| Sage | `#7A8C6E` | Secondary accent |
| Antique Gold | `#C4A267` | Premium details, borders |
| Charcoal | `#181E22` | Dark backgrounds (footer) |

Typography: **Playfair Display** for headlines and product names,
**Crimson Text** for body copy, system monospace for labels and metadata.
All tokens live in `assets/base.css` under `:root`.

## What's built

- **Homepage** — full-bleed hero ("Shop Beanies" / "Our Story" CTAs), brand
  statement, featured beanies grid, our-story teaser, email capture. No
  pop-ups anywhere.
- **Announcement bar** — "Small batch. Hand-knit. Ships in 2–3 weeks."
- **Product page** (`templates/product.json`) — swatch-style colorway
  picker (not a dropdown), "Only X left" low-stock note (threshold is a
  theme setting), hand-knit lead-time note, "Complete the look" cross-sell
  block (pick up to 2 products per product in the editor).
- **Waitlist product page** (`templates/product.waitlist.json`) — for the
  Cable-Knit Pullover. Hides buy buttons; shows an email waitlist form
  (submissions arrive as contact form entries tagged `waitlist`).
- **Watch product page** (`templates/product.watch.json`) — for the future
  one-of-one vintage watch line. No variant picker, no quantity selector,
  "One of one · Vintage" eyebrow, a gold-bordered "Details & provenance"
  panel driven by metafields, and a "Sold" badge when sold out (listing
  stays up).
- **Cart** — slide-out drawer (AJAX, no redirect) with quantity controls
  and free-shipping note; `/cart` page as fallback.
- **Everything else** — collections with pagination, journal blog, search,
  404, password page, gift card page, full customer account templates.

Mobile-first throughout: Instagram bio link → mobile storefront is the
primary path.

## Setup

### 1. Push the theme

```sh
shopify theme push --unpublished --store summit-stitch.myshopify.com
```

(Or connect this repo via the Shopify GitHub integration and let it sync.)

### 2. Create navigation menus

- **main-menu**: Beanies → `/collections/beanies`, Sweaters →
  `/collections/sweaters`, Accessories → `/collections/accessories`,
  Our Story → `/pages/our-story`, Care → `/pages/care`
- **footer**: Shop All → `/collections/all`, Care → `/pages/care`,
  Journal → `/blogs/journal`

### 3. Create collections

| Handle | Contents |
|---|---|
| `beanies` | Fitted Cuff Beanie, Slouchy Beanie |
| `sweaters` | Cable-Knit Pullover (waitlist) |
| `accessories` | Neck Gaiter, Mitts, Gift Sets |
| `all` | Full catalog (automatic) |
| `watches` | **Do not create yet** — future one-of-one vintage listings |

### 4. Create products

Phase 1 (launch):

- **Fitted Cuff Beanie** ($75–85) — one option named **Colorway** with
  values `Aged Linen`, `Midnight Navy`, `Slate`, `Faded Brick`. Track
  inventory per variant so the "Only X left" note works. Template:
  *Default product*.
- **Slouchy Beanie** ($80–95) — same colorways, same setup.

The swatch picker maps colorway names to yarn colors automatically
(`.swatch--aged-linen` etc. in `base.css`). If you add a new colorway,
add a matching `.swatch--<handle>` rule; unknown values fall back to a
neutral wool tone.

Phase 2 (structure ready now):

- **Cable-Knit Pullover** ($265–295) — assign template **waitlist**.
- **Neck Gaiter** ($45–55) — default template.

On each beanie, add the Neck Gaiter (and later Gift Set) to the
"Complete the look" block in the theme editor.

### 5. Watch metafields (future — define now, use later)

Define product metafields in Settings → Custom data → Products,
namespace `watch`:

| Key | Type |
|---|---|
| `year` | Single line text |
| `reference` | Single line text |
| `movement` | Single line text |
| `case_size` | Single line text |
| `condition` | Multi-line text |
| `service_history` | Multi-line text |

Each watch listing: quantity **1**, no options, tag `watch`, template
**watch**. When it sells, leave it published — the theme shows a "Sold"
badge instead of removing it.

### 6. Pages

Create `our-story` (template *page.our-story* — includes email capture at
the bottom) and `care` (template *page.care*). Draft copy for both is in
[`docs/launch-copy.md`](docs/launch-copy.md), along with product
description drafts.

### 7. Ops

- **Payments**: enable Shopify Payments.
- **Shipping**: USPS flat rate; free shipping over $100 (the cart drawer
  already says so — keep the threshold in sync).
- **Email**: newsletter and waitlist forms use native Shopify customer/
  contact forms, so they work with Shopify Email out of the box. If you
  move to Klaviyo, swap the form in `sections/newsletter.liquid` for the
  Klaviyo embed and keep the styling.

## Theme settings

Theme editor → Theme settings:

- **Brand**: tagline, Instagram/TikTok URLs, contact email.
- **Products**: low-stock threshold (default 4) and the global hand-knit
  lead-time note shown on product pages.

## File map

```
layout/       theme.liquid, password.liquid
sections/     hero, featured-collection, image-with-text, rich-text,
              newsletter, announcement-bar, header, footer, main-*
snippets/     card-product, cart-drawer, price, icon, meta-tags,
              address-fields
templates/    JSON templates incl. product.waitlist, product.watch,
              page.our-story, page.care; customers/*.liquid
assets/       base.css (design system), global.js (cart drawer,
              swatch picker, AJAX add-to-cart — no dependencies)
```
