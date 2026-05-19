import { LoginForm } from "./form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-zinc-400">Track your tickets in one place.</p>
      <LoginForm />
    </div>
  );
}
