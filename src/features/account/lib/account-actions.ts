"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { updateProfileFullName } from "@/features/account/lib/profile-repository";

const PROFILE_NAME_MAX_LENGTH = 120;

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const buildProfilePath = (key: "notice" | "error", message: string) =>
  `/account/profile?${key}=${encodeURIComponent(message)}`;

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
