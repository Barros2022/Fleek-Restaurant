import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      const res = await fetch(api.auth.user.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.user.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const login = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Credenciais inválidas");
        }
        throw new Error("Falha ao entrar");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.user.path], data);
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const register = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Dados inválidos");
        }
        throw new Error("Falha ao criar conta");
      }

      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.user.path], data);
      toast({
        title: "Conta criada!",
        description: "Seu cadastro foi realizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.user.path], null);
      toast({
        title: "Até logo!",
        description: "Você saiu da sua conta.",
      });
    },
  });

  return {
    user,
    isLoading,
    login,
    register,
    logout,
  };
}
