import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@portfolio/shared";
import { Loader2, LockKeyhole } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { ApiError } from "@/services/api";

export function LoginPage() {
  const { data: user } = useAuth();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch (err) {
      form.setError("root", {
        message:
          err instanceof ApiError
            ? err.status === 429
              ? err.message
              : err.status === 401
                ? "Incorrect email or password."
                : err.message
            : "Can’t reach the server. Is the backend running?",
      });
    }
  });

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="bg-brand-soft text-brand mx-auto grid size-12 place-items-center rounded-xl">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in to your portfolio</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage content, publish changes and your resume.</p>
        </div>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
            {form.formState.errors.root && (
              <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                {form.formState.errors.root.message}
              </p>
            )}
            <TextField name="email" label="Email" type="email" autoComplete="username" autoFocus />
            <TextField name="password" label="Password" type="password" autoComplete="current-password" />
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
          </form>
        </FormProvider>
        <p className="text-muted-foreground mt-6 text-center text-xs">
          Forgot your password? Run <code className="bg-muted rounded px-1">npm run create-admin</code> on the server to reset it.
        </p>
      </div>
    </main>
  );
}
