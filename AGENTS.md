<!-- nextjs rule begin -->

> This is not nextjs you know from training data, theres lots of breaking changes:

Refer this path for latest nextjs docs: `D:\Software-Development\@web-development\@nextjs\electronics-shop\node_modules\next\dist\docs`

<!-- nextjs rule end -->

# AGENTS.md

## Project status

This started as a v0 AI prototype with mock data. It is now a working full-stack app:

- Next.js 16 storefront + admin panel
- Real data stored in MongoDB through Mongoose
- Single-admin auth from environment variables
- Cloudinary image uploads
- Bengali UI with light/dark themes

It is a small CRUD catalog app. Keep changes minimal and practical; do not add process or abstractions just to look "production-grade".

## Project overview

A catalog website for a local electronics and home-appliance shop (fridges, rice cookers, TVs, fans, kitchen appliances, small appliances).

- **Storefront (public):** browse categories, search and filter products, view product details, and find the shop's visit/contact info. There is no cart or checkout. Customers come to the shop in person.
- **Admin (owner):** dashboard, product list, create/edit/delete products, image uploads, and quick toggles for published, featured and availability. Categories can also be managed.

## Tech stack

- Next.js 16.4 (App Router), React 19, TypeScript 5.7
- Tailwind CSS v4 (tokens in `app/globals.css` under `@theme`, no `tailwind.config`)
- shadcn/ui (Base UI primitives), `lucide-react` icons, `@dnd-kit` for image reordering
- Bun is the package manager (`bun install`, `bun add`, `bunx`)
- `next-themes` for light/dark (class strategy on `<html>`, system default)
- MongoDB + Mongoose 9 (`MONGODB_URI`, optional `MONGODB_DB`)
- Cloudinary for product images (signed direct upload from the browser)
- Vercel Analytics, production builds only
- Fonts: Inter + local Purno Pran Bengali (`public/PurnoPran/`)

`next.config.mjs` has `cacheComponents` and `partialPrefetching` enabled, `images.unoptimized` on purpose, and `typescript.ignoreBuildErrors` on. Always run `bunx tsc --noEmit` yourself; `bun run build` will not catch type errors.

## Environment variables

Required:

- `MONGODB_URI` — MongoDB connection string
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — the single admin account
- `AUTH_SECRET` — HMAC secret for the session cookie. The code has an insecure dev fallback; always set it outside local development.

Optional:

- `MONGODB_DB` — database name when the URI has none
- `DNS_SERVERS` — comma-separated DNS servers for `mongodb+srv` lookups (default `1.1.1.1,8.8.8.8`)
- `NEXT_PUBLIC_SITE_URL` — public origin for metadata, robots and sitemap
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image uploads. Without them the upload button reports that Cloudinary is not configured.

Only `NEXT_PUBLIC_SITE_URL` is public. Never expose the admin credentials, `AUTH_SECRET`, `MONGODB_URI` or `CLOUDINARY_API_SECRET` to client code.

## Directory map

```
app/
  layout.tsx                 Fonts, metadata, ThemeProvider, ToastProvider, Analytics
  globals.css                Design tokens (colors, radius, fonts)
  manifest.ts                Web app manifest (uses /public icon pack)
  robots.ts                  robots.txt (blocks /admin, /login)
  sitemap.ts                 Dynamic sitemap from MongoDB
  (storefront)/
    layout.tsx               SiteHeader + SiteFooter + skip link
    page.tsx                 Home
    products/page.tsx        Listing (?category=&q=)
    products/loading.tsx     Listing loading shell
    products/[slug]/page.tsx Detail
    products/[slug]/loading.tsx
  login/page.tsx             Staff sign in (Suspense-wrapped session check)
  admin/
    layout.tsx               AdminHeader shell (metadata, no auth check)
    loading.tsx
    page.tsx                 Dashboard
    products/page.tsx        Product list
    products/new/page.tsx
    products/[id]/edit/page.tsx
    products/[id]/edit/loading.tsx
    categories/page.tsx
    categories/new/page.tsx
    categories/[id]/edit/page.tsx
proxy.ts                     First-line cookie check for /admin/* and /login

components/
  auth/login-form.tsx
  storefront/                site-header, site-nav, hero-section, category-grid,
                             product-card, home-page, products-page,
                             product-detail-page, product-gallery, visit-section,
                             shop-map, site-footer
  admin/                     admin-header, admin-nav, admin-products, product-form,
                             admin-categories, category-form, reset-demo-data
  shared/                    product-image, availability-badge, category-icon,
                             toast-provider, confirm-dialog
  theme-provider.tsx
  theme-toggle.tsx
  ui/                        shadcn components

lib/
  types.ts                   Domain types (source of truth)
  routes.ts                  URL builders (productsHref, productHref, adminRoutes, loginHref)
  auth-cookie.ts             Session cookie name (shared with proxy)
  mock-data.ts               Seed categories and products
  cloudinary.ts              REST client: signed uploads, managed image deletion
  data/
    catalog-repository.ts    THE data boundary: interface + Mongoose implementation
    mongoose.ts              Cached connection (globalThis, HMR-safe)
    models.ts                Mongoose schemas: Category, Product
    seed.ts                  Fills the DB from mock-data
    auth.ts                  THE auth boundary: getSession, requireAdmin, signIn, signOut
  actions/
    catalog.ts               Product save/patch/delete + reset
    categories.ts            Category save/delete
    cloudinary.ts            Upload signature + orphan image deletion
    auth.ts                  signIn/signOut
  product-validation.ts      Form + server-side validation, slug generation
  category-validation.ts     Category form + server-side validation
  shop-config.ts             Shop name, address, phone, hours, socials, map links
  site.ts                    Public origin (NEXT_PUBLIC_SITE_URL)
  cache-tags.ts              CATALOG_TAG used by cached reads and actions
  format.ts                  Price (৳), availability labels, dates, slugify
  utils.ts                   cn()

scripts/seed.ts              CLI entry for `bun run seed`
public/images/               Product and hero images
architecture.html            Older visual architecture overview
ref/nextjs-16-rule.md        Local Next.js 16 notes
```

## Routing (App Router)

| URL                                      | Page                  |
| ---------------------------------------- | --------------------- |
| `/` `/#categories` `/#about` `/#contact` | Home (anchors scroll) |
| `/products?category=<slug>&q=<text>`     | Product listing       |
| `/products/<slug>`                       | Product detail        |
| `/login?next=<path>`                     | Staff sign in         |
| `/admin`                                 | Admin dashboard       |
| `/admin/products`                        | Admin product list    |
| `/admin/products/new`                    | Create product        |
| `/admin/products/<id>/edit`              | Edit product          |
| `/admin/categories`                      | Admin category list   |
| `/admin/categories/new`                  | Create category       |
| `/admin/categories/<id>/edit`            | Edit category         |

Build URLs with the helpers in `lib/routes.ts`. Do not hardcode path strings in components.

Data flow: server components read the repository directly, and the client mutates through server actions in `lib/actions/*`. There is no client-side data store and no hash router.

## Domain model (`lib/types.ts`)

- `Category`: id, name, slug, icon (`refrigerator | rice-cooker | tv | fan | blender | plug`), description. MongoDB also stores an internal `sortOrder`, which is not part of the public type.
- `Product`: id, name, slug, categoryId, brand, model, price (number, BDT), description, images (`ProductImage[]`), specs (`{ label, value }[]`), availability (`in_stock | low_stock | out_of_stock`), published, featured, createdAt (ISO).
- `ProductImage`: `{ url, publicId }`. `url` is an https URL or a `/images/...` path; `publicId` is the Cloudinary id used for deletion and is `null` for local images.
- `ProductInput` = `Product` minus `id` and `createdAt`.
- `CategoryInput` = `Category` minus `id`.
- `SessionUser`: username, role (`admin`).

Rules:

- Slugs must be unique for both products and categories. The repository checks first and also maps MongoDB duplicate-key errors to Bengali messages. Forms generate the slug from the name.
- A category cannot be deleted while products reference it. Move or delete those products first.
- Only `published` products appear on the storefront.
- `featured` products show in the home page's Featured section.

## Data layer

Everything above `lib/data/` talks to interfaces only. Two boundaries:

1. **Catalog** — `CatalogRepository` in `lib/data/catalog-repository.ts`, exported as `catalogRepository`.
   - reads: `listCategories`, `getCategoryBySlug`, `getCategoryById`, `listProducts`, `listPublishedProducts`, `getProductById`, `getPublishedProductBySlug`
   - writes: `createProduct`, `updateProduct`, `patchProduct`, `deleteProduct`, `createCategory`, `updateCategory`, `deleteCategory`, `resetDemoData`
2. **Auth** — functions in `lib/data/auth.ts`: `getSession`, `requireAdmin(returnTo?)`, `signIn(username, password)`, `signOut`.

Current implementation: MongoDB via Mongoose. Collections are `categories` and `products`; both use string `_id`s (seed categories are `cat-*`, products default to a UUID). `products.images` is an array of `{ url, publicId }` subdocuments, `products.specs` an array of `{ label, value }`, and `createdAt`/`updatedAt` come from Mongoose timestamps. `slug` has a unique index on both collections.

- Connection lives in `lib/data/mongoose.ts`, cached on `globalThis` so HMR does not reconnect.
- `bun run seed` (or the admin "Reset demo data" action) wipes both collections and re-inserts `lib/mock-data.ts`.
- `cacheComponents` is on. Cached reads use `'use cache'` + `cacheLife('weeks')` + `cacheTag(CATALOG_TAG)` in `lib/data/catalog-repository.ts`; the tag name lives in `lib/cache-tags.ts`.
- Storefront pages are partially prerendered (static shell + streamed dynamic holes). Runtime data (`params`, `searchParams`, `cookies`, `usePathname`) must sit inside `<Suspense>`. That is why `loading.tsx` files exist and why nav/auth pieces have fallbacks.
- Route handlers that must not prerender call `await connection()` (see `app/sitemap.ts`). Do not use `export const dynamic`.
- `resetDemoData` deletes Cloudinary images from the old catalog before reseeding. Cloudinary deletion is best-effort and never fails the catalog write.

To switch databases, write another `CatalogRepository` implementation and change the export at the bottom of `lib/data/catalog-repository.ts`. Keep the repository and action signatures; pages and components should not need to change.

## Auth flow

```
request /admin/*
  └─ proxy.ts: no session cookie? → redirect /login?next=/admin/...
       └─ app/admin/layout.tsx renders the admin shell
            └─ server actions call getSession() → verifies signature + expiry
```

Auth is a single account from `ADMIN_USERNAME` + `ADMIN_PASSWORD` (no defaults) with an HMAC-signed cookie (`AUTH_SECRET`). The cookie is httpOnly, sameSite=lax, and secure in production.

Rules:

- `proxy.ts` only checks that a cookie exists. It is a cheap first line, not the real auth check.
- `getSession()` is the real check. Every server action calls it first and returns `{ ok: false, error }` instead of throwing.
- `requireAdmin()` is the server-component guard. Use it before rendering admin-only data; do not rely on the proxy alone.
- UI code must not read or write cookies.
- After a write, actions call `updateTag(CATALOG_TAG)` so cached reads expire immediately (read-your-own-writes), then admin lists call `router.refresh()`.
- `bun run seed` bypasses the app, so it does not purge an in-memory cache; restart the dev server after seeding.

## Conventions

- Split UI into small components. Pages compose them, so don't let `page.tsx` grow large.
- Use semantic design tokens only (`bg-background`, `text-foreground`, `bg-primary`, and so on). No raw colors like `bg-white`.
- Dark mode: both `:root` and `.dark` define the same token names in `app/globals.css`. Add any new color to both blocks. Toggle is `components/theme-toggle.tsx` (next-themes); never hardcode `dark:` color values, only use tokens.
- Use at most 2 font families. `app/layout.tsx` loads Inter and Purno Pran, mapped in `globals.css`.
- Prefer flex and gap. No `space-*` classes, and don't mix margin with gap.
- Use the Tailwind spacing scale and avoid arbitrary values.
- Accessibility: semantic landmarks, labeled form fields, alt text on product images, and `sr-only` for icon-only buttons.
- UI copy is Bengali; product/category rows in MongoDB stay as entered (currently English). Keep new UI strings Bengali.
- Show prices with `formatTaka` from `lib/format.ts` (renders `৳`). Purno Pran provides the Bengali glyphs.
- Dates use `formatDate` (Bengali month names, Latin digits).
- Shop details (name, address, phone, hours, WhatsApp, map coordinates) live only in `lib/shop-config.ts`.
- Escape apostrophes in JSX (`&apos;`).
- Cloudinary uploads: browser sends the file straight to Cloudinary using a short-lived signature from `getUploadSignatureAction`. Cleanup is allowed only under the `electronics-shop/products` folder; never delete arbitrary public ids.

## Commands

- `bun install` installs dependencies
- `bun run dev` starts the dev server
- `bun run build` makes a production build (type errors are ignored; run `tsc` separately)
- `bun run start` starts the production build
- `bunx tsc --noEmit` runs the type check
- `bun run seed` seeds MongoDB with `lib/mock-data.ts` (requires `MONGODB_URI`)

## Known setup notes

- `.env.example` lists every variable; copy it to `.env.local` and fill in real values.
- Shop details and catalog seed data are demo values. Replace them before showing the site to a real shop.
- `architecture.html` is an older static overview and may be stale. Treat this file and the code as the source of truth.

## Out of scope (for now)

Cart, checkout, payments, customer accounts, reviews, and multi-language. Ask before adding any of them.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
