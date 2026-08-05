type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p
        className={`inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest ${
          tone === "dark" ? "text-primary-light" : "text-primary-dark"
        }`}
      >
        <span className="h-px w-8 bg-primary" />
        {eyebrow}
        {centered && <span className="h-px w-8 bg-primary" />}
      </p>
      <h2
        className={`font-display mt-4 text-3xl font-bold md:text-5xl ${
          tone === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 text-lg leading-8 ${
          tone === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
