export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-card lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
