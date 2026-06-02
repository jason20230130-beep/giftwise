import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { giftGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Gift Guides | Giftwise",
  description: "Browse shoppable gift guides by recipient, budget, interest, and occasion."
};

export default function GuidesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="guides-index">
        <section className="guide-hero">
          <p className="eyebrow">Gift guides</p>
          <h1>Find the right gift lane before the perfect gift.</h1>
          <p>Browse focused gift guides by person, budget, interest, or occasion, then use the AI finder when you want a more personal shortlist.</p>
          <div className="guide-actions">
            <Link className="primary-button" href="/#finder">Try the AI gift finder</Link>
          </div>
        </section>

        <section className="guide-directory" aria-label="All gift guides">
          {giftGuides.map((guide) => (
            <Link className="guide-directory-card" href={`/guides/${guide.slug}`} key={guide.slug}>
              <span>{guide.eyebrow}</span>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
            </Link>
          ))}
        </section>
      </main>
      <footer className="footer">
        <p>Giftwise may earn a commission from qualifying purchases. Prices and availability can change, so use retailer pages for current details.</p>
      </footer>
    </>
  );
}
