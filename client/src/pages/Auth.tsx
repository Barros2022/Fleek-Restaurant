import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const registerSchema = z.object({
  businessName: z.string().min(1, "Nome do negócio é obrigatório"),
  username: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [, setLocation] = useLocation();
  const { login, register, user } = useAuth();
  
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Home
          </Link>
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
              {isLogin ? "Bem-vindo de volta" : "Comece gratuitamente"}
            </h1>
            <p className="text-slate-500">
              {isLogin 
                ? "Entre para acessar seu dashboard de feedbacks." 
                : "Crie sua conta e comece a coletar avaliações hoje."}
            </p>
          </div>

          {isLogin ? (
            <LoginForm onSubmit={(data) => login.mutate(data)} isPending={login.isPending} />
          ) : (
            <RegisterForm onSubmit={(data) => register.mutate(data)} isPending={register.isPending} />
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <Link 
                href={isLogin ? "/register" : "/login"} 
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image/Marketing */}
      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        {/* Restaurant ambiance abstract */}
        
        <div className="relative h-full flex flex-col justify-end p-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-lg">
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="text-yellow-400">★</div>
              ))}
            </div>
            <p className="text-xl font-medium leading-relaxed mb-6">
              "Desde que começamos a usar o Fleek, conseguimos identificar pontos de melhoria no atendimento que nem imaginávamos. O NPS subiu 30% em dois meses!"
            </p>
            <div>
              <div className="font-bold">Carlos Mendes</div>
              <div className="text-white/60 text-sm">Dono do Bistrô Mendes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isPending }: { onSubmit: (data: LoginData) => void, isPending: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">E-mail</label>
        <input
          {...register("username")}
          type="email"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="voce@empresa.com"
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-900">Senha</label>
        </div>
        <input
          {...register("password")}
          type="password"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Entrar na conta"}
      </button>
    </form>
  );
}

function RegisterForm({ onSubmit, isPending }: { onSubmit: (data: RegisterData) => void, isPending: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Nome do Negócio</label>
        <input
          {...register("businessName")}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="Ex: Pizzaria do João"
        />
        {errors.businessName && <p className="text-sm text-red-500">{errors.businessName.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">E-mail Profissional</label>
        <input
          {...register("username")}
          type="email"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="voce@empresa.com"
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Senha</label>
        <input
          {...register("password")}
          type="password"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="Mínimo 6 caracteres"
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Criar conta grátis"}
      </button>
    </form>
  );
}
