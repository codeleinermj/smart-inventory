import type { HealthResponse } from "@smart-inv/shared-types";

export default function Home() {
  const placeholder: HealthResponse = { status: "ok", service: "web" };
  return (
    <main>
      <h1>Smart Inventory</h1>
      <p>Dashboard coming soon. Wired type: {placeholder.status} / {placeholder.service}</p>
    </main>
  );
}
