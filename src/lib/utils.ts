export { cn } from "cn"

export const ratio = (water: number, dose: number) => `1:${(water / dose).toFixed(1)}`;

export function formatMethod(method: string) {
  const names: Record<string, string> = { v60: "V60", aeropress: "AeroPress", moka_pot: "Moka pot", french_press: "French press", espresso: "Espresso" };
  return names[method] ?? method.replaceAll("_", " ");
}
