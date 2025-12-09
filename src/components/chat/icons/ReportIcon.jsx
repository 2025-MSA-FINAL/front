export default function ReportIcon({
  className = "w-6 h-6",
  fill = "#FF2A7E",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={fill}
        d="M4 1C3.4 1 3 1.4 3 2v20c0 .6.4 1 1 1s1-.4 1-1V2c0-.6-.4-1-1-1zm1 3.7v7.7c.5-.2 1-.4 1.6-.5 1.6-.4 4-.6 5.3 1.3 1 1.6 3.3 1.7 5.1 1.5 1.8-.2 3.5-.8 4.3-1.1.5-.2.7-.6.7-1.1V5.7c0-.4-.4-.6-.8-.4-1 .5-2.6 1.1-4.1 1.3-1.5.2-3.3.1-4.3-1.6-1.3-2-3.6-2.2-5.3-2-.7.1-1.3.3-1.8.4z"
      />
    </svg>
  );
}
