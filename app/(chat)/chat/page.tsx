import { redirect } from "next/navigation";

// /chat (without an ID) redirects to the new-chat page at /
export default function ChatIndexPage() {
  redirect("/");
}
