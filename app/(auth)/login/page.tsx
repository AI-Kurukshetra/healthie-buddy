import { loginAction } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLink } from "@/components/ui/app-link";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  invalid_input: "Please enter your email and password.",
  invalid_credentials: "Invalid email or password.",
  login_failed: "Login failed. Please try again.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; error_code?: string; error_message?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? LOGIN_ERROR_MESSAGE[params.error] ?? "Login failed. Please try again."
    : null;
  const errorCode = params.error_code;
  const errorDetail = params.error_message;
  const showRegisteredMessage = params.registered === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Campus Management</p>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in with your campus account. Your role is resolved automatically after authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showRegisteredMessage ? (
            <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Account created. Sign in to continue.
            </p>
          ) : null}
          {errorMessage ? (
            <div className="mb-4 space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{errorMessage}</p>
              {errorCode ? <p className="text-xs">Code: {errorCode}</p> : null}
              {errorDetail ? <p className="text-xs">Detail: {errorDetail}</p> : null}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <FormSubmitButton className="w-full" pendingLabel="Signing In...">
              Sign In
            </FormSubmitButton>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            New user?{" "}
            <AppLink href="/register" className="font-medium text-black underline">
              Create account
            </AppLink>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
