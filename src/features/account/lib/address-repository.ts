import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type {
  AddressRow,
  AddressWriteInput,
  CustomerAddress,
  ShippingAddressSnapshot,
} from "@/features/account/types";

export class AddressOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddressOperationError";
  }
}

const getAddressClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const mapAddressRow = (row: AddressRow): CustomerAddress => ({
  id: row.id,
  userId: row.user_id,
  label: row.label,
  recipientName: row.recipient_name,
  line1: row.line_1,
  line2: row.line_2,
  city: row.city,
  stateRegion: row.state_region,
  postalCode: row.postal_code,
  countryCode: row.country_code,
  phone: row.phone,
  isDefault: row.is_default,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toMutationPayload = (input: AddressWriteInput) => ({
  label: input.label,
  recipient_name: input.recipientName,
  line_1: input.line1,
  line_2: input.line2,
  city: input.city,
  state_region: input.stateRegion,
  postal_code: input.postalCode,
  country_code: input.countryCode,
  phone: input.phone,
});

const unsetDefaultAddresses = async (userId: string, exceptAddressId?: string) => {
  const client = await getAddressClient();
  let query = client
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (exceptAddressId) {
    query = query.neq("id", exceptAddressId);
  }

  const { error } = await query;

  if (error) {
    throw new AddressOperationError("Unable to update your default address.");
  }
};

export async function listAddressesForUser(
  userId: string,
): Promise<CustomerAddress[]> {
  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new AddressOperationError("Unable to load your address book.");
  }

  return (data ?? []).map(mapAddressRow);
}

export async function getAddressForUser(
  userId: string,
  addressId: string,
): Promise<CustomerAddress | null> {
  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("id", addressId)
    .maybeSingle();

  if (error) {
    throw new AddressOperationError("Unable to load that address.");
  }

  return data ? mapAddressRow(data) : null;
}

export async function getDefaultAddressForUser(
  userId: string,
): Promise<CustomerAddress | null> {
  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AddressOperationError("Unable to load your default address.");
  }

  return data ? mapAddressRow(data) : null;
}

export async function createAddressForUser(
  userId: string,
  input: AddressWriteInput,
): Promise<CustomerAddress> {
  const client = await getAddressClient();
  const existingAddresses = await listAddressesForUser(userId);
  const shouldMakeDefault =
    input.makeDefault ||
    existingAddresses.length === 0 ||
    !existingAddresses.some((address) => address.isDefault);

  if (shouldMakeDefault) {
    await unsetDefaultAddresses(userId);
  }

  const { data, error } = await client
    .from("addresses")
    .insert({
      ...toMutationPayload(input),
      user_id: userId,
      is_default: shouldMakeDefault,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new AddressOperationError("Unable to save your address.");
  }

  return mapAddressRow(data);
}

export async function updateAddressForUser(
  userId: string,
  addressId: string,
  input: AddressWriteInput,
): Promise<CustomerAddress> {
  const existingAddress = await getAddressForUser(userId, addressId);

  if (!existingAddress) {
    throw new AddressOperationError("Address not found.");
  }

  if (input.makeDefault) {
    await unsetDefaultAddresses(userId, addressId);
  }

  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .update({
      ...toMutationPayload(input),
      is_default: input.makeDefault ? true : existingAddress.isDefault,
    })
    .eq("user_id", userId)
    .eq("id", addressId)
    .select("*")
    .single();

  if (error || !data) {
    throw new AddressOperationError("Unable to update your address.");
  }

  return mapAddressRow(data);
}

export async function deleteAddressForUser(
  userId: string,
  addressId: string,
): Promise<void> {
  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .delete()
    .eq("user_id", userId)
    .eq("id", addressId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AddressOperationError("Unable to delete your address.");
  }

  if (!data) {
    throw new AddressOperationError("Address not found.");
  }
}

export async function setDefaultAddressForUser(
  userId: string,
  addressId: string,
): Promise<CustomerAddress> {
  const existingAddress = await getAddressForUser(userId, addressId);

  if (!existingAddress) {
    throw new AddressOperationError("Address not found.");
  }

  await unsetDefaultAddresses(userId, addressId);

  const client = await getAddressClient();
  const { data, error } = await client
    .from("addresses")
    .update({ is_default: true })
    .eq("user_id", userId)
    .eq("id", addressId)
    .select("*")
    .single();

  if (error || !data) {
    throw new AddressOperationError("Unable to set your default address.");
  }

  return mapAddressRow(data);
}

export function buildShippingAddressSnapshot(
  address: CustomerAddress,
): ShippingAddressSnapshot {
  return {
    recipientName: address.recipientName,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    stateRegion: address.stateRegion,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
    phone: address.phone,
    label: address.label,
  };
}
