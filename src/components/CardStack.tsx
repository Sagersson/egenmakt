import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TheoryCard } from '@/data/modules';

export function CardStack({
  cards,
}: {
  cards: TheoryCard[];
}) {
  const [index, setIndex] = useState(0);
  const total = cards.length;
  const card = cards[index];

  const go = (dir: 1 | -1) => {
    setIndex((i) => Math.max(0, Math.min(total - 1, i + dir)));
  };

  // touch swipe
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
    touch.current = null;
  };

  const progress = ((index + 1) / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-sage-700">
        <span>
          Kort {index + 1} av {total}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-ink-600">
        <div
          className="h-full rounded-full bg-sage-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        key={index}
        className="card-elevated animate-slide-up min-h-[260px]"
      >
        <p className="mb-2 text-xs uppercase tracking-widest text-sage-700">Teori · Kort {index + 1}</p>
        <h3 className="mb-3 font-serif text-2xl leading-snug text-sage-100">{card.title}</h3>
        <p className="text-[15px] leading-relaxed text-sage-200">{card.body}</p>
        {card.example && (
          <div className="mt-4 rounded-xl border border-sage-700/30 bg-sage-500/5 px-4 py-3">
            <p className="mb-1 text-xs uppercase tracking-wider text-sage-500">Exempel</p>
            <p className="text-sm italic leading-relaxed text-sage-300">{card.example}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="btn-ghost border border-white/5 bg-ink-700/60 disabled:opacity-30"
          aria-label="Föregående kort"
        >
          <ChevronLeft size={16} /> Föregående
        </button>
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Gå till kort ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-sage-400' : 'w-1.5 bg-ink-500'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="btn-ghost border border-white/5 bg-ink-700/60 disabled:opacity-30"
          aria-label="Nästa kort"
        >
          Nästa <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
