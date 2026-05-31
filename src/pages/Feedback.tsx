import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { StarIcon, ChatIcon, CheckIcon } from '@/components/icons';
import { sendFeedback } from '@/services/api';
import type { FeedbackType } from '@/types';

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'praise', label: 'Compliment' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Autre' },
];

export function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Donnez une note avant d\'envoyer');
      return;
    }
    setSubmitting(true);
    await sendFeedback({ rating, type, message });
    setSubmitting(false);
    setDone(true);
    toast.success('Merci pour votre retour !', { icon: '✅' });
  };

  if (done) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass mx-auto max-w-md rounded-3xl p-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-match/20 text-match">
            <CheckIcon width={34} height={34} />
          </div>
          <h1 className="font-display text-2xl font-bold">Retour envoyé</h1>
          <p className="mt-2 text-white/60">
            Merci ! Votre avis nous aide à améliorer BipBipJob.
          </p>
          <button
            onClick={() => {
              setDone(false);
              setRating(0);
              setMessage('');
            }}
            className="btn mt-6 bg-white/10 px-6 py-3 hover:bg-white/15"
          >
            Envoyer un autre retour
          </button>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ruban/15 text-ruban">
            <ChatIcon width={22} height={22} />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">Feedback</h1>
            <p className="text-white/50">Dites-nous ce que vous pensez de la machine.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass space-y-6 rounded-3xl p-7">
          {/* Rating */}
          <div>
            <label className="label">Votre note</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                >
                  <StarIcon
                    width={34}
                    height={34}
                    style={{
                      color: (hover || rating) >= n ? '#FACC15' : '#374151',
                      fill: (hover || rating) >= n ? '#FACC15' : 'none',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="label">Type de retour</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`btn py-2.5 text-sm ${
                    type === t.value
                      ? 'bg-ruban text-ink'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="label" htmlFor="msg">Message</label>
            <textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Qu'avez-vous aimé ? Que pourrait-on améliorer ?"
              className="field resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn w-full bg-ruban py-3.5 text-ink shadow-neon hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? 'Envoi…' : 'Envoyer le retour'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
