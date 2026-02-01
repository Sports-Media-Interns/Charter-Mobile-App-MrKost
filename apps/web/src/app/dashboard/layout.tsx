import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/requests", label: "Requests", icon: "📋" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "✈️" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-900 text-white p-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gold-500">SMC Admin</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-primary-700 hover:text-white transition"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
