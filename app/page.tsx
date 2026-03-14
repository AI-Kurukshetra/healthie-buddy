import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/server";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
