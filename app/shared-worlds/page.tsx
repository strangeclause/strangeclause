"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  ChevronLeft,
  Ghost,
  X,
  Monitor,
  Cloud,
  Box,
  Server,
  UserRound,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Send,
  MessageCircle,
  Music2,
  Film,
  ExternalLink,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Encounter = {
  id: string;
  title: string;
  name: string;
  image_url?: string;
  description?: string;
  how_i_called_them?: string;
  how_they_called_me?: string;
  first_met?: string;
  first_impression?: string;
  favorite_map?: string;
  common_words?: string;
  personality_bullets?: string[];
  why_i_remember_them?: string;
  short_character_summary?: string;
  matching_song?: string;
  spotify_url?: string;
  movie_character?: string;
  tmdb_url?: string;
  movie_reason?: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const GALLERY_LIMIT = 8;

export default function RobloxEncounterPage() {
  const router = useRouter();

  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selected, setSelected] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [visibleCount, setVisibleCount] = useState(GALLERY_LIMIT);

  const clean = (text?: string) => text?.replace(/[._-]/g, " ") || "";

  const upperClean = (text?: string, fallback = "") =>
    (clean(text) || fallback).toUpperCase();

  const lowerClean = (text?: string, fallback = "") =>
    (clean(text) || fallback).toLowerCase();

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("roblox_encounters")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setEncounters(data || []);
    } catch (error) {
      console.error("Failed to fetch roblox encounters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleEncounters = useMemo(
    () => encounters.slice(0, visibleCount),
    [encounters, visibleCount]
  );

  const hasMore = visibleCount < encounters.length;
  const isExpanded = visibleCount >= encounters.length;

  const showMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + GALLERY_LIMIT, encounters.length)
    );
  };

  const collapseGallery = () => {
    setVisibleCount(GALLERY_LIMIT);

    document
      .getElementById("pixel-encounters")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <LoadingState />;

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex shrink-0 items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 sm:text-[9px]"
          >
            <ChevronLeft
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

            <span className="hidden max-w-[270px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              shared worlds
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <Server size={11} strokeWidth={1.5} />
            archive
          </div>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <section className="animate-fade-in mb-14 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 xl:gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                raining
              </p>
            </div>

            <h1 className="text-[26px] font-light leading-[1.1] tracking-[-0.05em] text-white/90 sm:text-[34px] md:text-[42px]">
              an empty server where we stood still until the screen went dark.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <p>some people leave when the lobby changes.</p>
            </div>
          </div>

          <aside className="lg:mt-2">
            <div className="group relative overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026] sm:p-5">
              <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              <div className="mb-4 flex items-center justify-between border-b border-white/[0.045] pb-3">
                <div className="flex items-center gap-2 text-[#777777]">
                  <Server size={12} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.2em]">
                    shared worlds
                  </p>
                </div>

                <p className="rounded-full border border-white/[0.045] bg-black/45 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#666666] backdrop-blur-sm">
                  {encounters.length} saved
                </p>
              </div>

              <div className="relative min-h-[145px] overflow-hidden rounded-2xl border border-white/[0.045] bg-black/60 p-4 sm:min-h-[160px] sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.055),transparent_45%)]" />
                <div className="pointer-events-none absolute left-[24%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="pointer-events-none absolute right-[25%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                <div className="relative z-10 flex h-full min-h-[115px] flex-col justify-between gap-5">
                  <div className="flex items-center gap-2 text-[#8d8d8d]">
                    <Monitor size={12} strokeWidth={1.5} />
                    <p className="text-[8px] uppercase tracking-[0.22em]">
                      saved lobby
                    </p>
                  </div>

                  <p className="max-w-md text-[16px] font-light leading-snug tracking-[-0.04em] text-white/85 sm:text-[19px]">
                    small conversations that stayed longer than the game itself.
                  </p>

                  <div className="space-y-2">
                    <MiniMessage
                      align="left"
                      text="u still remember this place?"
                    />

                    <MiniMessage
                      align="right"
                      text="yeah. somehow i never left."
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {encounters.length === 0 ? (
          <EmptyServer />
        ) : (
          <section id="pixel-encounters" className="scroll-mt-36">
            <ShelfHeader
              title="FRIENDS"
              count={`${visibleEncounters.length} shown · ${encounters.length} saved`}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {visibleEncounters.map((friend, index) => (
                <button
                  key={friend.id}
                  onClick={() => setSelected(friend)}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] text-left shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                >
                  <div className="pointer-events-none absolute inset-x-5 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  <div className="absolute right-2 top-2 z-30 rounded-full border border-white/[0.055] bg-black/70 px-2 py-1 text-[6.5px] uppercase tracking-[0.16em] text-[#cfcfcf] backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    {friend.image_url ? (
                      <img
                        src={friend.image_url}
                        alt={friend.name}
                        className="h-full w-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:scale-[1.04] group-hover:opacity-92"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/[0.02] text-[#666666]">
                        <Monitor size={18} strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.055] bg-black/82 px-5 py-5 backdrop-blur-md transition-all duration-700 group-hover:bg-black/88 sm:px-6 sm:py-6">
                      <div className="mb-2 flex items-center gap-1.5 text-[6.2px] uppercase tracking-[0.16em] text-[#9d9d9d]">
                        <Box size={9} strokeWidth={1.5} />

                        <span className="truncate">
                          @{upperClean(friend.name, "PLAYER")}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-[11px] font-light uppercase leading-snug tracking-[0.07em] text-white/90 sm:text-[11.5px]">
                        {upperClean(friend.title, "UNTITLED")}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {encounters.length > GALLERY_LIMIT && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {hasMore && (
                  <button
                    type="button"
                    onClick={showMore}
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
                    onClick={collapseGallery}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                  >
                    collapse again
                    <ChevronUp
                      size={11}
                      className="transition-transform duration-700 group-hover:-translate-y-0.5"
                    />
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {selected && (
        <EncounterModal
          selected={selected}
          clean={clean}
          upperClean={upperClean}
          lowerClean={lowerClean}
          onClose={() => setSelected(null)}
        />
      )}

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          some people feel safer from far away.
        </p>
      </footer>

      <GlobalStyles />
    </main>
  );
}

function EncounterModal({
  selected,
  clean,
  upperClean,
  lowerClean,
  onClose,
}: {
  selected: Encounter;
  clean: (text?: string) => string;
  upperClean: (text?: string, fallback?: string) => string;
  lowerClean: (text?: string, fallback?: string) => string;
  onClose: () => void;
}) {
  const avatar = selected.image_url;
  const playerName = upperClean(selected.name, "PLAYER");
  const title = upperClean(selected.title, "UNTITLED");
  const traits = selected.personality_bullets?.filter(Boolean) || [];

  const traitSentence =
    traits.length > 0
      ? `i think ure ${traits.map((trait) => lowerClean(trait)).join(", ")}.`
      : "i think ure someone i still remember quietly.";

  const chatRows = [
    {
      ask: "what did u call me back then?",
      answer:
        selected.how_i_called_them ||
        clean(selected.name) ||
        "a name i still remember.",
    },
    {
      ask: "what did i usually call u?",
      answer: selected.how_they_called_me || "something that stayed quiet.",
    },
    {
      ask: "where did we first meet?",
      answer: selected.first_met || "somewhere inside an old server.",
    },
    {
      ask: "what did u think of me first?",
      answer: selected.first_impression || "a small player in a large map.",
    },
    {
      ask: "which map felt like our place?",
      answer: selected.favorite_map || "a map that probably looks empty now.",
    },
    {
      ask: "what words did you keep from me?",
      answer:
        selected.common_words ||
        selected.description ||
        "nothing clear, just the feeling.",
    },
    {
      ask: "why did u still remember me?",
      answer:
        selected.why_i_remember_them ||
        selected.short_character_summary ||
        selected.description ||
        "the server ended, but something small stayed.",
    },
    {
      ask: "what kind of person was i?",
      answer: traitSentence,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="animate-modal fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.06] bg-[#070707]/95 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-30 rounded-full border border-white/[0.055] bg-black/60 p-2 text-[#777777] backdrop-blur-md transition-colors duration-700 hover:text-white"
        >
          <X size={14} />
        </button>

        <div className="hidden h-full w-[43%] shrink-0 overflow-hidden border-r border-white/[0.055] bg-black md:block">
          {selected.image_url ? (
            <img
              src={selected.image_url}
              alt={selected.name}
              className="h-full w-full object-cover grayscale opacity-82"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#666666]">
              <Monitor size={34} strokeWidth={1.5} />
            </div>
          )}

          <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-[43%] bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-white/[0.055] bg-white/[0.018] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 pr-10">
              <ChatAvatar image={avatar} name={selected.name} />

              <div className="min-w-0">
                <p className="truncate text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                  @{playerName}
                </p>

                <h2 className="mt-1 line-clamp-1 text-[16px] font-light uppercase leading-tight tracking-[0.1em] text-white/90 sm:text-[18px]">
                  {title}
                </h2>
              </div>
            </div>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="mb-5 rounded-3xl border border-white/[0.055] bg-white/[0.022] p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                <MessageCircle size={12} strokeWidth={1.5} />
                recovered chat
              </div>

              <p className="text-[12px] leading-relaxed text-[#d6d6d6]">
                {lowerClean(
                  selected.short_character_summary || selected.description,
                  "a memory that flickers when the screen goes dark."
                )}
              </p>
            </div>


            {(selected.matching_song || selected.movie_character) && (
              <div className="mb-5 grid gap-4 md:grid-cols-2">
                {selected.matching_song && (
                  <a
                    href={selected.spotify_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.055] bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#050505] p-5 transition-all duration-700 hover:border-white/12 hover:bg-white/[0.03]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_55%)]" />

                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#8d8d8d]">
                          <Music2 size={12} />
                          <p className="text-[8px] uppercase tracking-[0.22em]">
                            soundtrack
                          </p>
                        </div>

                        {selected.spotify_url && (
                          <ExternalLink
                            size={11}
                            className="text-[#666666] transition-colors duration-700 group-hover:text-white/80"
                          />
                        )}
                      </div>

                      <p className="text-[13px] leading-relaxed text-white/85">
                        {lowerClean(selected.matching_song)}
                      </p>

                      <p className="mt-3 text-[9px] leading-relaxed text-[#666666]">
                        this song somehow feels like the way u stayed in my memory.
                      </p>
                    </div>
                  </a>
                )}

                {selected.movie_character && (
                  <a
                    href={selected.tmdb_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.055] bg-white/[0.02] p-5 transition-all duration-700 hover:border-white/12 hover:bg-white/[0.03]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_55%)]" />

                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#8d8d8d]">
                          <Film size={12} />
                          <p className="text-[8px] uppercase tracking-[0.22em]">
                            movie feeling
                          </p>
                        </div>

                        {selected.tmdb_url && (
                          <ExternalLink
                            size={11}
                            className="text-[#666666] transition-colors duration-700 group-hover:text-white/80"
                          />
                        )}
                      </div>

                      <p className="text-[13px] leading-relaxed text-white/85">
                        {lowerClean(selected.movie_character)}
                      </p>

                      <p className="mt-3 text-[9px] leading-relaxed text-[#777777]">
                        {lowerClean(
                          selected.movie_reason,
                          "u reminded me of a quiet character that stayed longer than expected."
                        )}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            )}


            <div className="space-y-4">
              {chatRows.map((row, index) => (
                <div key={`${row.ask}-${index}`} className="space-y-2">
                  <div className="flex items-end gap-2">
                    <ChatAvatar image={avatar} name={selected.name} small />

                    <div className="max-w-[84%] rounded-3xl rounded-bl-md border border-white/[0.055] bg-white/[0.025] px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                      <p className="text-[9px] leading-relaxed tracking-[0.01em] text-[#d8d8d8] sm:text-[9.5px]">
                        {lowerClean(row.ask)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[84%] rounded-3xl rounded-br-md border border-white/[0.075] bg-white/[0.06] px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                      <p className="text-right text-[9.5px] leading-relaxed tracking-[0.01em] text-[#eeeeee] sm:text-[10px]">
                        {lowerClean(row.answer)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.055] bg-white/[0.018] px-5 py-4 sm:px-6">
            <div className="mb-2 rounded-2xl border border-white/[0.045] bg-black/25 px-4 py-3 text-[8px] tracking-[0.08em] text-[#777777]">
              chat window closed, but the words are still here.
            </div>

            <div className="flex items-center gap-3 rounded-full border border-white/[0.055] bg-black/35 px-4 py-3 text-[#666666]">
              <span className="flex-1 text-[8px] tracking-[0.08em]">
                type something that will never be sent...
              </span>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.055] bg-white/[0.025] text-[#9d9d9d]"
              >
                <Send size={11} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatAvatar({
  image,
  name,
  small = false,
}: {
  image?: string;
  name: string;
  small?: boolean;
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.025] ${
        small ? "h-7 w-7" : "h-9 w-9"
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover grayscale opacity-85"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#777777]">
          <UserRound size={small ? 11 : 14} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

function MiniMessage({
  align,
  text,
}: {
  align: "left" | "right";
  text: string;
}) {
  return (
    <div
      className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] rounded-2xl border border-white/[0.045] px-3 py-2 text-[10px] leading-relaxed text-[#777777] ${
          align === "right"
            ? "rounded-br-sm bg-white/[0.025]"
            : "rounded-bl-sm bg-black/35"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Background({ rainDrops }: { rainDrops: RainDrop[] }) {
  return (
    <>
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
    </>
  );
}

const LoadingState = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-[#020202]">
    <div className="h-px w-8 animate-pulse bg-white/30 shadow-[0_0_18px_rgba(255,255,255,0.24)]" />

    <p className="mt-4 text-[9px] lowercase tracking-[0.26em] text-[#666666]">
      rendering lobby...
    </p>
  </main>
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
      <Server size={12} className="text-[#777777] stroke-[1.5px]" />

      <h2 className="text-[12px] font-light tracking-wide text-white/80">
        {title}
      </h2>
    </div>

    <p className="text-[7px] uppercase tracking-[0.2em] text-[#666666]">
      {count}
    </p>
  </div>
);

const EmptyServer = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] py-20 text-[#666666]">
    <Cloud size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

    <p className="text-[8px] uppercase tracking-[0.22em]">
      the server is empty
    </p>
  </div>
);

function GlobalStyles() {
  return (
    <style jsx global>{`
      html,
      body {
        scroll-behavior: smooth;
        background: #020202;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.03);
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 8px;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.025);
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(255,255,255,0.18),
          rgba(255,255,255,0.08)
        );
        border-radius: 999px;
        border: 2px solid #020202;
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(255,255,255,0.26),
          rgba(255,255,255,0.12)
        );
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

      .line-clamp-1,
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-1 {
        -webkit-line-clamp: 1;
      }

      .line-clamp-2 {
        -webkit-line-clamp: 2;
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
  );
}