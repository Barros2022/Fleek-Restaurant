import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Utensils, Users, Clock, Sparkles, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:userId");
  const userId = params ? parseInt(params.userId) : 0;
  
  const [business, setBusiness] = useState<{ businessName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [nps, setNps] = useState<number | null>(null);
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [ambiance, setAmbiance] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`/api/business/${userId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setBusiness(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userId]);

  const completedSteps = [nps !== null, food > 0, service > 0, waitTime > 0, ambiance > 0].filter(Boolean).length;

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError("");
    
    if (nps === null) {
      setError("Selecione uma nota de 0 a 10");
      return;
    }
    if (food === 0 || service === 0 || waitTime === 0 || ambiance === 0) {
      setError("Preencha todas as avaliacoes com estrelas");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          npsScore: nps,
          ratingFood: food,
          ratingService: service,
          ratingWaitTime: waitTime,
          ratingAmbiance: ambiance,
          comment: comment || null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Erro ao enviar. Tente novamente.");
      }
    } catch (err) {
      setError("Erro de conexao. Verifique sua internet.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-red-400">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Empresa nao encontrada</h1>
          <p className="text-slate-500">O link que voce acessou parece estar incorreto.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Obrigado!</h1>
            <p className="text-lg text-slate-600">
              Seu feedback e muito importante. Agradecemos por ajudar <span className="font-semibold">{business.businessName}</span> a melhorar.
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
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < completedSteps ? "bg-violet-500" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-5">
          <p className="text-base font-semibold text-slate-800 text-center mb-4">O quanto voce nos recomendaria?</p>
          <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNps(n)}
                className={`aspect-square rounded-xl font-bold text-base flex items-center justify-center transition-all ${
                  nps === n 
                    ? n <= 6 ? "bg-red-500 text-white shadow-lg" : n <= 8 ? "bg-amber-500 text-white shadow-lg" : "bg-emerald-500 text-white shadow-lg"
                    : "bg-slate-50 border-2 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-3 px-1 max-w-sm mx-auto">
            <span>Nada provavel</span>
            <span>Muito provavel</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <RatingCard icon={<Utensils className="w-4 h-4 text-orange-600" />} iconBg="bg-orange-100" label="Comida" value={food} onChange={setFood} />
          <RatingCard icon={<Users className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100" label="Atendimento" value={service} onChange={setService} />
          <RatingCard icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100" label="Tempo" value={waitTime} onChange={setWaitTime} />
          <RatingCard icon={<Sparkles className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100" label="Ambiente" value={ambiance} onChange={setAmbiance} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Comentario (opcional)</span>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:outline-none transition-all resize-none text-slate-700"
            placeholder="Conte sua experiencia..."
            rows={3}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-8 z-50">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-violet-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Enviar Avaliacao"}
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">Sua opiniao nos ajuda a melhorar</p>
        </div>
      </div>
    </div>
  );
}

function RatingCard({ icon, iconBg, label, value, onChange }: { icon: React.ReactNode; iconBg: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex gap-0.5 justify-center">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
            <Star className={`w-6 h-6 ${n <= value ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
