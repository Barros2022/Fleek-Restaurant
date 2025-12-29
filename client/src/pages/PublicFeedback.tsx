import { useRoute } from "wouter";
import { useState, useEffect } from "react";

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
    fetch(`/api/business/${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setBusiness(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  async function submit() {
    setError("");
    
    if (nps === null) {
      setError("Selecione uma nota de 0 a 10");
      return;
    }
    if (food === 0 || service === 0 || waitTime === 0 || ambiance === 0) {
      setError("Preencha todas as estrelas");
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch("/api/feedbacks", {
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

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Erro ao enviar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!business) {
    return <div className="min-h-screen flex items-center justify-center">Empresa nao encontrada</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-700">Obrigado!</h1>
          <p className="text-green-600 mt-2">Seu feedback foi enviado com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">{business.businessName}</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="font-medium mb-3">De 0 a 10, o quanto voce nos recomendaria?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNps(n)}
                className={`w-10 h-10 rounded-lg font-bold ${
                  nps === n 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StarBox label="Comida" value={food} onChange={setFood} />
          <StarBox label="Atendimento" value={service} onChange={setService} />
          <StarBox label="Tempo" value={waitTime} onChange={setWaitTime} />
          <StarBox label="Ambiente" value={ambiance} onChange={setAmbiance} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="font-medium mb-2">Comentario (opcional)</p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Conte sua experiencia..."
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar Avaliacao"}
        </button>
      </div>
    </div>
  );
}

function StarBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="font-medium mb-2 text-sm">{label}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="text-2xl"
          >
            {n <= value ? "★" : "☆"}
          </button>
        ))}
      </div>
    </div>
  );
}
