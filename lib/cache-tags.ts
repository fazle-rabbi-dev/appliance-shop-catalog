/**
 * Shared cache tag for every catalog read.
 * All product/category mutations purge it so the storefront and admin
 * always re-read from MongoDB on the next request.
 */
export const CATALOG_TAG = 'catalog'
