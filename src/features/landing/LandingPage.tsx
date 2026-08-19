import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Lock, MessageCircle, Send, ShieldCheck, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, partners, testimonials } from "@/lib/mock";
import { useScrollReveal } from "@/lib/motion-presets";
import { scrollToSection } from "@/lib/scroll-to-section";

function Trust({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="hero-trust-pill">
      {icon}
      {label}
    </span>
  );
}

export function LandingPage() {
  const reveal = useScrollReveal();
  const location = useLocation();
  const heroRef = useRef<HTMLElement>(null);
  const [heroHeader, setHeroHeader] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroHeader(entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = location.hash.replace(/^#/, "");
    if (!id) return;

    const frame = requestAnimationFrame(() => {
      scrollToSection(id, "auto");
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <div className="relative">
      <SiteHeader transparent={heroHeader} hero={heroHeader} />

      <section
        ref={heroRef}
        id="hero"
        className="hero-scene relative -mt-[4.5rem] min-h-[min(100dvh,980px)] overflow-hidden pt-[4.5rem]"
      >
        <div aria-hidden className="absolute inset-0">
          <img
            src="/images/hero-background.jpg"
            alt=""
            className="h-full w-full scale-105 object-cover object-[center_72%]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-sage/55 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-sage/80 via-sage/35 to-foreground/78" />
          <div className="absolute inset-0 bg-gradient-to-t from-sage/50 via-transparent to-sage/20" />
        </div>

        <div className="relative mx-auto flex min-h-[min(100dvh,980px)] max-w-[1380px] flex-col px-4 pb-6 pt-[5.5rem] md:px-8 md:pb-10 md:pt-[6rem]">
          <div className="hero-frame relative flex flex-1 flex-col">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sage/20 via-transparent to-sage/30"
            />

            <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-12 md:py-20">
              <div className="hero-glass-badge eyebrow mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-soft" />
                For the chapters that need company
              </div>
              <h1 className="display-1 mx-auto max-w-3xl text-white">
                Someone has been
                <br className="hidden sm:block" />
                <em className="italic text-sage-soft">where you are</em> now.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/82 sm:text-lg">
                Seen quietly matches you with one person who&apos;s lived through what
                you&apos;re going through. No feeds. No followers. Just a conversation that
                understands.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link to="/onboarding/welcome" className="btn-hero-primary group">
                  Find your person
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link to="/onboarding/welcome" className="btn-hero-secondary">
                  I want to help someone
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-xs">
                <Trust icon={<Lock className="h-3.5 w-3.5" />} label="End-to-end private" />
                <Trust icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Human-moderated" />
                <Trust icon={<Heart className="h-3.5 w-3.5" />} label="Never sold or advertised" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-3xl px-6 pb-10 md:px-10 md:pb-12">
              <div className="hero-glass-panel p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 font-serif text-lg text-white backdrop-blur-sm">
                    S
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">Sofia · she/her</p>
                    <p className="text-xs text-white/72">Matched through life transition · 94% understanding</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-soft" />
                    Available now
                  </span>
                </div>
                <p className="mt-5 text-left font-serif text-lg leading-relaxed italic text-white/92">
                  &ldquo;I moved to a different country last month. It&apos;s really hard to find a
                  community in here.&rdquo;
                </p>
                <div className="mt-5 flex items-center justify-between text-xs text-white/65">
                  <span>Conversation warmth · gentle</span>
                  <span>9:50 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="landing-band-light landing-section-equal">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.p {...reveal(0)} className="eyebrow text-muted-foreground">
            About us
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3 max-w-2xl">
            A quiet company for the chapters that need <em className="italic text-sage">company.</em>
          </motion.h2>
          <motion.p {...reveal(0.08)} className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Seen began with a simple belief: the loneliest moments are often the ordinary ones — when
            no one around you has lived what you&apos;re living. We built a place where one person who
            understands can meet you there.
          </motion.p>
          <motion.div {...reveal(0.12)} className="mt-10">
            <Link to="/about" className="btn-secondary group">
              Learn more about us
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="landing-band-sage">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.p {...reveal(0)} className="eyebrow">
            How matching works
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3 max-w-2xl">
            Three quiet steps. No pressure to perform.
          </motion.h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Reflect",
                d: "A short, guided check-in. One emotional decision per screen. Skip anything that doesn't fit.",
                icon: <Leaf className="h-5 w-5" />,
              },
              {
                n: "02",
                t: "Be matched",
                d: "We find one person whose lived experience and emotional state meets yours — not a feed of strangers.",
                icon: <Users className="h-5 w-5" />,
              },
              {
                n: "03",
                t: "Talk softly",
                d: "A private conversation with gentle prompts, optional grounding, and a safety layer you'll never have to think about.",
                icon: <MessageCircle className="h-5 w-5" />,
              },
            ].map((s, i) => (
              <motion.div key={s.n} {...reveal(0.05 * i)} className="surface-card p-8">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft text-sage">
                    {s.icon}
                  </span>
                  <span className="font-serif text-sm text-muted-foreground">{s.n}</span>
                </div>
                <h3 className="display-3 mt-6">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-band-light">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:py-28">
          <motion.div {...reveal(0)}>
            <p className="eyebrow text-muted-foreground">Our mission</p>
            <h2 className="display-2 mt-3">
              Built for the chapters that <em className="italic text-sage">don&apos;t have an easy ending.</em>
            </h2>
          </motion.div>
          <motion.div {...reveal(0.1)} className="text-base leading-relaxed text-muted-foreground">
            <p>
              Grief. Recovery. Burnout. The slow unraveling after a relationship ends. The hours
              of caregiving no one sees. The long quiet between who you were and who you&apos;re
              becoming.
            </p>
            <p className="mt-4">
              You don&apos;t need another app trying to fix you. You need a person who&apos;s been
              there — and a place that holds space for both of you. That&apos;s what Seen is.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="mission" className="landing-band-sage landing-section-equal">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div {...reveal(0)}>
              <p className="eyebrow">Emotional safety</p>
              <h2 className="display-2 mt-3">
                A layer of care you&apos;ll rarely see — and always be held by.
              </h2>
              <p className="mt-4 text-muted-foreground">
                We blend trained moderators, gentle AI distress detection, and one-tap crisis
                resources. The aim isn&apos;t surveillance — it&apos;s making sure no one is ever alone
                in a hard moment.
              </p>
            </motion.div>
            <motion.div {...reveal(0.1)} className="surface-card p-8">
              <ul className="divide-y divide-border/60">
                {[
                  [
                    "Region-aware crisis resources",
                    "Hotlines and warmlines surface instantly, based on where you are.",
                  ],
                  [
                    "Compassionate AI nudges",
                    "If a conversation drifts toward harm, we gently offer support — never alarm.",
                  ],
                  [
                    "Trained human moderators",
                    "Reports reviewed by people, not just algorithms, within hours.",
                  ],
                  [
                    "Boundaries that travel",
                    "Block, mute, or pause any conversation with one tap.",
                  ],
                ].map(([title, description]) => (
                  <li key={title} className="flex gap-4 py-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="landing-band-light">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.p {...reveal(0)} className="eyebrow text-muted-foreground">
            From people on Seen
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3 max-w-2xl">
            Small moments of being understood.
          </motion.h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.figure key={t.name} {...reveal(0.05 * i)} className="surface-card p-8">
                <blockquote className="font-serif text-lg italic leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.name}</span> · {t.context}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-band-sage">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center md:py-32">
          <motion.p {...reveal(0)} className="eyebrow">
            Privacy by design
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3">
            Only your first name. Only your story. <em className="italic">Never sold.</em>
          </motion.h2>
          <motion.p {...reveal(0.1)} className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Conversations are end-to-end encrypted. We don&apos;t sell data, run ads, or share what
            you share with anyone outside our trained safety team.
          </motion.p>
        </div>
      </section>

      <section id="faq" className="landing-band-light">
        <div className="mx-auto max-w-3xl px-6 py-28 md:py-32">
          <motion.p {...reveal(0)} className="eyebrow text-muted-foreground">
            Frequently asked
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3">
            Questions, gently answered.
          </motion.h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-b border-border/70">
                <AccordionTrigger className="py-5 text-left font-serif text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="partner" className="landing-band-sage landing-section-equal">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <motion.p {...reveal(0)} className="eyebrow text-center">
            Partner with us
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="display-2 mt-3 text-center">
            Organizations walking this path with us.
          </motion.h2>
          <motion.p {...reveal(0.1)} className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Seen grows through trusted partners who share our belief in quiet, human-centered
            support.
          </motion.p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                {...reveal(0.05 * (i + 2))}
                className="surface-card flex flex-col p-8"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft font-serif text-lg text-sage">
                  {partner.initial}
                </span>
                <h3 className="mt-5 font-serif text-xl">{partner.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection reveal={reveal} />

      <SiteFooter />
    </div>
  );
}

function ContactSection({ reveal }: { reveal: ReturnType<typeof useScrollReveal> }) {
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !description.trim()) return;
    setSent(true);
  };

  return (
    <section id="contact" className="landing-band-light landing-section-equal">
      <div className="mx-auto max-w-2xl px-6 py-28 md:py-32">
        <motion.p {...reveal(0)} className="eyebrow text-center text-muted-foreground">
          Contact us
        </motion.p>
        <motion.h2 {...reveal(0.05)} className="display-2 mt-3 text-center">
          We&apos;d love to hear from you.
        </motion.h2>
        <motion.p {...reveal(0.1)} className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
          Whether it&apos;s a question, feedback, or just saying hello — send us a note and
          we&apos;ll get back to you gently.
        </motion.p>

        <motion.div {...reveal(0.15)} className="mt-12">
          {sent ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage-soft">
                <Send className="h-5 w-5 text-sage" />
              </div>
              <h3 className="mt-4 font-serif text-xl">Message sent</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for reaching out. We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="surface-card space-y-6 p-8 md:p-10">
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field-soft w-full bg-background"
                />
              </div>
              <div>
                <label htmlFor="contact-description" className="mb-1.5 block text-sm font-medium">
                  How can we help?
                </label>
                <textarea
                  id="contact-description"
                  placeholder="Tell us what's on your mind..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="field-soft w-full resize-none bg-background"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                <Send className="h-4 w-4" />
                Send message
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
