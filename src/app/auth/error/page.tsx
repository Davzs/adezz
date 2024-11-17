import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication Error",
  description: "Something went wrong during authentication",
};

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-red-600">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong during the authentication process.
            Please try again or contact support if the problem persists.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link
            href="/auth/signin"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-black px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
