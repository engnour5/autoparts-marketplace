import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
