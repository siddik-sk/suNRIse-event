import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { FaqList } from "@/components/faq/faq-list";
import { FEST, FAQS } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers to common questions about registering, passes, events and visiting ${FEST.fullName}.`,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: `FAQ · ${FEST.fullName}`,
    description: "Registration, passes, events and everything in between.",
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help desk"
        title={
          <>
            Answers, <span className="text-gradient">before you ask.</span>
          </>
        }
        description="Registration, QR passes, event clashes, accommodation and more. If it is not here, the contact form reaches a human."
      />

      <section className="section-pad">
        <div className="container-fest">
          <FaqList />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            url: absoluteUrl("/faq"),
            mainEntity: FAQS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </>
  );
}
