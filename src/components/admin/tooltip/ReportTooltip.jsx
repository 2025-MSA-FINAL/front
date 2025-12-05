import useTooltipFormatter from "@/hooks/admin/useTooltipFormatter";

export default function ReportTooltip({ active, payload }) {
  const format = useTooltipFormatter();

  if (!active) return null;

  const data = format(payload);

  return (
    <div className="bg-white shadow-lg rounded-md px-3 py-2 text-sm border">
      <div className="font-semibold">{data.title}</div>
      <div>{data.label}: {data.value}</div>
    </div>
  );
}
