import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">403</h1>
      <p className="mt-2 text-sm text-gray-600">
        You do not have permission to access this resource.
      </p>
      <Link href="/" className="mt-6 rounded-md border px-4 py-2 text-sm">
        Back to dashboard
      </Link>
    </main>
  );
}
