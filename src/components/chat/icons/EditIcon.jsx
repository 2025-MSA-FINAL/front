import React from "react";

export default function EditIcon({
  className = "w-6 h-6",
  stroke = "#000000",
  fillOpacity = "0.15",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      <path
        opacity={fillOpacity}
        d="M4 20H8L18 10L14 6L4 16V20Z"
        fill={stroke}
      />
      <path
        d="M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
