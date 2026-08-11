import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Availability, MenuItem, ShopData } from "../lib/types";
import { todayIso } from "../lib/types";

async function fetchShopData(): Promise<ShopData> {
  const [contentRes, itemsRes, optionsRes, availRes, bookingsRes] = await Promise.all([
    supabase.from("site_content").select("key, value"),
    supabase
      .from("menu_items")
      .select("id, slug, name, tagline, image_url, category, sort, is_active")
      .eq("is_active", true)
      .order("sort"),
    supabase.from("menu_options").select("id, item_id, label, price, unit, note, sort").order("sort"),
    supabase
      .from("availability_dates")
      .select("id, day, is_open, capacity, note")
      .gte("day", todayIso())
      .order("day"),
    supabase
      .from("bookings")
      .select("event_date")
      .gte("event_date", todayIso())
      .neq("status", "cancelled"),
  ]);

  const err =
    contentRes.error || itemsRes.error || optionsRes.error || availRes.error || bookingsRes.error;
  if (err) throw new Error(err.message);

  const content: Record<string, string> = {};
  for (const row of contentRes.data ?? []) content[row.key] = row.value;

  const items: MenuItem[] = (itemsRes.data ?? []).map((item) => ({
    ...item,
    options: (optionsRes.data ?? [])
      .filter((o) => o.item_id === item.id)
      .map(({ item_id: _, ...o }) => ({ ...o, price: Number(o.price) })),
  }));

  const booked: Record<string, number> = {};
  for (const row of bookingsRes.data ?? []) {
    if (!row.event_date) continue;
    booked[row.event_date] = (booked[row.event_date] ?? 0) + 1;
  }

  const availability: Availability[] = (availRes.data ?? []).map((a) => ({
    ...a,
    booked: booked[a.day] ?? 0,
  }));

  return { content, items, availability };
}

export function useShop() {
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchShopData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shop");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const text = useCallback(
    (key: string, fallback = "") => data?.content[key] ?? fallback,
    [data],
  );

  return { data, loading, error, reload, text };
}

export async function submitBooking(input: {
  customer_name: string;
  phone: string;
  mode: "delivery" | "pickup";
  location: string;
  event_date: string;
  event_time: string;
  notes: string;
  items: { name: string; option: string; unit: string; qty: number; price: number }[];
  total: number;
  whatsapp_phone: string;
}) {
  const day = input.event_date;
  if (!day || day < todayIso()) {
    return { ok: false as const, error: "Please pick an upcoming date." };
  }

  const { data: avail, error: availErr } = await supabase
    .from("availability_dates")
    .select("day, is_open, capacity")
    .eq("day", day)
    .maybeSingle();

  if (availErr) throw new Error(availErr.message);
  if (!avail?.is_open) {
    return { ok: false as const, error: "We're not taking orders for that date." };
  }

  const { count, error: countErr } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("event_date", day)
    .neq("status", "cancelled");

  if (countErr) throw new Error(countErr.message);
  if ((count ?? 0) >= avail.capacity) {
    return { ok: false as const, error: "That date is fully booked. Please pick another day." };
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      mode: input.mode,
      location: input.location,
      event_date: input.event_date,
      event_time: input.event_time,
      items: input.items,
      total: input.total,
      notes: input.notes,
      whatsapp_phone: input.whatsapp_phone,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { ok: true as const, id: data.id };
}
