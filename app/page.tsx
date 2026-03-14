import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/server";
import { homePathForRole } from "@/lib/auth/routes";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(homePathForRole(user.role));
  }

  redirect("/login");
}
