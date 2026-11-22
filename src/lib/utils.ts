export { cn } from "cn"

export function formatMethod(method: string) {
  const names: Record<string, string> = { v60: "V60", aeropress: "AeroPress", moka_pot: "Moka pot", french_press: "French press", espresso: "Espresso" };
  return names[method] ?? method.replaceAll("_", " ");
}
