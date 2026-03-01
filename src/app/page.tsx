"use client";

import Image from "next/image";
import { useState } from "react";

function LogoIcon({ className }: { className?: string }) {
  // Proportions matched from original SVG: nodes at ~43% radius spread, ~28% above/below center
  return (
    <svg
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="35" cy="35" r="35" fill="#33E692" />
      {/* Edges connecting nodes */}
      <line x1="35" y1="25" x2="20" y2="45" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
      <line x1="35" y1="25" x2="50" y2="45" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
      {/* Nodes — top center, bottom-left, bottom-right */}
      <circle cx="35" cy="25" r="5.7" fill="white" />
      <circle cx="20" cy="45" r="5.7" fill="white" />
      <circle cx="50" cy="45" r="5.7" fill="white" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[#1e1e1e] border border-white/10 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Close contact form"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#33E692" strokeWidth="2.5" className="w-8 h-8">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-2">Message Sent!</h3>
            <p className="text-white/60 font-mono text-sm">
              Thanks for reaching out. I&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-heading text-2xl font-bold mb-1">Get in Touch</h3>
            <p className="text-white/50 font-mono text-xs mb-6">
              I&apos;ll get back to you as soon as possible.
            </p>

            <form
              action="https://formsubmit.co/franleplant@gmail.com"
              method="POST"
              onSubmit={() => {
                setSubmitted(true);
              }}
              target="hidden_iframe"
            >
              {/* FormSubmit config */}
              <input type="hidden" name="_subject" value="New contact from franleplant.com" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} />

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-white/60 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/25 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-white/60 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/25 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-white/60 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/25 transition-colors resize-none"
                    placeholder="What would you like to talk about?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-2.5 bg-green text-bg font-mono text-sm font-bold rounded-lg hover:bg-green/90 transition-colors"
                >
                  SEND MESSAGE
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Hidden iframe for form submission without redirect */}
      <iframe name="hidden_iframe" style={{ display: "none" }} />
    </div>
  );
}

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden bg-bg flex flex-col">
      {/* === TOP NAV BAR (logo top-left per design) === */}
      {/* Logo proportions from grilla: icon height=7x, gap=1x, text in middle 3x band */}
      <nav className="relative z-20 flex items-center px-6 md:px-12 py-5">
        <div className="flex items-center gap-[7px] md:gap-[8px]">
          <LogoIcon className="w-[42px] h-[42px] md:w-[48px] md:h-[48px]" />
          <span className="font-mono text-[22px] md:text-[25px] font-bold tracking-tight text-white leading-none">
            franleplant
          </span>
        </div>
      </nav>

      {/* === DECORATIVE BACKGROUND ELEMENTS === */}

      {/* Large blurry green circle - left side */}
      <div
        className="absolute -left-32 top-1/4 w-72 h-72 rounded-full opacity-25 animate-pulse-glow pointer-events-none"
        style={{
          background: "radial-gradient(circle, #33E692 0%, transparent 70%)",
        }}
      />

      {/* Green neon ring - top right */}
      <div className="neon-ring absolute top-12 right-24 w-16 h-16 opacity-40 pointer-events-none hidden lg:block animate-drift-a" />

      {/* Green neon ring - bottom right */}
      <div className="neon-ring absolute bottom-12 right-12 w-20 h-20 opacity-25 pointer-events-none hidden lg:block animate-drift-c" />

      {/* Small green dot - top area */}
      <div className="absolute top-24 left-1/3 w-3 h-3 rounded-full bg-green opacity-50 animate-drift-b pointer-events-none hidden md:block" />

      {/* Small green dot - right area */}
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-green opacity-40 animate-pulse-glow pointer-events-none hidden md:block" />

      {/* Pink cross - top left area */}
      <div className="pink-cross absolute top-32 left-[15%] opacity-30 pointer-events-none hidden lg:block animate-float" />

      {/* Pink cross - bottom right */}
      <div className="pink-cross absolute bottom-24 right-[30%] opacity-25 pointer-events-none hidden lg:block animate-drift-a" />

      {/* Small green circle - mid right */}
      <div className="absolute top-[55%] right-[8%] w-2.5 h-2.5 rounded-full bg-green opacity-30 animate-glow-slow pointer-events-none hidden lg:block" />

      {/* Hatched circle decoration */}
      <div
        className="absolute bottom-8 left-[10%] w-12 h-12 rounded-full opacity-10 pointer-events-none hidden lg:block animate-drift-c"
        style={{
          background: "repeating-linear-gradient(45deg, #33E692 0px, #33E692 1px, transparent 1px, transparent 6px)",
        }}
      />

      {/* === MAIN CONTENT (centered in remaining space) === */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-5xl w-full justify-center">
          {/* Left side: Rocket in circle — 30% bigger */}
          <div className="relative flex-shrink-0">
            <div className="relative w-80 h-80 md:w-[26rem] md:h-[26rem] lg:w-[29rem] lg:h-[29rem]">
              {/* Outer decorative pink circle */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid #FF5095" }}
              />
              {/* Inner content area */}
              <div
                className="absolute inset-3 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 30% 40%, #3a1f5e 0%, #2a1245 40%, #1a0a30 100%)",
                }}
              >
                <Image
                  src="/rocket.png"
                  alt="Rocket illustration representing building and launching software"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain drop-shadow-2xl animate-rocket-bob"
                  priority
                />
              </div>
              {/* Small green circle accent */}
              <div className="absolute -right-2 top-1/4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-green glow-green opacity-80" />
              {/* Hatched circle accent */}
              <div
                className="absolute -left-4 top-8 w-10 h-10 rounded-full opacity-20"
                style={{
                  background: "repeating-linear-gradient(45deg, #33E692 0px, #33E692 1px, transparent 1px, transparent 5px)",
                }}
              />
              {/* Small pink cross near circle */}
              <div className="pink-cross absolute -left-6 top-1/2 opacity-40" />
            </div>
          </div>

          {/* Right side: Text content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 lg:gap-6">
            {/* Heading */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              AI Builder
            </h1>

            {/* Subtitle */}
            <p className="font-mono text-sm md:text-base text-white/60 max-w-md leading-relaxed">
              Building the future of software with AI.
              <br />
              Engineer, mentor &amp; team lead.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-1">
              <a
                href="https://x.com/franleplant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-green transition-colors duration-200"
                aria-label="Follow on X (Twitter)"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://linkedin.com/in/franleplant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-green transition-colors duration-200"
                aria-label="Connect on LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://github.com/franleplant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-green transition-colors duration-200"
                aria-label="View GitHub profile"
              >
                <GitHubIcon />
              </a>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-green text-green font-mono text-sm font-medium rounded hover:bg-green hover:text-bg transition-all duration-300 mt-1 cursor-pointer"
            >
              CONTACT ME
            </button>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 text-[11px] font-mono text-white/30">
        <div className="flex items-center gap-[3px]">
          <LogoIcon className="w-[18px] h-[18px] opacity-50" />
          <span>franleplant</span>
        </div>
        <span>&copy; {new Date().getFullYear()} Fran Leplant</span>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Fran Leplant",
            url: "https://franleplant.com",
            jobTitle: "AI Builder & Software Engineer",
            description:
              "Building the future of software with AI. Expert in agentic programming, vibe coding, autonomous coding loops, JavaScript, TypeScript, React, and Node.js.",
            knowsAbout: [
              "Artificial Intelligence",
              "Agentic Programming",
              "Vibe Coding",
              "Ralph Wiggum Loop",
              "Autonomous Coding",
              "AI-Assisted Development",
              "LLM Engineering",
              "Prompt Engineering",
              "Software Engineering",
              "JavaScript",
              "TypeScript",
              "React",
              "Node.js",
            ],
            sameAs: [
              "https://x.com/franleplant",
              "https://linkedin.com/in/franleplant",
              "https://github.com/franleplant",
            ],
          }),
        }}
      />
    </main>
  );
}
