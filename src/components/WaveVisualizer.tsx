type Props = {
  active: boolean;
  bars?: number;
  className?: string;
};

export function WaveVisualizer({ active, bars = 7, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`wave-bar ${active ? '' : 'paused'}`}
          style={{
            height: '20px',
            animationDelay: `${i * 0.12}s`,
            animationDuration: `${1.0 + (i % 3) * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}
