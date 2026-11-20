import { redirect } from "next/navigation";

// Subscriptions are discontinued; there is no checkout to start.
export default function UpgradePage() {
  redirect("/settings");
}
