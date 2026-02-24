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
    <div className="mx-auto max-w-5xl">
      <nav className="mb-8 flex gap-4 border-b border-stone-200 pb-4">
        <Link href="/admin" className="font-medium text-stone-700 hover:text-stone-900">
          Dashboard
        </Link>
        <Link href="/admin/users" className="font-medium text-stone-700 hover:text-stone-900">
          Users
        </Link>
        <Link href="/" className="font-medium text-stone-500 hover:text-stone-700">
          ← Back to app
        </Link>
      </nav>
      {children}
    </div>
  );
}
