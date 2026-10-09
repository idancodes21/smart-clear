import type { ReactNode } from "react";

type ReviewStatCardProps = {
label: string;
value: number;
icon: ReactNode;
iconClass: string;
};

export function ReviewStatCard({
label,
value,
icon,
iconClass,
}: ReviewStatCardProps) {
return ( <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between"> <p className="text-sm font-medium text-gray-500">{label}</p>
<div className={`rounded-lg p-2 ${iconClass}`}>{icon}</div> </div>
  <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
    {value.toLocaleString()}
  </p>
</div>

);
}
