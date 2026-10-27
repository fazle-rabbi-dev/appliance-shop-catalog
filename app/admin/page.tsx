import { Plus } from "lucide-react";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/shared/availability-badge";
import { ProductImage } from "@/components/shared/product-image";
import { buttonVariants } from "@/components/ui/button";
import { catalogRepository } from "@/lib/data/catalog-repository";
import { formatDate, formatTaka } from "@/lib/format";
import { adminRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { connection } from "next/server";

export default async function AdminDashboardRoute() {
	await connection();

	const [products, categories] = await Promise.all([
		catalogRepository.listProducts(),
		catalogRepository.listCategories(),
	]);

	const categoryById = new Map(categories.map((category) => [category.id, category]));

	const stats = [
		{ label: "মোট পণ্য", value: products.length },
		{ label: "প্রকাশিত", value: products.filter((p) => p.published).length },
		{
			label: "স্টক নেই",
			value: products.filter((p) => p.availability === "out_of_stock").length,
		},
		{ label: "ক্যাটাগরি", value: categories.length },
	];

	const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold text-balance sm:text-3xl">সারসংক্ষেপ</h1>
					<p className="text-sm text-muted-foreground">ক্রেতারা এখন কী দেখছেন তার এক নজরে।</p>
				</div>
				<Link
					href={adminRoutes.newProduct}
					className={cn(buttonVariants(), "h-11 gap-2 px-4")}>
					<Plus aria-hidden="true" />
					পণ্য যোগ করুন
				</Link>
			</div>

			<dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
						<dt className="text-sm text-muted-foreground">{stat.label}</dt>
						<dd className="text-3xl font-semibold tabular-nums">{stat.value}</dd>
					</div>
				))}
			</dl>

			<section
				aria-labelledby="recent-heading"
				className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-4">
					<h2
						id="recent-heading"
						className="text-lg font-semibold">
						সাম্প্রতিক যোগ করা
					</h2>
					<Link
						href={adminRoutes.products}
						className="text-sm font-medium text-primary hover:underline">
						সব পণ্য পরিচালনা
					</Link>
				</div>
				{recent.length === 0 ? (
					<p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
						এখনো কোনো পণ্য নেই। শুরু করতে প্রথম পণ্যটি যোগ করুন।
					</p>
				) : (
					<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
						{recent.map((product) => (
							<li key={product.id}>
								<Link
									href={adminRoutes.editProduct(product.id)}
									className="flex items-center gap-3 p-3 hover:bg-muted/60 sm:gap-4 sm:px-4">
									<ProductImage
										src={product.images[0]?.url}
										alt=""
										className="size-12 shrink-0 rounded-lg"
									/>
									<div className="flex min-w-0 flex-1 flex-col">
										<span className="truncate font-medium">{product.name}</span>
										<span className="truncate text-xs text-muted-foreground">
											{categoryById.get(product.categoryId)?.name ?? "ক্যাটাগরি নেই"} ·
											যোগ করা হয়েছে {formatDate(product.createdAt)}
										</span>
									</div>
									<div className="hidden flex-col items-end gap-1 sm:flex">
										<span className="text-sm font-semibold tabular-nums">
											{formatTaka(product.price)}
										</span>
										<AvailabilityBadge value={product.availability} />
									</div>
									{!product.published ? (
										<span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
											খসড়া
										</span>
									) : null}
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
