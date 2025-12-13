export const UserTypingDots = () => (
  <span className="inline-flex items-end gap-1 mr-3">
    {[0, 180, 360].map((delay, i) => (
      <span
        key={i}
        className="
          w-1.5 h-1.5 rounded-full
          bg-white
          opacity-50
          animate-user-typing
        "
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </span>
);

export const AiTypingDots = () => (
  <span className="inline-flex items-center gap-1 mr-3">
    {[0, 250, 500].map((delay, i) => (
      <span
        key={i}
        className="
          w-2 h-2 rounded-full
          bg-[rgba(240,244,255,0.9)]
          animate-ai-thinking
        "
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </span>
);
