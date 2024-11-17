'use client';

import { useSearchParams } from 'next/navigation';
import SignInForm from "@/components/auth/SignInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {registered && (
          <Alert className="border-green-500 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Registration successful! Please sign in with your new account.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
