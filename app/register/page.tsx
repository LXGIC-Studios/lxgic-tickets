import { RegisterForm } from "./form";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-zinc-400">So you can track your tickets later.</p>
      <RegisterForm />
    </div>
  );
}
