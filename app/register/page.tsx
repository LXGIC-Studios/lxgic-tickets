import { RegisterForm } from "./form";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-zinc-400">So you can track your tickets.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
