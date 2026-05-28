"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCcw,
  Send,
  ShieldQuestion,
  CloudRain,
  Ghost,
  Mail,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const RESPONSES = [
  "i kept it safe. it does not have to explain itself.",
  "your words are resting here. nothing is chasing them.",
  "i heard you, even if the room stayed quiet.",
  "thank you for leaving this gently.",
  "you can step away from the light now. it still remembers you.",
  "some sentences arrive shaking. this one still made it through.",
];

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

export default function SaySomething() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const noteCount = useMemo(() => message.trim().length, [message]);

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from("void_messages")
        .insert([{ message: trimmed }]);

      if (error) throw error;

      setResponseText(RESPONSES[Math.floor(Math.random() * RESPONSES.length)]);
      setMessage("");
      setIsSent(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.028),transparent_42%),radial-gradient(circle_at_8%_42%,rgba(255,255,255,0.018),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(255,255,255,0.014),transparent_32%),linear-gradient(180deg,#020202_0%,#050505_46%,#020202_100%)]" />

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.48)_0%,transparent_18%,transparent_82%,rgba(0,0,0,0.48)_100%)]" />

      <div className="rain-container pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-[0.22]">
        {rainDrops.map((drop, index) => (
          <div
            key={index}
            className="drop absolute bg-gradient-to-b from-transparent to-white/30"
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none fixed left-[10%] top-0 z-[2] h-px w-[28%] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none fixed bottom-0 right-[12%] z-[2] h-px w-[24%] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex shrink-0 items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 sm:text-[9px]"
          >
            <ArrowLeft
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:-translate-x-1"
            />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group flex min-w-0 flex-col items-center text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>

            <span className="hidden max-w-[300px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              don’t forget to bring an umbrella
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:px-4 sm:text-[8.5px]">
            <Mail size={11} strokeWidth={1.5} />
            note
          </div>
        </div>
      </nav>

      <section className="relative z-20 mx-auto flex min-h-screen max-w-[1500px] items-center px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        {!isSent ? (
          <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8 xl:gap-10">
            <aside className="group h-fit rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026] sm:p-6 lg:max-w-[430px]">
              <div className="pointer-events-none mx-auto mb-5 h-px w-[72%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              <div className="mb-5 flex items-center gap-2">
                <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                  quiet mailbox
                </p>
              </div>

              <h1 className="text-[24px] font-light leading-[1.12] tracking-[-0.05em] text-white/90 sm:text-[31px] md:text-[36px]">
                write it down,
                <br />
                then let it rest.
              </h1>

              <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed text-[#888888]">
                Leave a small message inside the rain. It does not need to be
                brave, polished, or easy to understand.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.045] pt-5">
                {["anonymous", "softly saved", "no answer needed"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 text-[11px] italic text-[#777777]">
                <Ghost size={12} strokeWidth={1.5} />
                <span>the note can stay even after you leave.</span>
              </div>
            </aside>

            <div className="flex w-full items-center">
              <div className="group relative w-full overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026] sm:p-6 md:p-7">
                <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.045] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldQuestion
                      size={12}
                      strokeWidth={1.5}
                      className="text-[#666666]"
                    />
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#666666] transition-colors duration-700 group-hover:text-white/80">
                      unseen letter
                    </p>
                  </div>

                  <p className="text-[7px] uppercase tracking-[0.2em] text-[#555555]">
                    {noteCount} characters
                  </p>
                </div>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="say what you need to say..."
                  className="scrollbar-hide h-[170px] w-full resize-none bg-transparent text-[12.5px] leading-relaxed tracking-wide text-[#999999] outline-none placeholder:text-[#4f4f4f] transition-colors duration-700 focus:text-white/90 sm:h-[190px] md:h-[210px]"
                />

                <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.045] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#555555]">
                    saved quietly
                  </p>

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="group/btn inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-5 py-2.5 text-[8.5px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    {isSending ? "sending..." : "release"}
                    <Send
                      size={10}
                      strokeWidth={1.5}
                      className="transition-transform duration-700 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-reveal mx-auto w-full max-w-md px-1 sm:px-2">
            <div className="group relative overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] px-5 py-10 text-center shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026] sm:px-7">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              <Sparkles
                size={14}
                strokeWidth={1.5}
                className="mx-auto mb-4 text-[#777777]"
              />

              <p className="mb-5 text-[8px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 group-hover:text-white/80">
                a trace returned
              </p>

              <p className="mx-auto max-w-xs text-[12.5px] italic leading-relaxed text-white/80 sm:text-[13px]">
                “{responseText}”
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/[0.045] pt-5">
                <button
                  onClick={() => router.push("/")}
                  className="group/back flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-[#666666] transition-colors duration-700 hover:text-white/80"
                >
                  <ArrowLeft
                    size={11}
                    strokeWidth={1.5}
                    className="transition-transform duration-700 ease-out group-hover/back:-translate-x-0.5"
                  />
                  return to the entrance
                </button>

                <button
                  onClick={() => setIsSent(false)}
                  className="group/reset flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-[#444444] transition-colors duration-700 hover:text-[#888888]"
                >
                  <RefreshCcw
                    size={10}
                    strokeWidth={1.5}
                    className="transition-transform duration-700 ease-out group-hover/reset:rotate-180"
                  />
                  write another note
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          the note can stay here. you do not have to stand beside it.
        </p>
      </footer>

      <style jsx global>{`
        html,
        body {
          scroll-behavior: smooth;
          background: #020202;
        }

        .rain-container {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .drop {
          width: 1px;
          height: 65px;
          animation: rain linear infinite;
        }

        @keyframes rain {
          0% {
            transform: translateY(-100px);
          }

          100% {
            transform: translateY(105vh);
          }
        }

        .animate-reveal {
          animation: reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .scrollbar-hide::-webkit-scrollbar,
        textarea::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}