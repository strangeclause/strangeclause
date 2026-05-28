"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Inter } from "next/font/google";
import {
  ArrowLeft,
  Trash2,
  PenLine,
  Ghost,
  Sparkles,
  Loader2,
  Plus,
  X,
  CloudRain,
} from "lucide-react";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Question = {
  id: number;
  question: string;
  created_at: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

export default function InnerAdminPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const footerLines = useMemo(
    () => [
      "some words only survive in low light.",
      "the page listened better than the room.",
      "not every question wants an answer.",
      "some fragments should stay unfinished.",
      "the quiet keeps a copy.",
    ],
    []
  );

  const footerText = useMemo(
    () => footerLines[Math.floor(Math.random() * footerLines.length)],
    [footerLines]
  );

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("inner_questions")
      .select("*")
      .order("id", { ascending: false });

    setQuestions(data || []);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const submitQuestion = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    const { error } = await supabase.from("inner_questions").insert({
      question: input.trim(),
    });

    if (!error) {
      setInput("");
      setOpenAdd(false);
      fetchQuestions();
    }

    setLoading(false);
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Delete this question?")) return;

    await supabase.from("inner_questions").delete().eq("id", id);
    fetchQuestions();
  };

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/admin")}
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

            <span className="hidden max-w-[310px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              unsent notes
            </span>
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            add
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / inner notes
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              write the questions
              <br />
              that linger.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>silence always asks the best questions.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <PenLine size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {questions.length} notes saved
            </p>
          </aside>
        </header>

        <section>
          <ShelfHeader
            title="SAVED NOTES"
            count={`${questions.length} saved`}
          />

          {questions.length === 0 ? (
            <EmptyQuestions />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="sticky-note group relative aspect-square overflow-hidden rounded-[1.35rem] border border-white/[0.05] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:rotate-0 hover:border-white/12 hover:bg-white/[0.035] sm:p-4"
                  style={{
                    transform: `rotate(${i % 2 === 0 ? "-0.7deg" : "0.7deg"})`,
                  }}
                >
                  <div className="pointer-events-none absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/[0.045]" />
                  <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  <div className="flex h-full flex-col justify-between gap-3">
                    <div className="min-h-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="block text-[6.5px] uppercase tracking-[0.18em] text-[#666666] transition-colors duration-700 group-hover:text-[#9a9a9a] sm:text-[7px]">
                          note {String(questions.length - i).padStart(2, "0")}
                        </span>

                        <span className="shrink-0 text-[6.5px] uppercase tracking-[0.16em] text-[#555555] sm:text-[7px]">
                          {new Date(q.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="line-clamp-6 text-[10.5px] font-light leading-relaxed text-[#d6d6d6] transition-colors duration-700 group-hover:text-white/90 sm:text-[11.5px]">
                        “{q.question}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.045] pt-2">
                      <span className="text-[6.5px] uppercase tracking-[0.16em] text-[#666666] sm:text-[7px]">
                        quiet prompt
                      </span>

                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="rounded-full border border-white/[0.045] bg-white/[0.016] p-1.5 text-[#777777] opacity-100 transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={10} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {openAdd && (
        <div
          onClick={() => !loading && setOpenAdd(false)}
          className="animate-modal fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setOpenAdd(false)}
              disabled={loading}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white disabled:opacity-30"
            >
              <X size={14} />
            </button>

            <div className="mb-6">
              <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                new prompt
              </p>

              <h2 className="text-[14px] font-light uppercase tracking-[0.2em] text-white/90 sm:text-[15px]">
                write a question
              </h2>

              <p className="mt-2 text-[11.5px] leading-relaxed text-[#777777]">
                Put one quiet question here. It will appear for people to answer
                softly.
              </p>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="what question should haunt this page?"
              maxLength={180}
              className="scrollbar-hide h-36 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] font-light leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
            />

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-4">
              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                  trace volatile
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-[#555555]">
                  {input.length}/180
                </p>
              </div>

              <button
                onClick={submitQuestion}
                disabled={loading || !input.trim()}
                className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:opacity-20"
              >
                {loading ? (
                  <Loader2 size={10} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Sparkles
                    size={10}
                    strokeWidth={1.5}
                    className="transition-transform duration-700 group-hover:rotate-12"
                  />
                )}
                {loading ? "saving" : "release"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-14 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          {footerText}
        </p>
      </footer>

      <GlobalStyles />
    </main>
  );
}

const Background = ({ rainDrops }: { rainDrops: RainDrop[] }) => (
  <>
    <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.028),transparent_42%),radial-gradient(circle_at_8%_42%,rgba(255,255,255,0.018),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(255,255,255,0.014),transparent_32%),linear-gradient(180deg,#020202_0%,#050505_46%,#020202_100%)]" />

    <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.48)_0%,transparent_18%,transparent_82%,rgba(0,0,0,0.48)_100%)]" />

    <div className="rain-container pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-[0.22]">
      {rainDrops.map((drop, i) => (
        <div
          key={i}
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
  </>
);

const ShelfHeader = ({
  title,
  count,
}: {
  title: string;
  count: string;
}) => (
  <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/[0.045] pb-3">
    <div className="flex items-center gap-2">
      <Sparkles size={12} className="text-[#777777] stroke-[1.5px]" />

      <h2 className="text-[12px] font-light tracking-wide text-white/80">
        {title}
      </h2>
    </div>

    <p className="text-[7px] uppercase tracking-[0.2em] text-[#666666]">
      {count}
    </p>
  </div>
);

const EmptyQuestions = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
    <Ghost size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

    <p className="text-[8px] uppercase tracking-[0.22em]">empty hallways</p>
  </div>
);

const GlobalStyles = () => (
  <style jsx global>{`
    html,
    body {
      scroll-behavior: smooth;
      background: #020202;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }

    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: linear-gradient(
        180deg,
        rgba(7, 7, 7, 0.96),
        rgba(2, 2, 2, 1)
      );
    }

    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16),
        rgba(255, 255, 255, 0.07)
      );
      border: 2px solid #020202;
      box-shadow:
        0 0 12px rgba(255, 255, 255, 0.045),
        inset 0 0 8px rgba(255, 255, 255, 0.03);
    }

    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.26),
        rgba(255, 255, 255, 0.12)
      );
      box-shadow:
        0 0 16px rgba(255, 255, 255, 0.07),
        inset 0 0 10px rgba(255, 255, 255, 0.05);
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

    @keyframes fadeIn {
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

    @keyframes modalFade {
      from {
        opacity: 0;
        transform: scale(0.98) translateY(10px);
        filter: blur(8px);
      }

      to {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: blur(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-modal {
      animation: modalFade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .scrollbar-hide::-webkit-scrollbar,
    textarea::-webkit-scrollbar {
      display: none;
    }

    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .line-clamp-4,
    .line-clamp-6 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-4 {
      -webkit-line-clamp: 4;
    }

    .line-clamp-6 {
      -webkit-line-clamp: 6;
    }

    .sticky-note:nth-child(3n + 1) {
      background:
        radial-gradient(circle at 18% 12%, rgba(255,255,255,0.045), transparent 32%),
        linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012));
    }

    .sticky-note:nth-child(3n + 2) {
      background:
        radial-gradient(circle at 78% 18%, rgba(255,255,255,0.035), transparent 30%),
        linear-gradient(145deg, rgba(255,255,255,0.028), rgba(255,255,255,0.01));
    }

    .sticky-note:nth-child(3n + 3) {
      background:
        radial-gradient(circle at 45% 0%, rgba(255,255,255,0.04), transparent 34%),
        linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.011));
    }
  `}</style>
);