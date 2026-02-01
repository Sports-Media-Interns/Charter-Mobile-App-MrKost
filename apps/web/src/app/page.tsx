import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-500 mb-4">
          Sports Media Charter
        </h1>
        <p className="text-gray-600 mb-8">Admin Dashboard</p>
        <Link
          href="/dashboard"
          className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
