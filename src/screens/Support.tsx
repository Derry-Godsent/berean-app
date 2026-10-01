import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Heart, Languages, Mail, Share2, Smartphone, Users } from "lucide-react";
import { Mark, EASE } from "../berean/ui";
import { Lamp } from "../berean/Lamp";
import {
  contactEmail,
  founderNote,
  giveChannels,
  iosGivingHidden,
  milestoneProgress,
  milestones,
  raisedUsd,
} from "../app/funding";

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-fraunces text-2xl font-semibold text-parchment">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Meter({ raised }: { raised: number }) {
  const p = milestoneProgress(raised);
  const pct = Math.round(Math.min(1, Math.max(0, p.fraction)) * 100);
  return (
    <div>
      <p className="font-newsreader text-[15px] text-parchment">
        <span className="text-2xl font-semibold">{usd(raised)}</span> given so far
      </p>
      {p.done ? (
        <p className="mt-2 font-newsreader text-[15px] text-mist">Every step below is covered. Thank you.</p>
      ) : (
        <>
          <p className="mt-3 font-newsreader text-[15px] text-mist">
            Next: <span className="text-parchment">{p.current.label}</span>, {usd(Math.ceil(p.remaining))} to go
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-night3"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * "Keep the lamp lit" — the page where anyone in the world can support Berean.
 * It is used inside the app and, unchanged, at the public address `#/support`,
 * which is the link to share on WhatsApp, social media and from church pulpits.
 */
export default function Support() {
  const channels = giveChannels();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/support`;
    const text = "Berean turns the Bible into a series you can actually keep up with. Help keep it free:";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Berean", text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the person dismissed the share sheet */
    }
  };

  return (
    <div className="mx-auto max-w-2xl pb-6">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE, duration: 0.5 }}>
        <Mark className="h-8 w-8 text-gold" />
        {/* The lamp itself, at the top of its own page: large, lit, and to the
            left so its glow falls into the page instead of off the edge. */}
        <div className="mt-5 flex items-center gap-4">
          <Lamp size={56} glow={2.3} strokeWidth={1.4} />
          <h1 className="font-fraunces text-[34px] font-semibold leading-[1.05] text-parchment sm:text-[40px]">
            Keep the lamp lit
          </h1>
        </div>
        <p className="mt-4 font-newsreader text-[19px] leading-relaxed text-parchment/90">
          Berean is built and looked after by one person. The aim is simple: get more people into the Bible, and keep
          them coming back.
        </p>
        <p className="mt-3 font-newsreader text-[17px] leading-relaxed text-mist">
          Reading Scripture here is free. Nothing you give unlocks a feature or buys you anything. It buys time, servers
          and the store fees that let one person keep this going.
        </p>
      </motion.header>

      {raisedUsd !== undefined && (
        <div className="mt-8 rounded-2xl border border-line bg-night2 p-5">
          <Meter raised={raisedUsd} />
        </div>
      )}

      {founderNote.approved && (
        <Section title={founderNote.title}>
          <div className="space-y-3 font-newsreader text-[17px] leading-relaxed text-parchment/90">
            {founderNote.paragraphs.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {founderNote.signature && <p className="text-mist">{founderNote.signature}</p>}
          </div>
        </Section>
      )}

      <Section title="Ways to give">
        {iosGivingHidden() ? (
          <p className="rounded-2xl border border-line bg-night2 p-5 font-newsreader text-[16px] leading-relaxed text-mist">
            Thank you for wanting to help. Giving from inside an iPhone app is being set up through the App Store. In the
            meantime, the most useful thing you can do is share it with one person who has stopped reading.
          </p>
        ) : channels.length > 0 ? (
          <div className="space-y-3">
            {channels.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-line bg-night2 p-5 transition-colors hover:border-gold/60"
              >
                <Heart className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <span className="min-w-0 flex-1">
                  <span className="block font-fraunces text-xl font-semibold text-parchment">{c.label}</span>
                  <span className="mt-1 block font-newsreader text-[15px] leading-relaxed text-mist">{c.blurb}</span>
                </span>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-mist group-hover:text-gold" />
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-5">
            <p className="font-newsreader text-[16px] leading-relaxed text-mist">
              Giving is opening soon. If you would like to be told the day it does, leave it with us
              {contactEmail ? "" : " — and in the meantime, the other ways to help below matter just as much."}
            </p>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}?subject=Tell%20me%20when%20I%20can%20support%20Berean`}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-newsreader text-[15px] font-semibold text-night"
              >
                <Mail className="h-4 w-4" /> Email me when it opens
              </a>
            )}
          </div>
        )}
        <p className="mt-4 font-newsreader text-[14px] leading-relaxed text-mist">
          Gifts are voluntary and go to the developer of Berean to run and grow the app. They are personal gifts, not
          tax-deductible charitable donations. You can give once or monthly and stop at any time.
        </p>
      </Section>

      <Section title="Where it goes">
        <p className="mb-3 font-newsreader text-[15px] leading-relaxed text-mist">
          Berean costs almost nothing to run today. Gifts pay for the next steps, in this order:
        </p>
        <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-night2">
          {milestones.map((m) => {
            const reached = raisedUsd !== undefined && raisedUsd >= m.cumulativeUsd;
            return (
              <li key={m.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-newsreader text-[16px] text-parchment">
                    {reached && <Check className="h-4 w-4 text-sage" />}
                    {m.label}
                  </p>
                  <p className="font-newsreader text-[13px] text-mist">{m.why}</p>
                </div>
                <p className="shrink-0 font-mono text-sm tabular-nums text-parchment">
                  {m.estimate ? "about " : ""}
                  {usd(m.usd)}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 font-newsreader text-[14px] leading-relaxed text-mist">
          Prices are estimates from published 2026 price lists and can change. Anything beyond these steps goes to more
          seasons and more time to build.
        </p>
      </Section>

      <Section title="Can’t give money? This helps just as much">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { Icon: Share2, h: "Tell one person", d: "The reader who stopped opening their Bible is exactly who Berean is for." },
            { Icon: Users, h: "Bring your church", d: "Pastors: the sermon workspace and group tools are built for you. Ask us for early access." },
            { Icon: Smartphone, h: "Try it and tell me", d: "Install it on your phone, use it for a week, and tell me what got in your way." },
            { Icon: Languages, h: "Help translate", d: "Berean should read in Twi, Yoruba, Swahili, Spanish and more. Tell us your language." },
          ].map(({ Icon, h, d }) => (
            <li key={h} className="rounded-2xl border border-line bg-night2 p-4">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-2 font-fraunces text-lg font-semibold text-parchment">{h}</p>
              <p className="mt-1 font-newsreader text-[15px] leading-relaxed text-mist">{d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-2.5 font-newsreader text-[15px] font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Share this page"}
          </button>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-newsreader text-[15px] text-parchment transition-colors hover:border-gold/50"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          )}
        </div>
      </Section>

      <p className="mt-10 border-t border-line pt-6 text-center font-newsreader text-[15px] italic text-mist">
        “Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105
      </p>
    </div>
  );
}

/** The public, shareable page at `#/support` — works with no account and no app state. */
export function SupportPage() {
  const skin = (() => {
    try {
      return localStorage.getItem("berean:skin") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  })();
  return (
    <div className={`berean-app theme-${skin} min-h-svh bg-night px-5 py-10 text-parchment sm:py-16`}>
      <a href="#/" className="mx-auto mb-8 block max-w-2xl font-newsreader text-[15px] text-mist hover:text-gold">
        ← Back to Berean
      </a>
      <Support />
    </div>
  );
}
