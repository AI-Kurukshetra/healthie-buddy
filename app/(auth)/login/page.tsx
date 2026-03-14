import Link from "next/link";
import { loginAction } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  invalid_input: "Please enter your email and password.",
  invalid_credentials: "Invalid email or password.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? LOGIN_ERROR_MESSAGE[params.error] ?? "Login failed. Please try again."
    : null;
  const showRegisteredMessage = params.registered === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in with your student, faculty, or admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showRegisteredMessage ? (
            <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Account created. Sign in to continue.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
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

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" defaultValue="student">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <Button type="submit">Sign In</Button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            New user?{" "}
            <Link href="/register" className="font-medium text-black underline">
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
