"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Fingerprint,
  Ghost,
  X,
  Loader2,
  Plus,
  Sparkles,
  Search,
  CloudRain,
  Clock3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  UserRound,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type InnerQuestion = {
  id: number;
  question: string;
  username: string | null;
  is_anonymous: boolean | null;
  for_who?: string | null;
  created_at?: string | null;
};

type FilterMode = "all" | "anonymous" | "named";
type SortMode = "default" | "latest" | "oldest";

const COLLAPSE_SIZE = 6;
const FOOTER_TEXT =
  "everyone went home early because of the dark sky. i am still sitting here by myself.";

export default function UnsentNotesPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<InnerQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<InnerQuestion | null>(null);

  const [openThought, setOpenThought] = useState(false);

  const [thoughtStatus, setThoughtStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [thought, setThought] = useState("");
  const [thoughtForWho, setThoughtForWho] = useState("");
  const [thoughtIdentity, setThoughtIdentity] = useState({
    username: "",
    is_anonymous: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);

  const [rainDrops, setRainDrops] = useState<
    { left: string; delay: string; duration: string }[]
  >([]);

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const filteredQuestions = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = questions.filter((question) => {
      const owner = question.is_anonymous === false ? "named" : "anonymous";

      const matchesSearch =
        !keyword ||
        question.question.toLowerCase().includes(keyword) ||
        (question.username || "").toLowerCase().includes(keyword) ||
        (question.for_who || "").toLowerCase().includes(keyword);

      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "anonymous" && owner === "anonymous") ||
        (filterMode === "named" && owner === "named");

      return matchesSearch && matchesFilter;
    });

    const sorted = [...filtered];

    if (sortMode === "default" || sortMode === "latest") {
      sorted.sort((a, b) => {
        const bTime = Date.parse(b.created_at || "") || b.id || 0;
        const aTime = Date.parse(a.created_at || "") || a.id || 0;
        return bTime - aTime;
      });
    }

    if (sortMode === "oldest") {
      sorted.sort((a, b) => {
        const aTime = Date.parse(a.created_at || "") || a.id || 0;
        const bTime = Date.parse(b.created_at || "") || b.id || 0;
        return aTime - bTime;
      });
    }

    return sorted;
  }, [questions, searchTerm, filterMode, sortMode]);

  const visibleQuestions = useMemo(
    () => filteredQuestions.slice(0, visibleCount),
    [filteredQuestions, visibleCount]
  );

  const hasMoreQuestions = visibleCount < filteredQuestions.length;
  const isExpanded =
    filteredQuestions.length > 0 && visibleCount >= filteredQuestions.length;

  const resetCollapse = () => {
    setVisibleCount(COLLAPSE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetCollapse();
  };

  const cycleFilterMode = () => {
    setFilterMode((current) => {
      if (current === "all") return "anonymous";
      if (current === "anonymous") return "named";
      return "all";
    });

    resetCollapse();
  };

  const cycleDateSort = () => {
    setSortMode((current) => {
      if (current === "latest") return "oldest";
      if (current === "oldest") return "default";
      return "latest";
    });

    resetCollapse();
  };

  const showMoreQuestions = () => {
    setVisibleCount((prev) =>
      Math.min(prev + COLLAPSE_SIZE, filteredQuestions.length)
    );
  };

  const collapseQuestions = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("fragment-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fetchData = useCallback(async () => {
    const { data: qData, error } = await supabase
      .from("inner_questions")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setQuestions(qData || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openQuestion = (question: InnerQuestion) => {
    setSelectedQuestion(question);
  };

  const submitThought = async () => {
    if (!thought.trim() || thoughtStatus === "submitting") return;

    setThoughtStatus("submitting");

    const { error } = await supabase.from("inner_questions").insert([
      {
        question: thought.trim(),
        for_who: thoughtForWho.trim() || null,
        username: thoughtIdentity.is_anonymous
          ? null
          : thoughtIdentity.username || null,
        is_anonymous: thoughtIdentity.is_anonymous,
      },
    ]);

    if (error) {
      console.error(error);
      setThoughtStatus("error");
      setTimeout(() => setThoughtStatus("idle"), 2000);
      return;
    }

    setThoughtStatus("success");
    setThought("");
    setThoughtForWho("");
    setThoughtIdentity({ username: "", is_anonymous: true });
    await fetchData();
    resetCollapse();

    setTimeout(() => {
      setOpenThought(false);
      setThoughtStatus("idle");
    }, 900);
  };

  const filterIcon =
    filterMode === "anonymous" ? (
      <Ghost size={11} />
    ) : filterMode === "named" ? (
      <UserRound size={11} />
    ) : (
      <SlidersHorizontal size={11} />
    );

  const filterLabel =
    filterMode === "anonymous"
      ? "anonymous"
      : filterMode === "named"
      ? "named"
      : "all";

  return (
    <main
      id="inner-main"
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
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

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80"
          >
            <ArrowLeft
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:-translate-x-1"
            />
            leave
          </button>

          <div className="flex min-w-0 flex-col items-center text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/80 sm:text-[11px]">
              strange clause
            </p>
            <p className="hidden max-w-[300px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] md:block">
              unsent notes
            </p>
          </div>

          <button
            onClick={() => setOpenThought(true)}
            className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            add note
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fadeIn mb-14 max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
              foggy windows
            </p>
          </div>

          <h1 className="text-[26px] font-light leading-[1.1] tracking-[-0.05em] text-white/90 sm:text-[34px] md:text-[42px]">
            small things i thought about saying, <br />
            but forgot to write down.
          </h1>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} className="stroke-[1.5px]" />
              <span>no one is around anymore.</span>
            </div>
          </div>
        </header>

        <section id="fragment-list" className="scroll-mt-36">
          <ShelfHeader
            title="NOTES SHELF"
            count={`${filteredQuestions.length} shown · ${questions.length} stored`}
          />

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(2,auto)]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search
                size={12}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]"
              />
              <input
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="type a word to find something..."
                className="w-full rounded-full border border-white/[0.045] bg-white/[0.016] py-3 pl-10 pr-4 text-[11px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />
            </div>

            <FilterButton
              active={filterMode !== "all"}
              icon={filterIcon}
              label={filterLabel}
              onClick={cycleFilterMode}
            />

            <FilterButton
              active={sortMode === "latest" || sortMode === "oldest"}
              icon={<Clock3 size={11} />}
              label={
                sortMode === "latest"
                  ? "latest"
                  : sortMode === "oldest"
                  ? "oldest"
                  : "date"
              }
              onClick={cycleDateSort}
            />
          </div>

          {filteredQuestions.length === 0 ? (
            <EmptyFragments />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {visibleQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => openQuestion(q)}
                    className="sticky-note group relative aspect-square w-full overflow-hidden rounded-[1.35rem] border border-white/[0.05] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:rotate-0 hover:border-white/12 hover:bg-white/[0.035] sm:p-4"
                    style={{
                      transform: `rotate(${idx % 2 === 0 ? "-0.8deg" : "0.8deg"})`,
                    }}
                  >
                    <div className="pointer-events-none absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/[0.045]" />
                    <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="flex h-full flex-col justify-between gap-2">
                      <div className="min-h-0">
                        <div className="mb-3 flex items-start justify-between gap-2 text-[#666666] transition-colors duration-700 group-hover:text-[#9a9a9a]">
                          <span className="shrink-0 text-[6.5px] uppercase tracking-[0.18em] sm:text-[7px]">
                            note {String(idx + 1).padStart(2, "0")}
                          </span>

                          <span className="line-clamp-1 text-right text-[6.5px] uppercase tracking-[0.16em] sm:text-[7px]">
                            {q.for_who ? `for ${q.for_who}` : "unsent"}
                          </span>
                        </div>

                        <h3 className="line-clamp-5 text-[10.5px] font-light leading-relaxed text-[#d6d6d6] transition-colors duration-700 group-hover:text-white/90 sm:text-[11.5px]">
                          {q.question}
                        </h3>
                      </div>

                      <div className="border-t border-white/[0.045] pt-2">
                        <p className="line-clamp-1 text-[8.5px] italic text-[#777777] transition-colors duration-700 group-hover:text-[#d8d8d8] sm:text-[9px]">
                          {q.for_who
                            ? `left for ${q.for_who}`
                            : "left without a name"}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2 text-[6.5px] uppercase tracking-[0.16em] text-[#666666] sm:text-[7px]">
                          <span className="line-clamp-1">
                            {q.is_anonymous === false
                              ? q.username || "someone"
                              : "anonymous"}
                          </span>

                          <span className="h-1 w-1 shrink-0 rounded-full bg-white/20" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredQuestions.length > COLLAPSE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMoreQuestions && (
                    <button
                      type="button"
                      onClick={showMoreQuestions}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      show more
                      <ChevronDown
                        size={11}
                        className="transition-transform duration-700 group-hover:translate-y-0.5"
                      />
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      type="button"
                      onClick={collapseQuestions}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      fold again
                      <ChevronUp
                        size={11}
                        className="transition-transform duration-700 group-hover:-translate-y-0.5"
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {openThought && (
        <div
          onClick={() => setOpenThought(false)}
          className="animate-fadeIn fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setOpenThought(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3">
                  <Fingerprint
                    size={12}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                add note
              </h2>

              <p className="mt-2 text-[11px] leading-relaxed text-[#777777]">
                put down something small so it stays here after you close the tab.
              </p>
            </div>

            <input
              value={thoughtForWho}
              onChange={(e) => setThoughtForWho(e.target.value)}
              placeholder="this note is for..."
              className="mb-4 w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
            />

            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="something you almost said..."
              className="h-32 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] font-light leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
            />

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-4">
              <button
                type="button"
                onClick={() =>
                  setThoughtIdentity((prev) => ({
                    ...prev,
                    is_anonymous: !prev.is_anonymous,
                  }))
                }
                className="flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] transition-colors duration-700 hover:text-white"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full border border-white/[0.18] transition-all duration-700 ${
                    thoughtIdentity.is_anonymous
                      ? "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                      : ""
                  }`}
                />

                anonymous
              </button>

              {!thoughtIdentity.is_anonymous && (
                <input
                  value={thoughtIdentity.username}
                  onChange={(e) =>
                    setThoughtIdentity({
                      ...thoughtIdentity,
                      username: e.target.value,
                    })
                  }
                  placeholder="your name"
                  className="ml-auto w-32 border-0 border-b border-b-white/[0.08] bg-transparent px-0 py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-right placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#666666] focus:border-white/20 focus:ring-0"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-4">
              <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                quiet draft
              </p>

              <button
                disabled={thoughtStatus === "submitting" || !thought.trim()}
                onClick={submitThought}
                className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:opacity-20"
              >
                {thoughtStatus === "submitting" ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : thoughtStatus === "success" ? (
                  "saved"
                ) : (
                  "release"
                )}
                <Send
                  size={10}
                  className="transition-transform duration-700 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedQuestion && (
        <div
          onClick={() => setSelectedQuestion(null)}
          className="animate-fadeIn fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/[0.06] bg-[#070707]/95 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
          >
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute right-5 top-5 z-30 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="border-b border-white/[0.055] bg-white/[0.025] p-5 sm:p-6">
              <span className="mb-2 block text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                opened note ·{" "}
                {selectedQuestion.is_anonymous === false
                  ? selectedQuestion.username || "someone"
                  : "anonymous"}
              </span>

              <h2 className="text-[12.5px] font-light leading-relaxed text-white/90 sm:text-[13px]">
                {selectedQuestion.question}
              </h2>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <p className="mb-2 text-[8px] uppercase tracking-[0.18em] text-[#777777]">
                  this note is for
                </p>
                <p className="text-[12px] leading-relaxed text-[#d6d6d6]">
                  {selectedQuestion.for_who || "someone without a name"}
                </p>
              </div>

              <p className="text-[9px] uppercase tracking-[0.18em] text-[#666666]">
                this room only keeps notes. replies are closed.
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          {FOOTER_TEXT}
        </p>
      </footer>

      <style jsx global>{`
        html,
        body {
          scroll-behavior: smooth;
          background: #020202;
          scrollbar-color: rgba(255, 255, 255, 0.14)
            rgba(255, 255, 255, 0.025);
          scrollbar-width: thin;
        }

        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        body::-webkit-scrollbar-track,
        html::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
        }

        body::-webkit-scrollbar-thumb,
        html::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #020202;
        }

        body::-webkit-scrollbar-thumb:hover,
        html::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .rain-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .drop {
          width: 1px;
          height: 65px;
          animation: rainAnimation linear infinite;
        }

        @keyframes rainAnimation {
          0% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(105vh);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

        .line-clamp-1,
        .line-clamp-4,
        .line-clamp-5 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-1 {
          -webkit-line-clamp: 1;
        }

        .line-clamp-4 {
          -webkit-line-clamp: 4;
        }

        .line-clamp-5 {
          -webkit-line-clamp: 5;
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

        .scrollbar-hide::-webkit-scrollbar {
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

const FilterButton = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-[8px] uppercase tracking-[0.18em] transition-all duration-500 sm:w-auto ${
      active
        ? "border-white/15 bg-white/[0.07] text-white"
        : "border-white/[0.045] bg-white/[0.016] text-[#777777] hover:border-white/10 hover:text-white/75"
    }`}
  >
    {icon}
    {label}
  </button>
);

const ShelfHeader = ({
  title,
  count,
}: {
  title: string;
  count: string;
}) => (
  <div className="mb-6 flex flex-col gap-2 border-b border-white/[0.045] pb-3 sm:flex-row sm:items-end sm:justify-between">
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

const EmptyFragments = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] py-20 text-[#666666]">
    <Fingerprint size={16} strokeWidth={1.5} className="mb-3 opacity-60" />
    <p className="text-[8px] uppercase tracking-[0.22em]">
      nothing is here right now
    </p>
  </div>
);
