import { LoginForm } from "./form";

export default function AdminLogin() {
  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
      <p className="text-sm text-zinc-400 mt-2">Enter the admin password.</p>
      <LoginForm />
    </div>
  );
}
