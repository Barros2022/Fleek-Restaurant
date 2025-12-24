import { useState } from "react";
import { useRoute } from "wouter";
import { useSubmitFeedback, usePublicBusiness } from "@/hooks/use-feedbacks";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";

// Ensure numbers are coerced
const formSchema = insertFeedbackSchema.extend({
  rating: z.coerce.number().min(1).max(5),
  npsScore: z.coerce.number().min(0).max(10),
});

type FeedbackForm = z.infer<typeof formSchema>;

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:userId");
  const userId = Number(params?.userId);
  const { data: business, isLoading: isBusinessLoading } = usePublicBusiness(userId);
  const submit = useSubmitFeedback();
  const [submitted, setSubmitted] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<FeedbackForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      rating: 0,
      npsScore: -1, // No selection state
    }
  });

  const ratingValue = watch("rating");
  const npsValue = watch("npsScore");

  if (isBusinessLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
          <p className="text-muted-foreground">This feedback link seems to be invalid.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg shadow-slate-200/50 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-900 mb-4">Thank You!</h2>
          <p className="text-lg text-slate-600 mb-8">
            Your feedback helps <strong>{business.businessName}</strong> improve. We appreciate your time.
          </p>
          <div className="text-sm text-muted-foreground">
            Powered by <span className="font-bold text-slate-900">Fleek</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">{business.businessName}</h1>
          <p className="text-muted-foreground">We value your opinion. How did we do today?</p>
        </div>

        <form onSubmit={handleSubmit(async (data) => {
          await submit.mutateAsync(data);
          setSubmitted(true);
        })} className="space-y-6">
          
          {/* Card 1: Rating */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
            <label className="block text-lg font-semibold text-slate-900 mb-4 text-center">
              How was your experience?
            </label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      className="group p-2 focus:outline-none transition-transform active:scale-90"
                    >
                      <Star 
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200",
                          star <= field.value 
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm scale-110" 
                            : "fill-slate-100 text-slate-200 group-hover:text-slate-300"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.rating && <p className="text-center text-destructive text-sm mt-2">Please select a rating</p>}
          </div>

          {/* Card 2: NPS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
            <label className="block text-lg font-semibold text-slate-900 mb-2 text-center">
              How likely are you to recommend us?
            </label>
            <p className="text-center text-sm text-muted-foreground mb-6">0 = Not likely, 10 = Very likely</p>
            
            <Controller
              name="npsScore"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => field.onChange(score)}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-lg font-bold transition-all border-2",
                        field.value === score
                          ? "bg-primary border-primary text-white shadow-lg scale-110 z-10"
                          : "bg-white border-slate-100 text-slate-600 hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.npsScore && <p className="text-center text-destructive text-sm mt-2">Please select a score</p>}
          </div>

          {/* Card 3: Comment */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
            <label htmlFor="comment" className="block text-lg font-semibold text-slate-900 mb-4">
              Any suggestions for improvement? <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
            </label>
            <textarea
              {...register("comment")}
              id="comment"
              rows={4}
              placeholder="Tell us what you liked or what we can do better..."
              className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submit.isPending}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {submit.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
              </>
            ) : "Submit Feedback"}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">Powered by <span className="font-bold text-slate-700">Fleek</span></p>
        </div>
      </div>
    </div>
  );
}
