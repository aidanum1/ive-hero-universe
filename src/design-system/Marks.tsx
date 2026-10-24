export function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m50 0 8 32 27-17-17 27 32 8-32 8 17 27-27-17-8 32-8-32-27 17 17-27L0 50l32-8-17-27 27 17Z" />
    </svg>
  );
}
export function Arrow({
  direction = "down",
}: {
  direction?: "down" | "right";
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{
        transform: direction === "right" ? "rotate(-90deg)" : undefined,
      }}
    >
      <path d="M12 3v17m-7-7 7 7 7-7" />
    </svg>
  );
}
export function IVELogo() {
  return (
    <svg viewBox="0 0 92 34" fill="currentColor" aria-label="IVE" role="img">
      <path d="M7 2h8L9 32H1L7 2Zm17 0h8l4 22L49 2h9L38 32H28L24 2Zm39 0h28l-2 7H69l-1 5h18l-1 6H67l-1 5h21l-2 7H57L63 2Z" />
    </svg>
  );
}
export function SignalMarks({ active = false }: { active?: boolean }) {
  return (
    <div
      className="signalMarks"
      aria-label={active ? "One of six signals released" : "Six hero signals"}
    >
      {["#8552ff", "#f44957", "#69cde8", "#d2e64f", "#ff9251", "#c7cfd5"].map(
        (c, i) => (
          <i
            key={c}
            style={{ "--signal-color": c } as React.CSSProperties}
            data-active={active && i === 0}
          />
        ),
      )}
    </div>
  );
}
