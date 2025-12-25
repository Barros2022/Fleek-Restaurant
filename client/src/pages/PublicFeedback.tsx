import { useRoute } from "wouter";
import { useBusinessInfo, useSubmitFeedback } from "@/hooks/use-feedbacks";
import { Loader2, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { StarRating } from "@/components/ui/star-rating";
import { NPSRating } from "@/components/ui/nps-rating";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsertFeedback } from "@shared/routes";

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:userId");
  const userId = params ? parseInt(params.userId) : 0;
  
  const { data: business, isLoading: isBusinessLoading } = useBusinessInfo(userId);
  const submitFeedback = useSubmitFeedback();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { control, handleSubmit, register, formState: { errors } } = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      userId: userId,
      ratingFood: 0,
      ratingService: 0,
      ratingWaitTime: 0,
      ratingAmbiance: 0,
      npsScore: undefined, // Let user select
      comment: ""
    }
  });

  const onSubmit = (data: InsertFeedback) => {
    submitFeedback.mutate(data, {
      onSuccess: () => setIsSubmitted(true)
    });
  };

  if (isBusinessLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Empresa não encontrada</h1>
          <p className="text-slate-500">O link que você acessou parece estar incorreto.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Obrigado!</h1>
          <p className="text-lg text-slate-600">
            Agradecemos pelo seu tempo. Seu feedback ajuda {business.businessName} a melhorar a cada dia.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-display text-slate-900">{business.businessName}</h1>
          <p className="text-slate-500 mt-2">Queremos ouvir sua opinião para te atender melhor.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* NPS Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <Controller
              name="npsScore"
              control={control}
              rules={{ required: "Por favor, selecione uma nota" }}
              render={({ field }) => (
                <NPSRating 
                  value={field.value} 
                  onChange={field.onChange} 
                  label="De 0 a 10, o quanto você recomendaria este estabelecimento para um amigo?"
                />
              )}
            />
            {errors.npsScore && <p className="text-red-500 text-sm text-center mt-2">{errors.npsScore.message}</p>}
          </div>

          {/* Star Ratings Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Controller
                name="ratingFood"
                control={control}
                rules={{ min: { value: 1, message: "Avaliação obrigatória" } }}
                render={({ field }) => (
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange} 
                    label="Como você avalia a qualidade da comida?" 
                  />
                )}
              />
              {errors.ratingFood && <p className="text-red-500 text-sm mt-1">Obrigatório</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Controller
                name="ratingService"
                control={control}
                rules={{ min: { value: 1, message: "Avaliação obrigatória" } }}
                render={({ field }) => (
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange} 
                    label="Como você avalia o atendimento?" 
                  />
                )}
              />
              {errors.ratingService && <p className="text-red-500 text-sm mt-1">Obrigatório</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Controller
                name="ratingWaitTime"
                control={control}
                rules={{ min: { value: 1, message: "Avaliação obrigatória" } }}
                render={({ field }) => (
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange} 
                    label="O tempo de espera foi satisfatório?" 
                  />
                )}
              />
              {errors.ratingWaitTime && <p className="text-red-500 text-sm mt-1">Obrigatório</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Controller
                name="ratingAmbiance"
                control={control}
                rules={{ min: { value: 1, message: "Avaliação obrigatória" } }}
                render={({ field }) => (
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange} 
                    label="Como você avalia limpeza e ambiente?" 
                  />
                )}
              />
              {errors.ratingAmbiance && <p className="text-red-500 text-sm mt-1">Obrigatório</p>}
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Se quiser, conte o que mais gostou ou o que podemos melhorar (opcional)
            </label>
            <textarea
              {...register("comment")}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none h-32"
              placeholder="Escreva seu comentário aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={submitFeedback.isPending}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {submitFeedback.isPending ? <Loader2 className="animate-spin" /> : "Enviar Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
