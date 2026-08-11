export type MenuOption = {
  id: string;
  label: string;
  price: number;
  unit: string;
  note: string;
  sort: number;
};

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image_url: string;
  category: string;
  sort: number;
  is_active: boolean;
  options: MenuOption[];
};

export type Availability = {
  id: string;
  day: string;
  is_open: boolean;
  capacity: number;
  note: string;
  booked: number;
};

export type OrderLine = {
  name: string;
  option: string;
  unit: string;
  qty: number;
  price: number;
};

export type Booking = {
  id: string;
  customer_name: string;
  phone: string;
  mode: string;
  location: string;
  event_date: string;
  event_time: string;
  items: OrderLine[];
  total: number;
  notes: string;
  status: string;
  whatsapp_phone: string;
  created_at: string;
};

export type ShopData = {
  content: Record<string, string>;
  items: MenuItem[];
  availability: Availability[];
};

export type CartLine = {
  id: string;
  itemId: string;
  name: string;
  category: string;
  optionId: string;
  option: string;
  unit: string;
  price: number;
  qty: number;
  image_url?: string;
};

export const CATEGORIES = [
  { id: "chapati", label: "Chapati" },
  { id: "mandazi", label: "Mandazi" },
  { id: "samosas", label: "Samosas" },
  { id: "yoghurts", label: "Yoghurts" },
  { id: "cakes", label: "Cakes" },
  { id: "catering", label: "Catering" },
] as const;

export function formatKes(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function todayIso() {
  const now = new Date();
  const nairobi = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return nairobi.toISOString().slice(0, 10);
}

export type Database = {
  public: {
    Tables: {
      menu_items: {
        Row: Omit<MenuItem, "options">;
        Insert: Partial<Omit<MenuItem, "options">>;
        Update: Partial<Omit<MenuItem, "options">>;
        Relationships: [];
      };
      menu_options: {
        Row: MenuOption & { item_id: string };
        Insert: Partial<MenuOption & { item_id: string }>;
        Update: Partial<MenuOption & { item_id: string }>;
        Relationships: [];
      };
      site_content: {
        Row: { key: string; value: string; label: string; section: string };
        Insert: { key: string; value: string };
        Update: { value: string };
        Relationships: [];
      };
      availability_dates: {
        Row: Omit<Availability, "booked">;
        Insert: Partial<Omit<Availability, "booked">>;
        Update: Partial<Omit<Availability, "booked">>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking>;
        Update: Partial<Booking>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_initial_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin_table_empty: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
};
