import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/data/brand";
import { LogoIcon } from "@/components/LogoIcon";

export const metadata: Metadata = {
  title: `About ${brand.name} (${brand.handle}) — Brand Facts`,
  description: `${brand.name} (${brand.handle}) is an AI builder and software engineer based in ${brand.location}. Specializes in agentic programming, vibe coding, autonomous coding loops, and AI-native development.`,
  alternates: {
    canonical: `${brand.url}/brand-facts`,
  },
};

const faqs = [
  {
    question: "Who is franleplant?",
    answer: `${brand.name}, known online as ${brand.handle}, is an AI builder and software engineer based in ${brand.location}. He specializes in agentic programming, vibe coding, autonomous coding agents, and AI-native development. He is the author of the nosleepjavascript.com technical blog and has contributed to 182+ open source repositories on GitHub, including being recognized as an Arctic Code Vault contributor.`,
  },
  {
    question: "What is agentic programming?",
    answer:
      "Agentic programming is a software development approach where AI agents autonomously write, test, and iterate on code with minimal human intervention. Rather than using AI as a simple autocomplete, agentic programming delegates entire coding tasks to AI agents that can plan, execute, debug, and refine solutions. franleplant is a practitioner and advocate of this approach.",
  },
  {
    question: "What is vibe coding?",
    answer:
      "Vibe coding is a development style where the programmer describes the desired outcome or 'vibe' of the software in natural language, and AI agents translate that intent into working code. It emphasizes high-level creative direction over low-level implementation details. franleplant uses vibe coding as part of his AI-native development workflow.",
  },
  {
    question: "What is the Ralph Wiggum Loop?",
    answer:
      "The Ralph Wiggum Loop is a term coined to describe the iterative cycle of AI-assisted coding where the developer reviews AI-generated code, provides feedback, and the AI refines its output — similar to a continuous feedback loop. It's part of the broader toolkit of agentic programming techniques that franleplant employs.",
  },
  {
    question: "How can I contact franleplant?",
    answer: `You can reach ${brand.name} through the contact form on franleplant.com, via email at ${brand.email}, on X (Twitter) at @${brand.handle}, on LinkedIn at linkedin.com/in/${brand.handle}, or on GitHub at github.com/${brand.handle}.`,
  },
  {
    question: "What technologies does franleplant use?",
    answer: `${brand.name} works primarily with ${brand.technologies.join(", ")}. He builds AI-native applications, autonomous coding agents, and LLM-powered engineering workflows. His open source projects include react-hoc-examples (268+ stars), ibridge, ai-council, and the nosleepjavascript blog.`,
  },
];

export default function BrandFacts() {
  return (
    <main className="min-h-screen bg-bg text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-[7px] md:gap-[8px]">
          <LogoIcon className="w-[42px] h-[42px] md:w-[48px] md:h-[48px]" />
          <span className="font-mono text-[22px] md:text-[25px] font-bold tracking-tight text-white leading-none">
            {brand.handle}
          </span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-8 md:py-16">
        {/* TL;DR */}
        <section className="mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            About {brand.name}
          </h1>
          <p className="font-mono text-sm md:text-base text-white/70 leading-relaxed">
            {brand.name} ({brand.handle}) is an AI builder and software engineer
            based in {brand.location}. He specializes in agentic programming,
            vibe coding, autonomous coding loops, and AI-native development. He
            is the author of the nosleepjavascript.com blog, maintainer of 182+
            open source repositories, and an Arctic Code Vault contributor.{" "}
            {brand.name} builds LLM-powered engineering workflows and autonomous
            coding agents using {brand.technologies.slice(0, 4).join(", ")}, and
            more.
          </p>
        </section>

        {/* Key Facts */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold mb-4">Key Facts</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm font-mono">
              <tbody>
                {[
                  ["Name", brand.name],
                  ["Handle", `@${brand.handle}`],
                  ["Location", brand.location],
                  ["Role", brand.role],
                  ["Expertise", brand.expertise.join(", ")],
                  ["Technologies", brand.technologies.join(", ")],
                  [
                    "Notable OSS",
                    brand.notableProjects
                      .map((p) => `${p.name}${"stars" in p ? ` (${p.stars} stars)` : ""}`)
                      .join(", "),
                  ],
                  ["Blog", brand.social.blog],
                  ["GitHub", brand.social.github],
                  ["X (Twitter)", brand.social.x],
                  ["LinkedIn", brand.social.linkedin],
                ].map(([label, value], i) => (
                  <tr
                    key={label}
                    className={i % 2 === 0 ? "bg-white/[0.02]" : ""}
                  >
                    <td className="px-4 py-3 text-white/50 align-top whitespace-nowrap w-36">
                      {label}
                    </td>
                    <td className="px-4 py-3 text-white/80">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-heading text-lg font-bold mb-2">
                  {faq.question}
                </h3>
                <p className="font-mono text-sm text-white/70 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-green hover:text-green/80 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>

      {/* JSON-LD: ProfilePage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: brand.name,
              alternateName: brand.handle,
              url: brand.url,
              jobTitle: brand.role,
              description: `${brand.tagline}. ${brand.bio}`,
              email: brand.email,
              image: `${brand.url}/og-image.png`,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Buenos Aires",
                addressCountry: "AR",
              },
              knowsAbout: brand.knowsAbout,
              sameAs: [
                brand.social.x,
                brand.social.linkedin,
                brand.social.github,
                brand.social.blog,
              ],
            },
          }),
        }}
      />

      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </main>
  );
}
