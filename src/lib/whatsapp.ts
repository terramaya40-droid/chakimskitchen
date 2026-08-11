import type { CartLine, OrderLine } from "./types";
import { formatKes } from "./types";

type BookingDetails = {
  customerName: string;
  phone: string;
  mode: "delivery" | "pickup";
  location: string;
  eventDate: string;
  eventTime: string;
  notes: string;
};

export function toOrderLines(lines: CartLine[]): OrderLine[] {
  return lines.map((l) => ({
    name: l.name,
    option: l.option,
    unit: l.unit,
    qty: l.qty,
    price: l.price,
  }));
}

export function buildWhatsappUrl(
  phone: string,
  lines: CartLine[],
  total: number,
  details: BookingDetails,
) {
  const cleanPhone = phone.replace(/\D/g, "");
  const lines_text = lines
    .map((l) => `• ${l.name} (${l.option}) × ${l.qty} — ${formatKes(l.price * l.qty)}`)
    .join("\n");

  const message = [
    "🍽️ *New order — Chef Chakim's Yummys*",
    "",
    `*Name:* ${details.customerName}`,
    `*Phone:* ${details.phone}`,
    `*${details.mode === "delivery" ? "Delivery" : "Pickup"}:* ${details.mode === "delivery" ? details.location : "Pickup at kitchen"}`,
    `*Date:* ${details.eventDate}${details.eventTime ? ` at ${details.eventTime}` : ""}`,
    "",
    "*Items:*",
    lines_text,
    "",
    `*Total:* ${formatKes(total)}`,
    details.notes ? `\n*Notes:* ${details.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function defaultWhatsappPhone(content: Record<string, string>) {
  return content.footer_phone ?? "254793547818";
}
