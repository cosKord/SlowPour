import type { BrewMethod } from "@/types";

export function BrewMethodIcon({ method }: { method: BrewMethod }) {
  const paths: Record<BrewMethod, string> = {
    v60: "M4 5h24L20 23h-8ZM8 29h16M12 9l4 10M20 9l-4 10",
    aeropress: "M10 3h12M12 3v6M20 3v6M9 9h14v18H9ZM6 29h20M13 13h6M13 18h6",
    moka_pot: "M12 2h8l3 8-3 7 4 12H8l4-12-3-7ZM12 17h8M24 10h5v10h-6",
    french_press: "M9 7h14v22H9ZM16 2v17M12 2h8M9 19h14M24 11h5v12h-5",
    espresso: "M6 9h18v12a8 8 0 0 1-18 0ZM24 11h4v8h-4M4 29h24",
  };
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[method]} />
    </svg>
  );
}
