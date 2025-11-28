import { auth, currentUser } from "@clerk/nextjs";

export async function getUserRole() {
  const user = await currentUser();
  return user?.publicMetadata?.role || "student";
}
