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
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] ${
          tone === "dark" ? "text-accent2" : "text-accent"
        }`}
      >
        <span
          className={`inline-block h-[7px] w-[7px] rounded-full ${
            tone === "dark" ? "bg-accent2" : "bg-accent"
          }`}
        />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight md:text-[40px] ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 text-base leading-relaxed md:text-[17px] ${
          tone === "dark" ? "text-[#b9c0d0]" : "text-body"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
