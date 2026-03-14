import Link from "next/link";
import { registerAction } from "../actions";
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

const REGISTER_ERROR_MESSAGE: Record<string, string> = {
  invalid_input: "Please complete all required fields with valid values.",
  signup_failed: "Could not create your account. Please try again.",
  role_not_configured: "Role setup is incomplete. Contact an administrator.",
  user_profile_failed: "Your account was created, but profile setup failed.",
  student_profile_failed: "Student profile setup failed. Please try again.",
  faculty_profile_failed: "Faculty profile setup failed. Please try again.",
  email_in_use: "This email is already registered. Please sign in instead.",
};

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; error_code?: string; error_message?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? REGISTER_ERROR_MESSAGE[params.error] ?? "Registration failed. Please try again."
    : null;
  const errorCode = params.error_code;
  const errorDetail = params.error_message;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create an account and choose your role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <div className="mb-4 space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{errorMessage}</p>
              {errorCode ? <p className="text-xs">Code: {errorCode}</p> : null}
              {errorDetail ? <p className="text-xs">Detail: {errorDetail}</p> : null}
            </div>
          ) : null}
          <form action={registerAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" type="text" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required defaultValue="student">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <Button type="submit">Create Account</Button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-black underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
