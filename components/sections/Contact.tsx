import { portfolio } from "@/content/portfolio";

export function Contact() {
  return (
    <section className="section contact-section shell" id="contact">
      <div className="js-reveal">
        <p className="section-eyebrow">04 — Contact</p>
        <p className="contact-heading">Have a project?<br /><a href={`mailto:${portfolio.email}`}>Let&apos;s create.</a></p>
      </div>
      <div className="contact-grid js-reveal">
        <div><span>Based in</span><p>{portfolio.location}</p></div>
        <div><span>Email</span><p><a href={`mailto:${portfolio.email}`}>{portfolio.email}</a></p></div>
        <div><span>Call</span><p><a href={`tel:${portfolio.phoneHref}`}>{portfolio.phoneDisplay}</a></p></div>
      </div>
    </section>
  );
}
