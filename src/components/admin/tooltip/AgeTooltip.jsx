import useTooltipFormatter from "@/hooks/admin/useTooltipFormatter";

export default function AgeTooltip({ active, payload }) {
  const format = useTooltipFormatter();

  if (!active) return null;

  const data = format(payload);

  return (
    <div className="bg-white border rounded-md px-3 py-2 text-sm shadow">
      <div className="font-bold">{data.title}</div>
      <div>{data.label}: {data.value}명</div>
    </div>
  );
}
