type SectionHeadingProps = {
  eyebrow: string;
  title: string;
};

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="section-heading js-reveal">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}
