import Link from "next/link";
import { CreateJobForm } from "./form";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-stone-900">New job</h1>
      </div>
      <CreateJobForm />
    </div>
  );
}
