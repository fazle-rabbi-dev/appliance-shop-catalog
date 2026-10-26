# AGENTS.md

## Project overview

A catalog website for a local electronics and home-appliance shop (fridges, rice cookers, TVs, fans, kitchen appliances, small appliances). It has two sides:

- **Storefront (public):** browse categories, search and filter products, view product details, and find the shop's visit/contact info. There's no cart or checkout. Customers come to the shop in person.
- **Admin (owner):** a dashboard, a product list, create/edit/delete products, and quick toggles for published, featured and availability.

**Current status: working prototype.** Data is stored in `localStorage` and seeded from mock data. **The plan is to move persistence and admin auth to Supabase.** Don't add new features that rely on `localStorage`.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript 5.7
- Tailwind CSS v4 (tokens in `app/globals.css` under `@theme`, no `tailwind.config`)
- shadcn/ui (Base UI primitives) with `lucide-react` icons
- Bun is the package manager (`bun install`, `bun add`, `bunx`)
- Planned: Supabase (Postgres, Auth, Storage, RLS)

## Directory map

app/
  layout.tsx            Fonts, metadata, root <html> with bg-background
  page.tsx              Renders <AppShell />
  globals.css           Design tokens (colors, radius, fonts)
components/
  app-shell.tsx         Top-level router switch (storefront vs admin)
  storefront/           site-header, hero-section, category-grid, product-card,
                        home-page, products-page, product-detail-page,
                        visit-section, site-footer
  admin/                admin-shell, admin-dashboard, admin-products, product-form
  shared/               product-image, availability-badge, category-icon,
                        toast-provider, confirm-dialog
  ui/                   shadcn components
hooks/
  use-catalog.ts        Reads catalog state (useSyncExternalStore over the repository)
  use-hash-route.ts     Hash router: parseHash, useHashRoute, navigate, productsHref
lib/
  types.ts              Domain types (source of truth)
  catalog-repository.ts The ONLY data-access layer (currently localStorage)
  mock-data.ts          Seed categories and products
  product-validation.ts Form validation and slug generation
  shop-config.ts        Shop name, address, phone, hours, socials
  format.ts             Price formatting (Taka, uses "Tk" text, not the ৳ glyph)
  utils.ts              cn()
public/images/          Generated product and hero images

## Routing (hash-based, single page)

| Hash | Route |
|---|---|
| `#` / `#categories` / `#featured` / `#about` / `#contact` | Home (optionally scrolled to a section) |
| `#products?category=<slug>&q=<text>` | Product listing with filters |
| `#product/<slug>` | Product detail |
| `#admin` | Admin dashboard |
| `#admin/products` | Admin product list |
| `#admin/new` | Create product |
| `#admin/edit/<id>` | Edit product |

Use `navigate()` and `productsHref()` from `hooks/use-hash-route.ts`. Don't build hash strings by hand. When moving to Supabase, you can migrate to real App Router routes (`app/products/[slug]`, `app/admin/...`). If you do, migrate everything at once and remove the hash router.

## Domain model (`lib/types.ts`)

- `Category`: id, name, slug, icon (`refrigerator | rice-cooker | tv | fan | blender | plug`), description
- `Product`: id, name, slug, categoryId, brand, model, price (number, BDT), description, images (string[]), specs ({label, value}[]), availability (`in_stock | low_stock | out_of_stock`), published, featured, createdAt (ISO)
- `ProductInput` = `Product` minus `id` and `createdAt`

Rules:
- Slugs must be unique. The repository enforces this, and the form generates the slug from the name.
- Only `published` products appear on the storefront.
- `featured` products show in the home page's Featured section.

## Data layer contract

All reads and writes go through `lib/catalog-repository.ts`. UI components must never touch storage or a database client directly.

`catalogRepository` methods (all async):
- `createProduct(input)`, `updateProduct(id, input)`
- `patchProduct(id, { published?, featured?, availability? })`
- `deleteProduct(id)`, `resetDemoData()` (prototype only)

Reads come from `useCatalog()`, which uses `subscribeCatalog` and `getCatalogSnapshot`. Errors are thrown as `Error` with user-facing messages, and callers show them through the toast provider.

## Supabase migration plan

1. **Schema**
   - `categories` (id uuid pk, name, slug unique, icon, description, sort_order)
   - `products` (id uuid pk, name, slug unique, category_id fk, brand, model, price numeric, description, specs jsonb, availability text check, published bool, featured bool, created_at timestamptz default now(), updated_at)
   - `product_images` (id, product_id fk on delete cascade, path, position). Alternatively, use a `text[]` column on products.
2. **RLS**
   - Public (`anon`) can SELECT categories, and can SELECT products only where `published = true`.
   - Only authenticated admins can INSERT, UPDATE or DELETE. Gate this with an `admins` table or a `role` claim, not just "is authenticated".
3. **Auth:** Supabase email + password for the owner only. Protect admin routes on the server (proxy or a layout check), not just in the client.
4. **Storage:** a `product-images` bucket with public read and admin-only write. Replace the image URL field in `product-form.tsx` with an upload.
5. **Code changes**
   - Replace the method bodies in `catalog-repository.ts` with Supabase queries, keeping the same signatures.
   - Replace `useCatalog` with SWR (or server components for the storefront) and remove the localStorage subscribe/snapshot code.
   - Map snake_case columns to the camelCase `Product` type in one place, inside the repository.
   - Delete `resetDemoData` and turn `mock-data.ts` into a seed SQL script.
6. Keep validation (`product-validation.ts`) on the client, and add server-side checks: DB constraints plus server actions.

## Conventions

- Split UI into small components. Pages compose them, so don't let `page.tsx` grow large.
- Use semantic design tokens only (`bg-background`, `text-foreground`, `bg-primary`, and so on). No raw colors like `bg-white`.
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

## Out of scope (for now)

Cart, checkout, payments, customer accounts, reviews, and multi-language. Ask before adding any of them.

