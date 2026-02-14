import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/types";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
