import { SignOutButton } from "@clerk/nextjs";

export default function SuspendedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-xl font-bold text-stone-900">Account suspended</h1>
      <p className="mt-2 text-stone-600">
        Your account has been suspended. If you believe this is an error, please contact support.
      </p>
      <div className="mt-8">
        <SignOutButton>
          <button
            type="button"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
