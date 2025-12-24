import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertFeedback } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useFeedbacks() {
  return useQuery({
    queryKey: [api.feedbacks.list.path],
    queryFn: async () => {
      const res = await fetch(api.feedbacks.list.path);
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      return api.feedbacks.list.responses[200].parse(await res.json());
    },
  });
}

export function useFeedbackStats() {
  return useQuery({
    queryKey: [api.feedbacks.stats.path],
    queryFn: async () => {
      const res = await fetch(api.feedbacks.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.feedbacks.stats.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitFeedback() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      const res = await fetch(api.feedbacks.submit.path, {
        method: api.feedbacks.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.feedbacks.submit.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit feedback");
      }
      return api.feedbacks.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ 
        title: "Thank you!", 
        description: "Your feedback has been submitted successfully." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function usePublicBusiness(id: number) {
  return useQuery({
    queryKey: [api.public.business.path, id],
    queryFn: async () => {
      const url = buildUrl(api.public.business.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business info");
      return api.public.business.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}
