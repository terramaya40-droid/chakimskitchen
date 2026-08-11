import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../lib/cart";
import type { Availability } from "../lib/types";
import { formatKes } from "../lib/types";
import { submitBooking } from "../hooks/useShop";
import { buildWhatsappUrl, defaultWhatsappPhone, toOrderLines } from "../lib/whatsapp";

type CartProps = {
  availability: Availability[];
  content: Record<string, string>;
};

export function Cart({ availability, content }: CartProps) {
  const { lines, isOpen, total, setQty, clear, close } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const openDays = availability.filter((d) => d.is_open && d.booked < d.capacity);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const whatsappPhone = defaultWhatsappPhone(content);
      const result = await submitBooking({
        customer_name: name.trim(),
        phone: phone.trim(),
        mode,
        location: mode === "delivery" ? location.trim() : "",
        event_date: eventDate,
        event_time: eventTime.trim(),
        notes: notes.trim(),
        items: toOrderLines(lines),
        total,
        whatsapp_phone: whatsappPhone,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const url = buildWhatsappUrl(whatsappPhone, lines, total, {
        customerName: name.trim(),
        phone: phone.trim(),
        mode,
        location: location.trim(),
        eventDate,
        eventTime: eventTime.trim(),
        notes: notes.trim(),
      });

      clear();
      close();
      setStep("cart");
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    close();
    setStep("cart");
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-plum-deep/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close cart"
      />
      <aside className="animate-slide-up ml-auto flex h-full h-dvh w-full max-w-md flex-col bg-cream shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-plum/10 px-5 py-4">
          <h2 className="font-display text-xl font-bold text-plum-deep">
            {step === "cart" ? "Your cart" : "Checkout"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-plum/10 text-plum-deep transition active:scale-95"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="py-12 text-center text-plum/50">Your cart is empty</p>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <li key={line.id} className="flex items-center justify-between gap-3 rounded-xl border border-plum/10 bg-white p-3 shadow-sm">
                      {line.image_url && (
                        <img
                          src={line.image_url}
                          alt={line.name}
                          className="h-12 w-12 rounded-lg object-cover bg-plum/5 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-plum-deep text-sm truncate">{line.name}</p>
                        <p className="text-xs text-plum/60">{line.option}</p>
                        <p className="mt-0.5 text-xs font-semibold text-plum">{formatKes(line.price * line.qty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum hover:bg-plum/10 transition active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-plum-deep">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-plum/20 text-plum hover:bg-plum/10 transition active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-plum/10 px-5 py-4">
                <div className="mb-4 flex justify-between font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{formatKes(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="w-full rounded-full bg-plum py-3 font-medium text-cream hover:bg-plum-deep"
                >
                  Continue to checkout
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleCheckout} className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              <Field label="Your name" value={name} onChange={setName} required />
              <Field label="Phone number" value={phone} onChange={setPhone} required type="tel" />

              <div>
                <p className="mb-2 text-sm font-medium">Order type</p>
                <div className="flex gap-2">
                  {(["delivery", "pickup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize ${
                        mode === m ? "bg-plum text-cream" : "border border-plum/20"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "delivery" && (
                <Field label="Delivery location" value={location} onChange={setLocation} required />
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Event date</label>
                <select
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Pick a date</option>
                  {openDays.map((d) => (
                    <option key={d.id} value={d.day}>
                      {new Date(d.day + "T12:00:00").toLocaleDateString("en-KE", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {d.note ? ` — ${d.note}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Field label="Preferred time (optional)" value={eventTime} onChange={setEventTime} />
              <Field
                label="Notes (optional)"
                value={notes}
                onChange={setNotes}
                multiline
              />
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-auto space-y-2 pt-6">
              <div className="flex justify-between font-display font-bold">
                <span>Total</span>
                <span>{formatKes(total)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-whatsapp py-3 font-medium text-white hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Order on WhatsApp"}
              </button>
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="w-full py-2 text-sm text-plum/60 hover:text-plum"
              >
                Back to cart
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
