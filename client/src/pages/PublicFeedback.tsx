import { useRoute } from "wouter";
import { useBusinessInfo, useSubmitFeedback } from "@/hooks/use-feedbacks";
import { Loader2, Send, ChevronRight, ChevronLeft, Utensils, Users, Clock, Sparkles, MessageSquare, ThumbsUp, Star } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsertFeedback } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "nps", title: "Recomendacao", icon: ThumbsUp },
  { id: "ratings", title: "Avaliacoes", icon: Star },
  { id: "comment", title: "Comentario", icon: MessageSquare },
];

const RATING_CATEGORIES = [
  { key: "ratingFood", label: "Comida", icon: Utensils, color: "from-orange-500 to-red-500" },
  { key: "ratingService", label: "Atendimento", icon: Users, color: "from-blue-500 to-indigo-500" },
  { key: "ratingWaitTime", label: "Tempo de Espera", icon: Clock, color: "from-emerald-500 to-teal-500" },
  { key: "ratingAmbiance", label: "Ambiente", icon: Sparkles, color: "from-purple-500 to-pink-500" },
] as const;

function ModernStarRating({ value, onChange, category }: { 
  value: number; 
  onChange: (v: number) => void; 
  category: typeof RATING_CATEGORIES[number];
}) {
  const Icon = category.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", category.color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-slate-800">{category.label}</span>
      </div>
      <div className="flex justify-between gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200",
              star <= value 
                ? "bg-gradient-to-br text-white shadow-lg scale-105 " + category.color
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            {star}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ModernNPSRating({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  const getScoreColor = (score: number, isSelected: boolean) => {
    if (!isSelected) return "bg-slate-100 text-slate-500 hover:bg-slate-200";
    if (score <= 6) return "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg";
    if (score <= 8) return "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg";
    return "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg";
  };

  const getEmoji = () => {
    if (value === undefined) return null;
    if (value <= 6) return { text: "Precisamos melhorar", color: "text-red-500" };
    if (value <= 8) return { text: "Bom, mas pode melhorar", color: "text-amber-500" };
    return { text: "Excelente! Obrigado", color: "text-emerald-500" };
  };

  const emoji = getEmoji();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          De 0 a 10, o quanto voce recomendaria?
        </h2>
        <p className="text-slate-500 text-sm">
          Toque no numero que melhor representa sua experiencia
        </p>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => (
          <motion.button
            key={score}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(score)}
            className={cn(
              "aspect-square rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center",
              score === 10 ? "col-span-2" : "",
              getScoreColor(score, value === score),
              value === score ? "scale-110 ring-4 ring-offset-2 ring-slate-200" : ""
            )}
          >
            {score}
          </motion.button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-slate-400 px-1">
        <span>Nada provavel</span>
        <span>Muito provavel</span>
      </div>

      <AnimatePresence>
        {emoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn("text-center font-medium", emoji.color)}
          >
            {emoji.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:userId");
  const userId = params ? parseInt(params.userId) : 0;
  
  const { data: business, isLoading: isBusinessLoading } = useBusinessInfo(userId);
  const submitFeedback = useSubmitFeedback();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { control, handleSubmit, register, formState: { errors }, watch, trigger } = useForm<InsertFeedback>({
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

  const canProceed = () => {
    if (currentStep === 0) {
      return watchedValues.npsScore !== undefined;
    }
    if (currentStep === 1) {
      return (watchedValues.ratingFood ?? 0) > 0 && 
             (watchedValues.ratingService ?? 0) > 0 && 
             (watchedValues.ratingWaitTime ?? 0) > 0 && 
             (watchedValues.ratingAmbiance ?? 0) > 0;
    }
    return true;
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      const valid = await trigger("npsScore");
      if (valid) setCurrentStep(1);
    } else if (currentStep === 1) {
      const valid = await trigger(["ratingFood", "ratingService", "ratingWaitTime", "ratingAmbiance"]);
      if (valid) setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const onSubmit = (data: InsertFeedback) => {
    submitFeedback.mutate(data, {
      onSuccess: () => setIsSubmitted(true)
    });
  };

  if (isBusinessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link invalido</h1>
          <p className="text-slate-500">O link que voce acessou parece estar incorreto ou expirado.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center p-4">
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
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200"
          >
            <Send className="w-12 h-12 text-white" />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Obrigado!</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Sua opiniao e muito importante para nos. <br />
              <span className="font-semibold text-emerald-600">{business.businessName}</span> agradece!
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-4"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">Avaliacao em andamento</span>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{business.businessName}</h1>
        </div>

        <div className="relative mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" :
                    isCompleted ? "bg-emerald-500 text-white" :
                    "bg-slate-200 text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-slate-400"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="nps"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <Controller
                  name="npsScore"
                  control={control}
                  rules={{ required: "Por favor, selecione uma nota" }}
                  render={({ field }) => (
                    <ModernNPSRating 
                      value={field.value} 
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.npsScore && (
                  <p className="text-red-500 text-sm text-center mt-4">{errors.npsScore.message}</p>
                )}
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="ratings"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Avalie cada categoria</h2>
                  <p className="text-slate-500 text-sm">De 1 a 5, como foi sua experiencia?</p>
                </div>
                
                {RATING_CATEGORIES.map((category, index) => (
                  <Controller
                    key={category.key}
                    name={category.key}
                    control={control}
                    rules={{ min: { value: 1, message: "Obrigatorio" } }}
                    render={({ field }) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ModernStarRating
                          value={field.value ?? 0}
                          onChange={field.onChange}
                          category={category}
                        />
                      </motion.div>
                    )}
                  />
                ))}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="comment"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Quer deixar um comentario?</h2>
                  <p className="text-slate-500 text-sm">Opcional, mas adorariamos ouvir mais de voce</p>
                </div>
                
                <textarea
                  {...register("comment")}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all resize-none h-36 text-slate-700 placeholder:text-slate-400"
                  placeholder="Conte-nos o que achou..."
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 py-6 rounded-2xl text-base"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar
              </Button>
            )}
            
            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 py-6 rounded-2xl text-base bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 transition-opacity"
              >
                Continuar
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitFeedback.isPending}
                className="flex-1 py-6 rounded-2xl text-base bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 transition-opacity shadow-lg shadow-green-200"
              >
                {submitFeedback.isPending ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    Enviar Avaliacao
                    <Send className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          Powered by <span className="font-semibold">Fleek</span>
        </p>
      </div>
    </div>
  );
}
