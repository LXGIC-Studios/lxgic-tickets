import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lxgic Tickets",
  description: "File a ticket for Lxgic projects.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <header className="border-b border-zinc-900">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-green-500">lxgic</span> tickets
            </Link>
            <nav className="text-sm text-zinc-400 flex items-center gap-4">
              <Link href="/new" className="hover:text-green-500">File a ticket</Link>
              {user ? (
                <>
                  <Link href="/my-tickets" className="hover:text-green-500">My tickets</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-green-500">Sign in</Link>
                  <Link href="/register" className="hover:text-green-500">Register</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
          powered by Lxgic Studios
        </footer>
      </body>
    </html>
  );
}
