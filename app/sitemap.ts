import type { MetadataRoute } from "next";
import { catalogRepository } from "@/lib/data/catalog-repository";
import { productHref, productsHref } from "@/lib/routes";
import { siteUrl } from "@/lib/site";

// The catalog lives in MongoDB, so build the sitemap per request, not at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [categories, products] = await Promise.all([
		catalogRepository.listCategories(),
		catalogRepository.listPublishedProducts(),
	]);
	const now = new Date();

	return [
		{
			url: `${siteUrl}/`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${siteUrl}${productsHref()}`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.9,
		},
		...categories.map((category) => ({
			url: `${siteUrl}${productsHref({ category: category.slug })}`,
			lastModified: now,
			changeFrequency: "weekly" as const,
			priority: 0.7,
		})),
		...products.map((product) => ({
			url: `${siteUrl}${productHref(product.slug)}`,
			lastModified: new Date(product.createdAt),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		})),
	];
}
