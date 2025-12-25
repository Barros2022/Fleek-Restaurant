import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertFeedback } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch Stats for Dashboard
export function useFeedbackStats(days?: number) {
  return useQuery({
    queryKey: [api.feedbacks.stats.path, days],
    queryFn: async () => {
      const url = days ? `${api.feedbacks.stats.path}?days=${days}` : api.feedbacks.stats.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.feedbacks.stats.responses[200].parse(await res.json());
    },
  });
}

// List Feedbacks for Dashboard
export function useFeedbacks(days?: number) {
  return useQuery({
    queryKey: [api.feedbacks.list.path, days],
    queryFn: async () => {
      const url = days ? `${api.feedbacks.list.path}?days=${days}` : api.feedbacks.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      return api.feedbacks.list.responses[200].parse(await res.json());
    },
  });
}

// Submit Feedback (Public)
export function useSubmitFeedback() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      const res = await fetch(api.feedbacks.submit.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      return api.feedbacks.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Feedback enviado!",
        description: "Obrigado por compartilhar sua opinião.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });
}

// Delete All Feedbacks
export function useDeleteFeedbacks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.feedbacks.deleteAll.path, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete feedbacks");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.feedbacks.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.feedbacks.list.path] });
      toast({ title: "Sucesso", description: "Todos os feedbacks foram excluídos." });
    },
  });
}

// Get Business Info (Public)
export function useBusinessInfo(userId: number) {
  return useQuery({
    queryKey: [api.public.business.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.public.business.path, { id: userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Business not found");
      return api.public.business.responses[200].parse(await res.json());
    },
    enabled: !!userId && !isNaN(userId),
  });
}
