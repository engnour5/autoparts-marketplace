import { redirect } from "next/navigation";

export default function CustomerMessagesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/messages`);
}
