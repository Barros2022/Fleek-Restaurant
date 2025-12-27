import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Mail, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const forgotPassword = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao processar solicitação");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.resetLink) {
        setResetLink(data.resetLink);
        toast({
          title: "Link gerado",
          description: "Use o link abaixo para redefinir sua senha.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "E-mail não encontrado",
        variant: "destructive",
      });
    },
  });

  const copyLink = async () => {
    if (resetLink) {
      await navigator.clipboard.writeText(resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado",
        description: "Cole o link no navegador para redefinir sua senha.",
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors" data-testid="link-back-login">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Login
          </Link>
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
              Esqueceu a senha?
            </h1>
            <p className="text-slate-500">
              Digite seu e-mail e geraremos um link para você criar uma nova senha.
            </p>
          </div>

          {!resetLink ? (
            <form onSubmit={handleSubmit((data) => forgotPassword.mutate(data))} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    placeholder="voce@empresa.com"
                    data-testid="input-email"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                data-testid="button-submit"
              >
                {forgotPassword.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Gerar link de redefinição"}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 text-sm font-medium mb-3">
                  Link de redefinição gerado com sucesso!
                </p>
                <p className="text-green-700 text-sm mb-4">
                  Clique no botão abaixo para ir diretamente para a página de redefinição, ou copie o link.
                </p>
                <div className="flex flex-col gap-3">
                  <Link 
                    href={resetLink.replace(window.location.origin, '')}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-center transition-all"
                    data-testid="link-reset"
                  >
                    Redefinir senha agora
                  </Link>
                  <button
                    onClick={copyLink}
                    className="w-full py-3 px-4 bg-white border border-green-300 hover:bg-green-50 text-green-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                    data-testid="button-copy-link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar link"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setResetLink(null)}
                className="w-full py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all"
                data-testid="button-new-request"
              >
                Gerar novo link
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Lembrou a senha?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        
        <div className="relative h-full flex flex-col justify-center items-center p-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-lg text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-2xl font-bold mb-4">Recupere seu acesso</h2>
            <p className="text-white/70">
              Não se preocupe! Vamos ajudá-lo a recuperar o acesso à sua conta de forma rápida e segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
