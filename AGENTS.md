<!-- nextjs rule begin -->

> This is not nextjs you know from training data, theres lots of breaking changes:

Refer this path for latest nextjs docs: `D:\Software-Development\@web-development\@nextjs\electronics-shop\node_modules\next\dist\docs`

<!-- nextjs rule end -->

# AGENTS.md

## Project overview

A catalog website for a local electronics and home-appliance shop (fridges, rice cookers, TVs, fans, kitchen appliances, small appliances). It has two sides:

- **Storefront (public):** browse categories, search and filter products, view product details, and find the shop's visit/contact info. There's no cart or checkout. Customers come to the shop in person.
- **Admin (owner):** a dashboard, a product list, create/edit/delete products, and quick toggles for published, featured and availability.

**Current status: working prototype on MongoDB.** Storefront and admin are real App Router routes. Reads go through `lib/data/catalog-repository.ts` (MongoDB via Mongoose), writes go through server actions, and admin routes are protected by a signed cookie session in `lib/data/auth.ts`. `lib/mock-data.ts` is now only the seed source (`bun run seed`). Don't add features that bypass `lib/data/*`.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript 5.7
- Tailwind CSS v4 (tokens in `app/globals.css` under `@theme`, no `tailwind.config`)
- shadcn/ui (Base UI primitives) with `lucide-react` icons
- Bun is the package manager (`bun install`, `bun add`, `bunx`)
- `next-themes` for light/dark (class strategy on `<html>`, system default)
- MongoDB + Mongoose 9 (`MONGODB_URI`, optional `MONGODB_DB`)
- Planned: Supabase (Postgres, Auth, Storage, RLS)

## Directory map

app/
  layout.tsx              Fonts, metadata, ToastProvider
  globals.css             Design tokens (colors, radius, fonts)
  (storefront)/
    layout.tsx            SiteHeader + SiteFooter + skip link
    page.tsx              Home
    products/page.tsx     Listing (?category=&q=)
    products/[slug]/page.tsx  Detail
  login/page.tsx          Staff sign in
  admin/
    layout.tsx            requireAdmin() + AdminShell
    page.tsx              Dashboard
    products/page.tsx     Product list
    products/new/page.tsx
    products/[id]/edit/page.tsx
proxy.ts                  First-line auth guard for /admin/*
components/
  auth/login-form.tsx
  storefront/             site-header, hero-section, category-grid, product-card,
                          home-page, products-page, product-detail-page,
                          product-gallery, visit-section, site-footer
  admin/                  admin-shell, admin-products, product-form, reset-demo-data
  shared/                 product-image, availability-badge, category-icon,
                          toast-provider, confirm-dialog
  ui/                     shadcn components
lib/
  types.ts                Domain types (source of truth)
  routes.ts               All URL builders (productsHref, productHref, adminRoutes)
  auth-cookie.ts          Session cookie name (shared with proxy)
  mock-data.ts            Seed categories and products
  data/
    catalog-repository.ts THE data boundary: interface + Mongoose implementation
    mongoose.ts           Cached connection (globalThis, HMR-safe)
    models.ts             Mongoose schemas: Category, Product
    seed.ts               Fills the DB from mock-data
    auth.ts               THE auth boundary: getSession, requireAdmin, signIn, signOut
  actions/
    catalog.ts            Server actions: save/patch/delete/reset
    auth.ts               Server actions: signIn/signOut
  product-validation.ts   Form + server-side validation, slug generation
  shop-config.ts          Shop name, address, phone, hours, socials
  format.ts               Price formatting (Taka, uses "Tk" text, not ৳)
  utils.ts                cn()
scripts/seed.ts           CLI entry for `bun run seed`
public/images/            Product and hero images

## Routing (App Router)

| URL                                  | Page                          |
| ------------------------------------ | ----------------------------- |
| `/` `/#categories` `/#about` `/#contact` | Home (anchors scroll)     |
| `/products?category=<slug>&q=<text>` | Product listing               |
| `/products/<slug>`                   | Product detail                |
| `/login?next=<path>`                 | Staff sign in                 |
| `/admin`                             | Admin dashboard               |
| `/admin/products`                    | Admin product list            |
| `/admin/products/new`                | Create product                |
| `/admin/products/<id>/edit`          | Edit product                  |

Build URLs with the helpers in `lib/routes.ts`. Don't hardcode path strings in components.

Data flows: server components read the repository directly, and the client mutates through server actions in `lib/actions/*`. There is no client-side data store and no hash router.

## Domain model (`lib/types.ts`)

- `Category`: id, name, slug, icon (`refrigerator | rice-cooker | tv | fan | blender | plug`), description
- `Product`: id, name, slug, categoryId, brand, model, price (number, BDT), description, images (`ProductImage[]`), specs ({label, value}[]), availability (`in_stock | low_stock | out_of_stock`), published, featured, createdAt (ISO)
- `ProductImage`: `{ url, publicId }`. `url` is an https URL or a `/images/...` path; `publicId` is the Cloudinary id used for deletion and is `null` for local images.
- `ProductInput` = `Product` minus `id` and `createdAt`
- `SessionUser`: username, role (`admin`)

Rules:

- Slugs must be unique. The repository enforces this, and the form generates the slug from the name.
- Only `published` products appear on the storefront.
- `featured` products show in the home page's Featured section.

## Data layer contract

Everything above `lib/data/` talks to interfaces only. Two boundaries:

1. **Catalog** — `CatalogRepository` in `lib/data/catalog-repository.ts`, exported as `catalogRepository`.
   - reads: `listCategories`, `getCategoryBySlug`, `listProducts`, `listPublishedProducts`, `getProductById`, `getPublishedProductBySlug`
   - writes: `createProduct`, `updateProduct`, `patchProduct`, `deleteProduct`, `resetDemoData` (prototype only)
2. **Auth** — functions in `lib/data/auth.ts`: `getSession`, `requireAdmin(returnTo?)`, `signIn(username, password)`, `signOut`.

Current implementation: MongoDB via Mongoose. Collections are `categories` and `products`; both use string `_id`s (seed categories are `cat-*`, products default to a UUID). `products.images` is an array of `{ url, publicId }` subdocuments, `products.specs` an array of `{ label, value }`, and `createdAt`/`updatedAt` come from Mongoose timestamps. `slug` has a unique index on both collections.

- Connection lives in `lib/data/mongoose.ts`, cached on `globalThis`.
- `bun run seed` (or the admin "Reset demo data" action) wipes both collections and re-inserts `lib/mock-data.ts`.
- Storefront routes are `force-dynamic` because the data changes at runtime.

Auth is a single account from `ADMIN_USERNAME` + `ADMIN_PASSWORD` (no defaults, no demo hint in the UI) with an HMAC-signed cookie (`AUTH_SECRET`).

Rules:

- Pages/actions never import a database client directly; only `lib/data/*` may.
- Every server action calls `getSession()` first and returns `{ ok: false, error }` instead of throwing.
- Actions call `revalidatePath('/', 'layout')` after a write so storefront and admin refresh.
- UI code must not read or write cookies.

## Auth flow

```
request /admin/*
  └─ proxy.ts: no session cookie? → redirect /login?next=/admin/...
       └─ app/admin/layout.tsx requireAdmin() → verifies signature + expiry
            └─ server actions re-check the session (defence in depth)
```

## Supabase migration plan (optional)

1. **Schema**
   - `categories` (id, name, slug unique, icon, description, sort_order)
   - `products` (id, name, slug unique, category_id, brand, model, price numeric, description, specs jsonb/embedded, availability, published, featured, created_at, updated_at)
   - `product_images` (id, product_id fk cascade, path, position) or a `text[]` column
2. **RLS / access rules**
   - Public read: categories, and products where `published = true`.
   - Admin write only. Gate on an `admins` table or a role claim, not just "authenticated".
3. **Code changes**
   - Write a second `CatalogRepository` implementation and change the export at the bottom of `lib/data/catalog-repository.ts`.
   - Drop `lib/data/mongoose.ts` + `models.ts` once nothing imports them.
   - Replace the bodies in `lib/data/auth.ts` (Supabase Auth / Mongo session collection). Keep the function signatures.
   - Map snake_case columns to the camelCase `Product` type inside the repository only.
   - Delete `resetDemoData` and turn `mock-data.ts` into a seed script.
4. Protect admin routes server-side (proxy + layout check), never only in the client. Keep `lib/product-validation.ts` on the client and keep `validateProductInput` as the server-side guard.
5. With Supabase, add Storage for images and swap the image URL field in `product-form.tsx` for an upload.


## Conventions

- Split UI into small components. Pages compose them, so don't let `page.tsx` grow large.
- Use semantic design tokens only (`bg-background`, `text-foreground`, `bg-primary`, and so on). No raw colors like `bg-white`.
- Dark mode: both `:root` and `.dark` define the same token names in `app/globals.css`. Add any new color to both blocks. Toggle is `components/theme-toggle.tsx` (next-themes); never hardcode `dark:` color values, only use tokens.
- Use at most 2 font families, set in `layout.tsx` and mapped in `globals.css`.
- Prefer flex and gap. No `space-*` classes, and don't mix margin with gap.
- Use the Tailwind spacing scale and avoid arbitrary values.
- Accessibility: semantic landmarks, labeled form fields, alt text on product images, and `sr-only` for icon-only buttons.
- Show prices with `formatPrice` from `lib/format.ts`. Don't use the ৳ glyph because the font doesn't include it.
- Shop details (name, address, phone, hours) live only in `lib/shop-config.ts`.
- Escape apostrophes in JSX (`&apos;`).
- Don't put secrets in client code. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be public. The service role key stays on the server.

## Commands

- `bun run dev` starts the dev server
- `bun run build` makes a production build
- `bunx tsc --noEmit` runs the type check
- `bun run seed` seeds MongoDB with `lib/mock-data.ts` (requires `MONGODB_URI`)

## Out of scope (for now)

Cart, checkout, payments, customer accounts, reviews, and multi-language. Ask before adding any of them.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
