export const AiTypingDots = () => (
  <span className="inline-flex items-end gap-1.5 mr-3">
    {[0, 180, 360].map((delay, i) => (
      <span
        key={i}
        className="relative inline-flex"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* halo ring */}
        <span
          className="
            absolute inset-0 rounded-full
            bg-[var(--color-accent-pink)]
            opacity-25 blur-[2px]
          "
        />
        {/* core dot */}
        <span
          className="
            w-2 h-2 rounded-full
            animate-typing-wave
            bg-gradient-to-br
            from-[var(--color-primary)]
            via-[var(--color-primary)]
            to-[var(--color-accent-pink)]
            shadow-[0_0_10px_rgba(255,42,126,0.6)]
          "
        />
      </span>
    ))}
  </span>
);
