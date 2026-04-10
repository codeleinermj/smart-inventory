import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/server/session";

/**
 * Root route — redirect to /products if the user has a session cookie,
 * otherwise to /login. We only check cookie presence here; the real JWT
 * validation happens upstream the next time data is fetched.
 */
export default async function Home() {
  const token = await getSessionToken();
  if (token) {
    redirect("/products");
  }
  redirect("/login");
}
