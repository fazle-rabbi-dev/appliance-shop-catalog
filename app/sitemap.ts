import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { catalogRepository } from "@/lib/data/catalog-repository";
import { productHref, productsHref } from "@/lib/routes";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always build per request; the underlying catalog reads are cached + tagged.
  await connection()
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
