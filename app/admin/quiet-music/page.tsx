"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music2,
  Ghost,
  Trash2,
  Sparkles,
  Disc3,
  ExternalLink,
  UserRound,
  CloudRain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  preview_url: string;
  song_url: string;
  reason: string;
  reminds: string;
  username: string | null;
  is_anonymous: boolean;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 8;

const footerLines = [
  "some songs sound warmer when nobody claims them.",
  "certain melodies stay longer than people.",
  "echoes travel further at midnight.",
  "some frequencies never fully disappear.",
  "music remembers rooms better than memory does.",
];

export default function MusicAdminPage() {
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [footerText, setFooterText] = useState(footerLines[0]);

  const visibleSongs = songs.slice(0, visibleCount);
  const hasMore = visibleCount < songs.length;
  const expanded = songs.length > 0 && visibleCount >= songs.length;

  useEffect(() => {
    setFooterText(footerLines[Math.floor(Math.random() * footerLines.length)]);

    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from("music_recommendations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Failed to fetch music:", error);
      return;
    }

    setSongs(data || []);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const deleteSong = async (id: number) => {
    if (!confirm("Remove this song from the archive?")) return;

    const { error } = await supabase
      .from("music_recommendations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete song:", error);
      return;
    }

    fetchSongs();
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("music-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, songs.length));
  };

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.back()}
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

            <span className="hidden max-w-[320px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              quiet music
            </span>
          </button>

          <div className="w-[48px]" />
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / quiet music
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              songs strangers
              <br />
              left behind.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some songs arrive without a name.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <Music2 size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {songs.length} songs saved
            </p>

          </aside>
        </header>

        <section id="music-section" className="scroll-mt-36">
          <ShelfHeader
            title="SAVED SONGS"
            count={`${visibleSongs.length} shown · ${songs.length} saved`}
          />

          {songs.length === 0 ? (
            <EmptyMusic />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
                {visibleSongs.map((song, index) => (
                  <div
                    key={song.id}
                    style={{ animationDelay: `${index * 45}ms` }}
                    className="group animate-fade-in relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.012] shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="flex gap-3 p-3">
                      <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl border border-white/[0.05] bg-black/50 sm:h-[86px] sm:w-[86px]">
                        {song.artwork ? (
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="h-full w-full object-cover grayscale opacity-75 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#666666]">
                            <Music2 size={18} strokeWidth={1.5} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/70 px-2 py-0.5 text-[5.8px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
                          <Disc3 size={8} strokeWidth={1.5} />
                          song
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[6px] uppercase tracking-[0.18em] text-[#777777]">
                              {song.artist || "unknown artist"}
                            </p>

                            <h3 className="mt-1 line-clamp-1 text-[13px] font-light leading-snug tracking-[-0.03em] text-white sm:text-[14px]">
                              {song.title || "untitled frequency"}
                            </h3>

                            {song.album && (
                              <p className="mt-1 line-clamp-1 text-[9px] text-[#666666]">
                                {song.album}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-1.5 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
                            {song.song_url && (
                              <a
                                href={song.song_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
                              >
                                <ExternalLink size={9} />
                              </a>
                            )}

                            <button
                              onClick={() => deleteSong(song.id)}
                              className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
                            >
                              <Trash2 size={9} />
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-[9.5px] leading-relaxed text-[#8d8d8d] transition-colors duration-700 group-hover:text-[#f1f1f1]">
                          “{song.reason || "no reason left behind"}”
                        </p>

                        {song.reminds && (
                          <p className="mt-2 line-clamp-1 text-[8.5px] leading-relaxed text-[#777777]">
                            echoes: {song.reminds}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/[0.055] pt-2 text-[6.5px] uppercase tracking-[0.16em] text-[#666666]">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <UserRound size={9} strokeWidth={1.5} />
                            <span className="line-clamp-1">
                              {song.is_anonymous
                                ? "anonymous"
                                : song.username || "unnamed"}
                            </span>
                          </span>

                          {song.preview_url && (
                            <a
                              href={song.preview_url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 transition-colors duration-500 hover:text-white"
                            >
                              preview
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {songs.length > COLLAPSE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMore && (
                    <button type="button" onClick={showMore} className="CollapseBtn">
                      show more
                      <ChevronDown size={11} strokeWidth={1.5} />
                    </button>
                  )}

                  {expanded && (
                    <button type="button" onClick={collapse} className="CollapseBtn">
                      collapse again
                      <ChevronUp size={11} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-14 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          {footerText}
        </p>
      </footer>

      <GlobalStyles />
    </main>
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

function ShelfHeader({ title, count }: { title: string; count: string }) {
  return (
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
}

function EmptyMusic() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <Music2 size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

      <p className="text-[8px] uppercase tracking-[0.22em]">
        no echoes recovered
      </p>
    </div>
  );
}

function GlobalStyles() {
  return (
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

      .animate-fade-in {
        animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

      .CollapseBtn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.045);
        background: rgba(255, 255, 255, 0.016);
        padding: 0.75rem 1.25rem;
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: #777777;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        transition: all 700ms ease;
      }

      .CollapseBtn:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.75);
      }
    `}</style>
  );
}