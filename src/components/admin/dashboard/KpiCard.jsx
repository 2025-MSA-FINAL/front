import { Activity } from "lucide-react";

export default function KpiCard({ title, value, sub, icon, gradient }) {
  return (
    <div className={`rounded-2xl shadow-xl p-5 text-white bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-white/90">{title}</div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>

      <div>
        <div className="text-3xl font-extrabold">
          {value?.toLocaleString()}
        </div>

        {sub && (
          <div className="text-[11px] opacity-90 flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3" />
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
