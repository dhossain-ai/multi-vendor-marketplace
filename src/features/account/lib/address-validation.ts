import type { AddressWriteInput } from "@/features/account/types";

const LIMITS = {
  label: 80,
  recipientName: 120,
  line1: 160,
  line2: 160,
  city: 100,
  stateRegion: 100,
  postalCode: 32,
  phone: 40,
};

type AddressValidationResult =
  | { input: AddressWriteInput; error: null }
  | { input: null; error: string };

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
};

const getOptionalValue = (
  formData: FormData,
  key: string,
  maxLength: number,
): string | null => {
  const value = getStringValue(formData, key);

  if (!value) {
    return null;
  }

  return value.slice(0, maxLength);
};

const getRequiredValue = (
  formData: FormData,
  key: string,
  label: string,
  maxLength: number,
): { value: string | null; error: string | null } => {
  const value = getStringValue(formData, key);

  if (!value) {
    return { value: null, error: `${label} is required.` };
  }

  if (value.length > maxLength) {
    return { value: null, error: `${label} must be ${maxLength} characters or fewer.` };
  }

  return { value, error: null };
};

const isChecked = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return value === "on" || value === "true" || value === "1";
};

export function validateAddressForm(formData: FormData): AddressValidationResult {
  const recipient = getRequiredValue(
    formData,
    "recipientName",
    "Recipient name",
    LIMITS.recipientName,
  );

  if (recipient.error) {
    return { input: null, error: recipient.error };
  }
  const recipientName = recipient.value ?? "";

  const line1 = getRequiredValue(formData, "line1", "Address line 1", LIMITS.line1);

  if (line1.error) {
    return { input: null, error: line1.error };
  }
  const addressLine1 = line1.value ?? "";

  const city = getRequiredValue(formData, "city", "City", LIMITS.city);

  if (city.error) {
    return { input: null, error: city.error };
  }
  const cityName = city.value ?? "";

  const countryCode = getStringValue(formData, "countryCode").toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { input: null, error: "Country code must use two letters, such as US." };
  }

  const label = getOptionalValue(formData, "label", LIMITS.label);
  const line2 = getOptionalValue(formData, "line2", LIMITS.line2);
  const stateRegion = getOptionalValue(
    formData,
    "stateRegion",
    LIMITS.stateRegion,
  );
  const postalCode = getOptionalValue(formData, "postalCode", LIMITS.postalCode);
  const phone = getOptionalValue(formData, "phone", LIMITS.phone);

  return {
    error: null,
    input: {
      label,
      recipientName,
      line1: addressLine1,
      line2,
      city: cityName,
      stateRegion,
      postalCode,
      countryCode,
      phone,
      makeDefault: isChecked(formData, "makeDefault"),
    },
  };
}

export function getAddressIdFromForm(formData: FormData) {
  const addressId = getStringValue(formData, "addressId");

  return addressId || null;
}
