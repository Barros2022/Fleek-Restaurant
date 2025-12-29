import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

export default function PublicFeedback() {
  const { userId } = useParams<{ userId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<{ businessName: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (nps === null) {
      setError("Selecione uma nota de 0 a 10");
      return;
    }
    if (food === 0 || service === 0 || waitTime === 0 || ambiance === 0) {
      setError("Preencha todas as avaliacoes");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
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
        setError("Erro ao enviar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-8 h-8 text-violet-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Empresa nao encontrada</h1>
          <p className="text-slate-500">Link incorreto.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Obrigado!</h1>
          <p className="text-slate-600">Sua avaliacao foi enviada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 text-center">
        <h1 className="text-xl font-bold">{business.businessName}</h1>
        <p className="text-violet-200 text-sm mt-1">Avalie sua experiencia</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-32 max-w-lg mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 text-center">
            De 0 a 10, qual a chance de recomendar?
          </h2>
          <div className="grid grid-cols-11 gap-1">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNps(n)}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                  nps === n
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StarRating label="Comida" value={food} onChange={setFood} />
          <StarRating label="Atendimento" value={service} onChange={setService} />
          <StarRating label="Tempo de espera" value={waitTime} onChange={setWaitTime} />
          <StarRating label="Ambiente" value={ambiance} onChange={setAmbiance} />
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block font-medium text-slate-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none resize-none"
            placeholder="Conte sua experiencia..."
            rows={3}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <div className="max-w-lg mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Enviando...
                </>
              ) : (
                "Enviar Avaliacao"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-700 mb-2 text-center">{label}</p>
      <div className="flex justify-center gap-1">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1"
          >
            <Star
              className={`w-7 h-7 ${
                n <= value
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
