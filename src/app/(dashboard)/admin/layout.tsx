import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-0">
      <nav className="mb-6 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4 sm:gap-4" aria-label="Admin">
        <Link href="/admin" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Dashboard
        </Link>
        <Link href="/admin/charts" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Charts
        </Link>
        <Link href="/admin/revenue" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Revenue
        </Link>
        <Link href="/admin/analytics" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Analytics
        </Link>
        <Link href="/admin/users" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Users
        </Link>
        <Link href="/admin/storage" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Storage
        </Link>
        <Link href="/admin/audit" className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:min-h-0">
          Audit log
        </Link>
        <Link
          href="/"
          className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700 sm:min-h-0 sm:min-w-0"
        >
          ← Back to app
        </Link>
      </nav>
      {children}
    </div>
  );
}
