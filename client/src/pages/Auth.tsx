import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, Star } from "lucide-react";

// Add confirm password to schema for validation only
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = { username: string; password: string };

export default function AuthPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-slate-900 fill-current" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Fleek</span>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-6">
            Understand your customers <br/> better than ever.
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Join thousands of businesses using Fleek to gather feedback, improve service, and grow their reputation.
          </p>
        </div>
        
        {/* Abstract decorative circles */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Fleek Inc.
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-slate-900">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login" 
                ? "Enter your details to access your dashboard." 
                : "Get started with your free account today."}
            </p>
          </div>

          {mode === "login" ? (
            <LoginForm 
              onSubmit={async (data) => {
                setIsPending(true);
                try {
                  await login.mutateAsync(data);
                } finally {
                  setIsPending(false);
                }
              }} 
              isLoading={isPending} 
            />
          ) : (
            <RegisterForm 
              onSubmit={async (data) => {
                setIsPending(true);
                try {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { confirmPassword, ...apiData } = data;
                  await register.mutateAsync(apiData);
                  setLocation("/login");
                } finally {
                  setIsPending(false);
                }
              }} 
              isLoading={isPending} 
            />
          )}

          <div className="mt-6 text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: LoginFormData) => void, isLoading: boolean }) {
  const form = useForm<LoginFormData>();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">
          Email / Username
        </label>
        <input
          {...form.register("username", { required: true })}
          id="username"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          placeholder="name@example.com"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
            Password
          </label>
        </div>
        <input
          {...form.register("password", { required: true })}
          id="password"
          type="password"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-md"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log in"}
      </button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: RegisterFormData) => void, isLoading: boolean }) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="businessName">Business Name</label>
        <input
          {...form.register("businessName")}
          id="businessName"
          placeholder="Joe's Coffee"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
          disabled={isLoading}
        />
        {form.formState.errors.businessName && (
          <p className="text-sm text-destructive">{form.formState.errors.businessName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="username">Email</label>
        <input
          {...form.register("username")}
          id="username"
          type="email"
          placeholder="joe@coffee.com"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
          disabled={isLoading}
        />
        {form.formState.errors.username && (
          <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm</label>
          <input
            {...form.register("confirmPassword")}
            id="confirmPassword"
            type="password"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
            disabled={isLoading}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-md mt-2"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
      </button>
    </form>
  );
}
