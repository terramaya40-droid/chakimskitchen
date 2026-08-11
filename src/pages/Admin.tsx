import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Booking, MenuItem } from "../lib/types";
import { formatKes, todayIso } from "../lib/types";
import { UserPlus, Shield, LogOut, Store, Trash2, Plus, Upload, Edit3, Image as ImageIcon, X } from "lucide-react";

type Tab = "orders" | "menu" | "dates" | "admins";
type AuthMode = "signin" | "signup";

type AdminUser = {
  user_id: string;
  created_at: string;
};

export default function Admin() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("orders");

  // Auth form states
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Sign Up / Register Admin
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // Attempt to register in admin_users table
          const { error: adminErr } = await supabase
            .from("admin_users")
            .insert({ user_id: data.user.id });

          if (adminErr) {
            // Fallback RPC function if direct insert is blocked by non-admin status
            await supabase.rpc("claim_initial_admin");
          }

          if (data.session) {
            setSession(data.session);
            setAuthSuccess("Admin account created and signed in successfully!");
          } else {
            setAuthSuccess(
              "Account created! Please check your email to confirm registration or sign in.",
            );
          }
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <p className="text-plum/60">Loading kitchen dashboard…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-plum/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-plum-deep">
              Kitchen Admin
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-plum/60">
              Manage menu, kitchen orders, and access permissions
            </p>
          </div>

          <div className="mb-6 flex rounded-xl bg-cream p-1 border border-plum/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
                authMode === "signin"
                  ? "bg-white text-plum-deep shadow-sm"
                  : "text-plum/60 hover:text-plum"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
                authMode === "signup"
                  ? "bg-white text-plum-deep shadow-sm"
                  : "text-plum/60 hover:text-plum"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <div className="rounded-lg bg-gold/15 p-3 text-xs text-plum-deep border border-gold/30">
                💡 <span className="font-semibold">Creating an admin account:</span> Registers a new
                user and grants admin dashboard privileges.
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-plum/80">Email Address</label>
              <input
                type="email"
                required
                placeholder="admin@yummys.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none focus:ring-2 focus:ring-plum/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-plum/80">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none focus:ring-2 focus:ring-plum/20"
              />
            </div>

            {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}
            {authSuccess && <p className="text-xs font-medium text-green-700">{authSuccess}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-plum py-3 text-sm font-semibold text-cream transition hover:bg-plum-deep active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting
                ? "Processing…"
                : authMode === "signin"
                ? "Sign in to Dashboard"
                : "Register Admin Account"}
            </button>

            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-plum/60 hover:text-plum"
            >
              <Store size={14} />
              Back to storefront
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-plum/10 bg-white px-4 py-3.5 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-plum" size={22} />
            <h1 className="font-display text-xl font-bold text-plum-deep">Kitchen Dashboard</h1>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-plum/10 pt-2 sm:pt-0">
            <span className="text-xs text-plum/60 truncate max-w-[180px]">
              {session.user.email}
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1 text-xs font-medium text-plum/70 hover:text-plum"
              >
                <Store size={14} />
                View shop
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0">
          {(["orders", "menu", "dates", "admins"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold capitalize transition active:scale-95 ${
                tab === t
                  ? "bg-plum text-cream shadow-sm"
                  : "border border-plum/20 bg-white text-plum/70 hover:border-plum/40"
              }`}
            >
              {t === "admins" ? "Admin Users" : t}
            </button>
          ))}
        </div>

        {tab === "orders" && <OrdersTab />}
        {tab === "menu" && <MenuTab />}
        {tab === "dates" && <DatesTab />}
        {tab === "admins" && <AdminsTab currentUserId={session.user.id} />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error) setOrders((data ?? []) as Booking[]);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  if (loading) return <p className="text-xs sm:text-sm text-plum/60">Loading orders…</p>;
  if (orders.length === 0) return <p className="text-xs sm:text-sm text-plum/60">No orders placed yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-xl border border-plum/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-plum-deep">{o.customer_name}</p>
              <p className="text-xs sm:text-sm text-plum/60 mt-0.5">
                📞 {o.phone} · 📅 {o.event_date} · 🚚 {o.mode}
                {o.location ? ` (${o.location})` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold text-plum">{formatKes(Number(o.total))}</p>
            </div>
            <select
              value={o.status}
              onChange={(e) => updateStatus(o.id, e.target.value)}
              className="rounded-lg border border-plum/15 bg-cream px-3 py-1.5 text-xs sm:text-sm font-medium text-plum-deep focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("chapati");
  const [tagline, setTagline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [optionLabel, setOptionLabel] = useState("1 dozen");
  const [optionPrice, setOptionPrice] = useState("300");
  const [optionUnit, setOptionUnit] = useState("dozen");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function loadMenu() {
    setLoading(true);
    Promise.all([
      supabase.from("menu_items").select("*").order("sort"),
      supabase.from("menu_options").select("*").order("sort"),
    ]).then(([itemsRes, optionsRes]) => {
      if (!itemsRes.error) {
        setItems(
          (itemsRes.data ?? []).map((item) => ({
            ...item,
            options: (optionsRes.data ?? [])
              .filter((o) => o.item_id === item.id)
              .map(({ item_id: _, ...o }) => ({ ...o, price: Number(o.price) })),
          })),
        );
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadMenu();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setName("");
    setCategory("chapati");
    setTagline("");
    setImageUrl("");
    setOptionLabel("1 dozen");
    setOptionPrice("300");
    setOptionUnit("dozen");
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem) {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setTagline(item.tagline ?? "");
    setImageUrl(item.image_url ?? "");
    const firstOpt = item.options[0];
    setOptionLabel(firstOpt?.label ?? "1 portion");
    setOptionPrice(firstOpt ? String(firstOpt.price) : "300");
    setOptionUnit(firstOpt?.unit ?? "pack");
    setIsModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("menu-images")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed. Ensure 'menu-images' bucket exists.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      if (editingItem) {
        // Update existing item
        const { error: itemErr } = await supabase
          .from("menu_items")
          .update({
            name,
            category,
            tagline,
            image_url: imageUrl,
            slug,
          })
          .eq("id", editingItem.id);

        if (itemErr) throw itemErr;

        // Update or insert first option
        const firstOpt = editingItem.options[0];
        if (firstOpt) {
          await supabase
            .from("menu_options")
            .update({
              label: optionLabel,
              price: Number(optionPrice),
              unit: optionUnit,
            })
            .eq("id", firstOpt.id);
        } else {
          await supabase.from("menu_options").insert({
            item_id: editingItem.id,
            label: optionLabel,
            price: Number(optionPrice),
            unit: optionUnit,
          });
        }
      } else {
        // Create new item
        const { data: newItem, error: itemErr } = await supabase
          .from("menu_items")
          .insert({
            name,
            category,
            tagline,
            image_url: imageUrl,
            slug: slug || `item-${Date.now()}`,
            is_active: true,
          })
          .select("id")
          .single();

        if (itemErr) throw itemErr;

        if (newItem) {
          await supabase.from("menu_options").insert({
            item_id: newItem.id,
            label: optionLabel,
            price: Number(optionPrice),
            unit: optionUnit,
          });
        }
      }

      setIsModalOpen(false);
      loadMenu();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
    await supabase.from("menu_items").update({ is_active: !is_active }).eq("id", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: !is_active } : i)),
    );
  }

  async function handleDeleteItem(id: string, itemName: string) {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    await supabase.from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <p className="text-xs sm:text-sm text-plum/60">Loading menu items…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-plum-deep">Menu Items ({items.length})</h2>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-xs sm:text-sm font-semibold text-cream transition hover:bg-plum-deep active:scale-95 shadow-sm"
        >
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-plum/10 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg object-cover bg-plum/5 shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-plum/10 text-plum/50 shrink-0">
                  <ImageIcon size={22} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-plum-deep text-base truncate">{item.name}</p>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plum-deep">
                    {item.category}
                  </span>
                </div>
                {item.tagline && <p className="text-xs text-plum/60 truncate">{item.tagline}</p>}
                <p className="text-xs font-medium text-plum mt-0.5">
                  {item.options.map((o) => `${o.label}: ${formatKes(Number(o.price))}`).join(" · ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="flex items-center gap-1 rounded-lg border border-plum/20 px-3 py-1.5 text-xs font-semibold text-plum hover:bg-plum/5 transition"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleActive(item.id, item.is_active)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  item.is_active ? "bg-green-100 text-green-800" : "bg-plum/10 text-plum/50"
                }`}
              >
                {item.is_active ? "Active" : "Hidden"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id, item.name)}
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-deep/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-plum/10 pb-3">
              <h3 className="font-display text-xl font-bold text-plum-deep">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-plum/60 hover:bg-plum/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum/80">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Butter Chapati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none"
                />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-plum/80">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none"
                  >
                    <option value="chapati">Chapati</option>
                    <option value="mandazi">Mandazi</option>
                    <option value="samosas">Samosas</option>
                    <option value="yoghurts">Yoghurts</option>
                    <option value="cakes">Cakes</option>
                    <option value="catering">Catering</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-plum/80">Tagline / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Soft, flaky with extra layers"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="rounded-xl border border-plum/15 bg-cream p-4 space-y-3">
                <label className="block text-xs font-semibold text-plum-deep flex items-center gap-1.5">
                  <ImageIcon size={16} /> Food Picture / Photo
                </label>

                {imageUrl && (
                  <div className="flex items-center gap-3">
                    <img src={imageUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-plum/20" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove Picture
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-plum/30 bg-white p-3 text-xs font-semibold text-plum cursor-pointer hover:bg-plum/5 transition">
                    <Upload size={16} />
                    {uploading ? "Uploading Image…" : "Upload Photo from Device"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-center text-[11px] text-plum/50">— OR enter image web URL —</p>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-plum/15 bg-white px-3 py-1.5 text-xs text-plum-deep"
                  />
                </div>
              </div>

              {/* Option / Pricing */}
              <div className="rounded-xl border border-plum/15 p-4 space-y-3">
                <label className="block text-xs font-semibold text-plum-deep">Pricing & Portion Size</label>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-plum/70">Portion Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 dozen"
                      value={optionLabel}
                      onChange={(e) => setOptionLabel(e.target.value)}
                      className="w-full rounded-lg border border-plum/15 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-plum/70">Price (KSh)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="300"
                      value={optionPrice}
                      onChange={(e) => setOptionPrice(e.target.value)}
                      className="w-full rounded-lg border border-plum/15 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-plum/70">Unit</label>
                    <input
                      type="text"
                      placeholder="dozen / pack"
                      value={optionUnit}
                      onChange={(e) => setOptionUnit(e.target.value)}
                      className="w-full rounded-lg border border-plum/15 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-plum/20 px-5 py-2 text-xs font-semibold text-plum/70 hover:bg-plum/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-full bg-plum px-6 py-2 text-xs font-semibold text-cream transition hover:bg-plum-deep active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Item…" : editingItem ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DatesTab() {
  const [dates, setDates] = useState<{ id: string; day: string; is_open: boolean; capacity: number; note: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("availability_dates")
      .select("*")
      .gte("day", todayIso())
      .order("day")
      .limit(30)
      .then(({ data, error }) => {
        if (!error) setDates(data ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleOpen(id: string, is_open: boolean) {
    await supabase.from("availability_dates").update({ is_open: !is_open }).eq("id", id);
    setDates((prev) => prev.map((d) => (d.id === id ? { ...d, is_open: !is_open } : d)));
  }

  if (loading) return <p className="text-xs sm:text-sm text-plum/60">Loading availability dates…</p>;

  return (
    <div className="space-y-2">
      {dates.map((d) => (
        <div
          key={d.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-plum/10 bg-white px-4 py-3 shadow-sm"
        >
          <div>
            <p className="font-semibold text-plum-deep text-sm">
              {new Date(d.day + "T12:00:00").toLocaleDateString("en-KE", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-plum/60">
              Capacity: {d.capacity} orders{d.note ? ` · ${d.note}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleOpen(d.id, d.is_open)}
            className={`self-start sm:self-auto rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              d.is_open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
            }`}
          >
            {d.is_open ? "Open" : "Closed"}
          </button>
        </div>
      ))}
    </div>
  );
}

function AdminsTab({ currentUserId }: { currentUserId: string }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  function loadAdmins() {
    setLoading(true);
    supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAdmins(data as AdminUser[]);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    setCreating(true);

    try {
      // 1. Sign up new auth user
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (signUpErr) throw signUpErr;

      if (data.user) {
        // 2. Insert user into admin_users table
        const { error: insertErr } = await supabase
          .from("admin_users")
          .insert({ user_id: data.user.id });

        if (insertErr) throw insertErr;

        setMsg(`Successfully created admin account for ${newEmail}`);
        setNewEmail("");
        setNewPassword("");
        loadAdmins();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin account");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(userId: string) {
    if (userId === currentUserId) {
      alert("You cannot revoke your own admin access.");
      return;
    }
    if (!confirm("Are you sure you want to revoke admin access for this user?")) return;

    const { error: delErr } = await supabase.from("admin_users").delete().eq("user_id", userId);
    if (delErr) {
      setError(delErr.message);
    } else {
      setMsg("Admin access revoked.");
      setAdmins((prev) => prev.filter((a) => a.user_id !== userId));
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Admin Form */}
      <div className="rounded-2xl border border-plum/10 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-plum-deep flex items-center gap-2">
          <UserPlus size={18} className="text-plum" /> Add New Admin
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-plum/60">
          Create an additional administrative account with kitchen dashboard access.
        </p>

        <form onSubmit={handleCreateAdmin} className="mt-4 space-y-3">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-plum/80">New Admin Email</label>
              <input
                type="email"
                required
                placeholder="newadmin@yummys.co.ke"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none focus:ring-2 focus:ring-plum/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-plum/80 font-mono">Temporary Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-plum/15 bg-white px-3 py-2 text-sm text-plum-deep focus:outline-none focus:ring-2 focus:ring-plum/20"
              />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {msg && <p className="text-xs font-medium text-green-700">{msg}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded-full bg-plum px-5 py-2.5 text-xs sm:text-sm font-semibold text-cream transition hover:bg-plum-deep active:scale-95 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Admin Account"}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="rounded-2xl border border-plum/10 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-plum-deep">Current Admin Users</h2>
        <p className="mt-1 text-xs text-plum/60">
          User IDs registered with administrative privileges in <code className="rounded bg-plum/10 px-1 font-mono">admin_users</code>.
        </p>

        {loading ? (
          <p className="mt-4 text-xs text-plum/60">Loading admin users…</p>
        ) : admins.length === 0 ? (
          <p className="mt-4 text-xs text-plum/60">No admin accounts found in system.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {admins.map((a) => (
              <div
                key={a.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-plum/10 bg-cream px-4 py-3"
              >
                <div className="truncate">
                  <p className="font-mono text-xs text-plum-deep font-medium truncate">
                    ID: {a.user_id}
                  </p>
                  <p className="text-[11px] text-plum/60 mt-0.5">
                    Added: {new Date(a.created_at).toLocaleDateString("en-KE")}
                    {a.user_id === currentUserId && (
                      <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-plum-deep">
                        You
                      </span>
                    )}
                  </p>
                </div>
                {a.user_id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(a.user_id)}
                    className="self-start sm:self-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} /> Revoke Access
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
