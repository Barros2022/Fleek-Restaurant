import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Loader2, Lock, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme a senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const resetPassword = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await apiRequest("POST", "/api/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso!",
      });
    },
    onError: (err: Error) => {
      setError(err.message || "Erro ao redefinir senha");
      toast({
        title: "Erro",
        description: err.message || "Não foi possível redefinir a senha",
        variant: "destructive",
      });
    },
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Senha redefinida!</h1>
          <p className="text-slate-600 mb-8">
            Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova senha.
          </p>
          <Link 
            href="/login"
            className="inline-block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
            data-testid="link-go-login"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Erro</h1>
          <p className="text-slate-600 mb-8">{error}</p>
          <div className="space-y-3">
            <Link 
              href="/forgot-password"
              className="inline-block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
              data-testid="link-forgot-password"
            >
              Solicitar novo link
            </Link>
            <Link 
              href="/login"
              className="inline-block w-full py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all text-center"
              data-testid="link-login"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors" data-testid="link-back-login">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Login
          </Link>
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
              Criar nova senha
            </h1>
            <p className="text-slate-500">
              Digite sua nova senha abaixo. Escolha uma senha segura.
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => resetPassword.mutate(data))} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register("newPassword")}
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  placeholder="Digite a senha novamente"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              data-testid="button-submit"
            >
              {resetPassword.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Redefinir senha"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        
        <div className="relative h-full flex flex-col justify-center items-center p-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-lg text-center">
            <Lock className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-2xl font-bold mb-4">Segurança primeiro</h2>
            <p className="text-white/70">
              Escolha uma senha forte com pelo menos 6 caracteres para manter sua conta segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
