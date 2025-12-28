import { useRoute } from "wouter";
import { useBusinessInfo, useSubmitFeedback } from "@/hooks/use-feedbacks";
import { Loader2, CheckCircle2, Utensils, Users, Clock, Sparkles, MessageSquare } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { StarRating } from "@/components/ui/star-rating";
import { NPSRating } from "@/components/ui/nps-rating";
import { useState } from "react";
import { motion } from "framer-motion";
import type { InsertFeedback } from "@shared/schema";

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:userId");
  const userId = params ? parseInt(params.userId) : 0;
  
  const { data: business, isLoading: isBusinessLoading } = useBusinessInfo(userId);
  const submitFeedback = useSubmitFeedback();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { control, handleSubmit, register, formState: { errors }, watch } = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      userId: userId,
      ratingFood: 0,
      ratingService: 0,
      ratingWaitTime: 0,
      ratingAmbiance: 0,
      npsScore: undefined,
      comment: ""
    }
  });

  const watchedValues = watch();
  const completedSteps = [
    watchedValues.npsScore !== undefined,
    (watchedValues.ratingFood ?? 0) > 0,
    (watchedValues.ratingService ?? 0) > 0,
    (watchedValues.ratingWaitTime ?? 0) > 0,
    (watchedValues.ratingAmbiance ?? 0) > 0,
  ].filter(Boolean).length;

  const onSubmit = (data: InsertFeedback) => {
    submitFeedback.mutate(data, {
      onSuccess: () => setIsSubmitted(true)
    });
  };

  if (isBusinessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">?</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Empresa nao encontrada</h1>
          <p className="text-slate-500">O link que voce acessou parece estar incorreto.</p>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-md space-y-6"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Obrigado!</h1>
            <p className="text-lg text-slate-600">
              Seu feedback e muito importante para nos. Agradecemos por ajudar <span className="font-semibold text-slate-800">{business.businessName}</span> a melhorar.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {business.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{business.businessName}</h1>
              <p className="text-xs text-slate-500">Avaliacao rapida</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < completedSteps 
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 scale-110" 
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <Controller
              name="npsScore"
              control={control}
              rules={{ required: "Por favor, selecione uma nota" }}
              render={({ field }) => (
                <NPSRating 
                  value={field.value ?? null} 
                  onChange={field.onChange} 
                  label="O quanto voce nos recomendaria?"
                />
              )}
            />
            {errors.npsScore && (
              <p className="text-red-500 text-sm text-center mt-3 bg-red-50 py-2 px-3 rounded-lg">
                {errors.npsScore.message}
              </p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Comida</span>
                </div>
                <Controller
                  name="ratingFood"
                  control={control}
                  rules={{ min: { value: 1, message: "Obrigatorio" } }}
                  render={({ field }) => (
                    <StarRating 
                      value={field.value ?? 0} 
                      onChange={field.onChange}
                      compact
                    />
                  )}
                />
                {errors.ratingFood && <p className="text-red-500 text-xs mt-2">Obrigatorio</p>}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Atendimento</span>
                </div>
                <Controller
                  name="ratingService"
                  control={control}
                  rules={{ min: { value: 1, message: "Obrigatorio" } }}
                  render={({ field }) => (
                    <StarRating 
                      value={field.value ?? 0} 
                      onChange={field.onChange}
                      compact
                    />
                  )}
                />
                {errors.ratingService && <p className="text-red-500 text-xs mt-2">Obrigatorio</p>}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Tempo</span>
                </div>
                <Controller
                  name="ratingWaitTime"
                  control={control}
                  rules={{ min: { value: 1, message: "Obrigatorio" } }}
                  render={({ field }) => (
                    <StarRating 
                      value={field.value ?? 0} 
                      onChange={field.onChange}
                      compact
                    />
                  )}
                />
                {errors.ratingWaitTime && <p className="text-red-500 text-xs mt-2">Obrigatorio</p>}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Ambiente</span>
                </div>
                <Controller
                  name="ratingAmbiance"
                  control={control}
                  rules={{ min: { value: 1, message: "Obrigatorio" } }}
                  render={({ field }) => (
                    <StarRating 
                      value={field.value ?? 0} 
                      onChange={field.onChange}
                      compact
                    />
                  )}
                />
                {errors.ratingAmbiance && <p className="text-red-500 text-xs mt-2">Obrigatorio</p>}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Comentario (opcional)</span>
            </div>
            <textarea
              {...register("comment")}
              data-testid="input-comment"
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
              placeholder="Conte sua experiencia..."
              rows={3}
            />
          </motion.div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-8">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={submitFeedback.isPending}
            data-testid="button-submit-feedback"
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {submitFeedback.isPending ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Enviar Avaliacao"
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">Sua opiniao nos ajuda a melhorar</p>
        </div>
      </div>
    </div>
  );
}
