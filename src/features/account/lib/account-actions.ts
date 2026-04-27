"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import {
  createAddressForUser,
  deleteAddressForUser,
  setDefaultAddressForUser,
  updateAddressForUser,
} from "@/features/account/lib/address-repository";
import {
  getAddressIdFromForm,
  validateAddressForm,
} from "@/features/account/lib/address-validation";
import { updateProfileFullName } from "@/features/account/lib/profile-repository";

const PROFILE_NAME_MAX_LENGTH = 120;

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const buildProfilePath = (key: "notice" | "error", message: string) =>
  `/account/profile?${key}=${encodeURIComponent(message)}`;

const buildAddressPath = (key: "notice" | "error", message: string) =>
  `/account/addresses?${key}=${encodeURIComponent(message)}`;

const revalidateAddressPaths = () => {
  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
};

export async function updateProfileAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/account/profile");
  const fullNameValue = getStringValue(formData, "fullName").trim();

  if (fullNameValue.length > PROFILE_NAME_MAX_LENGTH) {
    redirect(
      buildProfilePath(
        "error",
        `Full name must be ${PROFILE_NAME_MAX_LENGTH} characters or fewer.`,
      ),
    );
  }

  await updateProfileFullName(session.user.id, fullNameValue || null);

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect(buildProfilePath("notice", "Profile updated."));
}

export async function createAddressAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/account/addresses");
  const result = validateAddressForm(formData);

  if (result.error || !result.input) {
    redirect(buildAddressPath("error", result.error ?? "Address is incomplete."));
  }

  try {
    await createAddressForUser(session.user.id, result.input);
  } catch {
    redirect(buildAddressPath("error", "Unable to save your address right now."));
  }

  revalidateAddressPaths();
  redirect(buildAddressPath("notice", "Address saved."));
}

export async function updateAddressAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/account/addresses");
  const addressId = getAddressIdFromForm(formData);

  if (!addressId) {
    redirect(buildAddressPath("error", "Address not found."));
  }

  const result = validateAddressForm(formData);

  if (result.error || !result.input) {
    redirect(buildAddressPath("error", result.error ?? "Address is incomplete."));
  }

  try {
    await updateAddressForUser(session.user.id, addressId, result.input);
  } catch {
    redirect(buildAddressPath("error", "Unable to update that address right now."));
  }

  revalidateAddressPaths();
  redirect(buildAddressPath("notice", "Address updated."));
}

export async function deleteAddressAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/account/addresses");
  const addressId = getAddressIdFromForm(formData);

  if (!addressId) {
    redirect(buildAddressPath("error", "Address not found."));
  }

  try {
    await deleteAddressForUser(session.user.id, addressId);
  } catch {
    redirect(buildAddressPath("error", "Unable to delete that address right now."));
  }

  revalidateAddressPaths();
  redirect(buildAddressPath("notice", "Address deleted."));
}

export async function setDefaultAddressAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/account/addresses");
  const addressId = getAddressIdFromForm(formData);

  if (!addressId) {
    redirect(buildAddressPath("error", "Address not found."));
  }

  try {
    await setDefaultAddressForUser(session.user.id, addressId);
  } catch {
    redirect(
      buildAddressPath("error", "Unable to set that default address right now."),
    );
  }

  revalidateAddressPaths();
  redirect(buildAddressPath("notice", "Default address updated."));
}
