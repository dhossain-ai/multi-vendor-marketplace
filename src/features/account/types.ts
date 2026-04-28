import type { Database, Json } from "@/types/database";

export type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export type CustomerAddress = {
  id: string;
  userId: string;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressWriteInput = {
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string;
  phone: string | null;
  makeDefault: boolean;
};

export type ShippingAddressSnapshot = {
  recipient_name: string;
  line_1: string;
  line_2: string | null;
  city: string;
  state_region: string | null;
  postal_code: string | null;
  country_code: string;
  phone: string | null;
  label: string | null;
} & Record<string, Json | undefined>;
