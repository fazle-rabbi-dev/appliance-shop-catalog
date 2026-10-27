"use client";

import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import {
	AdminNavDesktop,
	AdminNavDesktopFallback,
	AdminNavMobile,
	AdminNavMobileFallback,
} from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/lib/actions/auth";
import { shopConfig } from "@/lib/shop-config";

export function AdminHeader({ username }: { username: string }) {
	const [menuOpen, setMenuOpen] = useState(false);

	const signOutForm = (
		<form action={signOutAction}>
			<button
				type="submit"
				className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
				<LogOut
					className="size-4"
					aria-hidden="true"
				/>
				সাইন আউট
			</button>
		</form>
	);

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
				<div className="flex min-w-0 items-center gap-2.5">
					<Image
						src="/favicon.svg"
						alt=""
						width={32}
						height={32}
						unoptimized
						className="size-8 shrink-0 rounded border border-foreground/15"
					/>
					<div className="flex min-w-0 flex-col">
						<span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
							দোকান অ্যাডমিন
						</span>
						<span className="truncate text-base font-semibold">{shopConfig.name}</span>
					</div>
				</div>

				<nav
					aria-label="অ্যাডমিন"
					className="ml-auto hidden items-center gap-1 md:flex">
					<Suspense fallback={<AdminNavDesktopFallback />}>
						<AdminNavDesktop />
					</Suspense>
					<Link
						href="/"
						className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
						<ArrowLeft
							className="size-4"
							aria-hidden="true"
						/>
						সাইট দেখুন
					</Link>
				</nav>

				<div className="ml-auto hidden items-center gap-3 md:flex">
					<span className="max-w-32 truncate text-xs text-muted-foreground">{username}</span>
					<ThemeToggle className="size-9 shrink-0" />
					{signOutForm}
				</div>

				<button
					type="button"
					onClick={() => setMenuOpen((open) => !open)}
					aria-expanded={menuOpen}
					aria-controls="admin-menu"
					className="ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border md:hidden">
					{menuOpen ? (
						<X
							className="size-5"
							aria-hidden="true"
						/>
					) : (
						<Menu
							className="size-5"
							aria-hidden="true"
						/>
					)}
					<span className="sr-only">{menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}</span>
				</button>
			</div>

			{menuOpen && (
				<div
					id="admin-menu"
					className="border-t border-border md:hidden">
					<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
						<nav aria-label="অ্যাডমিন মোবাইল">
							<ul className="flex flex-col gap-1">
								<Suspense
									fallback={
										<AdminNavMobileFallback onNavigate={() => setMenuOpen(false)} />
									}>
									<AdminNavMobile onNavigate={() => setMenuOpen(false)} />
								</Suspense>
								<li>
									<Link
										href="/"
										onClick={() => setMenuOpen(false)}
										className="flex items-center gap-2 rounded-lg px-2 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
										<ArrowLeft
											className="size-4"
											aria-hidden="true"
										/>
										সাইট দেখুন
									</Link>
								</li>
							</ul>
						</nav>

						<div className="flex items-center justify-between gap-3 border-t border-border pt-3">
							<span className="truncate text-xs text-muted-foreground">{username}</span>
							<div className="flex items-center gap-2">
								<ThemeToggle className="size-9" />
								{signOutForm}
							</div>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
