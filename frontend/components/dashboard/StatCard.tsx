interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">

      <div className="flex justify-between items-center">
        <h3 className="text-gray-500 text-sm">
          {title}
        </h3>

        <span className="text-2xl">
          {icon}
        </span>
      </div>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

      <p className="text-green-600 text-sm mt-2">
        ↑ Updated Today
      </p>

    </div>
  );
}