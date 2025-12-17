export default function ImageUploadIcon({
  size = 24,
  stroke = "currentColor",
  className = "",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M13 4H8.8C7.11984 4 6.27976 4 5.63803 4.32698
           C5.07354 4.6146 4.6146 5.07354 4.32698 5.63803
           C4 6.27976 4 7.11984 4 8.8V15.2
           C4 16.8802 4 17.7202 4.32698 18.362
           C4.6146 18.9265 5.07354 19.3854 5.63803 19.673
           C6.27976 20 7.11984 20 8.8 20H15.2
           C16.8802 20 17.7202 20 18.362 19.673
           C18.9265 19.3854 19.3854 18.9265 19.673 18.362
           C20 17.7202 20 16.8802 20 15.2V11"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 16L8.29289 11.7071
           C8.68342 11.3166 9.31658 11.3166 9.70711 11.7071
           L13 15
           M13 15L15.7929 12.2071
           C16.1834 11.8166 16.8166 11.8166 17.2071 12.2071
           L20 15
           M13 15L15.25 17.25"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18 8V3M18 3L16 5M18 3L20 5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
