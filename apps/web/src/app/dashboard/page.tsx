export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Requests", value: "—", color: "bg-blue-50 text-blue-700" },
          { label: "Confirmed Bookings", value: "—", color: "bg-green-50 text-green-700" },
          { label: "Pending Quotes", value: "—", color: "bg-yellow-50 text-yellow-700" },
          { label: "Revenue (MTD)", value: "—", color: "bg-purple-50 text-purple-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-xl p-6`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">
          Connect to Supabase to display real-time data.
        </p>
      </div>
    </div>
  );
}
