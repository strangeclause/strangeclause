"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  ArrowLeft,
  Ghost,
  Heart,
  UserCircle2,
  Gamepad2,
  Server,
  Monitor,
  Crown,
  Trophy,
  X,
  Sparkles,
  ScrollText,
  ChevronRight,
  Layers,
  CloudRain,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Smile,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type MemoryImage = {
  id: string;
  image_url: string;
  uploaded_at: string;
};

type InventoryImageRow = {
  id: string;
  image_url: string;
  sort_order: number | null;
};

type InventorySectionRow = {
  id: string;
  title: string;
  type: string | null;
  height: string | null;
  sort_order: number | null;
  images?: InventoryImageRow[];
};

type GrindLogRow = {
  id: string;
  title: string;
  detail: string | null;
  sort_order: number | null;
};

type GameArchiveRow = {
  id: string;
  name: string;
  mood: string | null;
  status: string | null;
  banner: string | null;
  game_url?: string | null;
  short_line: string | null;
  sort_order: number | null;
  inventory?: InventorySectionRow[];
  grind_logs?: GrindLogRow[];
};

type InventoryCategory = {
  id: string;
  title: string;
  type: string;
  images: string[];
  height: string;
};

type GrindLog = {
  id: string;
  title: string;
  detail: string;
};

type GameArchive = {
  id: string;
  name: string;
  mood: string;
  status: string;
  banner: string;
  gameUrl: string;
  shortLine: string;
  inventory: InventoryCategory[];
  grindLogs: GrindLog[];
};

const GALLERY_COLLAPSE_SIZE = 8;

export default function RobloxProfilePage() {
  const router = useRouter();
  const robloxProfileUrl = "https://www.roblox.com/users/9196952790/profile";

  const [images, setImages] = useState<MemoryImage[]>([]);
  const [gameArchives, setGameArchives] = useState<GameArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameArchive | null>(null);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(
    GALLERY_COLLAPSE_SIZE
  );

  const data = useMemo(
    () => ({
      username: "ohmycouffee",
      signature_line:
        "some servers closed, but the feeling stayed open in the background.",
    }),
    []
  );

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        left: `${(index * 37) % 100}%`,
        delay: `${(index % 6) * 0.55}s`,
        duration: `${1.4 + (index % 5) * 0.28}s`,
      })),
    []
  );

  useEffect(() => {
    const fetchGameArchives = async () => {
      try {
        const { data: gameData, error } = await supabase
          .from("roblox_game_archives")
          .select(`
            *,
            inventory:roblox_game_inventory_sections(
              *,
              images:roblox_game_inventory_images(*)
            ),
            grind_logs:roblox_game_grind_logs(*)
          `)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        const mappedGames: GameArchive[] = (
          (gameData || []) as GameArchiveRow[]
        ).map((game) => {
          const inventory = [...((game.inventory || []) as InventorySectionRow[])]
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((section) => ({
              id: section.id,
              title: section.title || "Untitled Shelf",
              type: section.type || "inventory",
              height: section.height || "max-h-60",
              images: [...((section.images || []) as InventoryImageRow[])]
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((image) => image.image_url)
                .filter(Boolean),
            }));

          const grindLogs = [...((game.grind_logs || []) as GrindLogRow[])]
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((log) => ({
              id: log.id,
              title: log.title || "quiet progress",
              detail: log.detail || "no detail was written yet.",
            }));

          return {
            id: game.id,
            name: game.name || "Untitled Game",
            mood: game.mood || "quiet game memories kept behind glass",
            status: game.status || "still archived",
            banner: game.banner || "",
            gameUrl: game.game_url || "",
            shortLine:
              game.short_line || "some games stayed longer than the server did.",
            inventory,
            grindLogs,
          };
        });

        setGameArchives(mappedGames);
      } catch (error) {
        console.error("Failed to fetch game archives:", error);
      } finally {
        setGameLoading(false);
      }
    };

    fetchGameArchives();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: imagesData, error } = await supabase
          .from("memory_gallery")
          .select("*")
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setImages((imagesData || []) as MemoryImage[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedGame ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedGame]);

  const visibleImages = useMemo(
    () => images.slice(0, visibleGalleryCount),
    [images, visibleGalleryCount]
  );

  const hasMoreGallery = visibleGalleryCount < images.length;
  const isGalleryExpanded = visibleGalleryCount >= images.length;

  const showMoreGallery = () => {
    setVisibleGalleryCount((prev) =>
      Math.min(prev + GALLERY_COLLAPSE_SIZE, images.length)
    );
  };

  const collapseGallery = () => {
    setVisibleGalleryCount(GALLERY_COLLAPSE_SIZE);

    document
      .getElementById("old-captures")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <LoadingState />;

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.028),transparent_42%),radial-gradient(circle_at_8%_42%,rgba(255,255,255,0.018),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(255,255,255,0.014),transparent_32%),linear-gradient(180deg,#020202_0%,#050505_46%,#020202_100%)]" />

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[#020202]" />

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

            <span className="hidden max-w-[270px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              old profile
            </span>
          </button>

          <a
            href={robloxProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <Gamepad2
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-12"
            />
            profile
          </a>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] space-y-14 px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:space-y-20 lg:px-28 xl:px-36">
        <section className="animate-fade-in grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 xl:gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                raining
              </p>
            </div>

            <h1 className="text-[26px] font-light leading-[1.1] tracking-[-0.05em] text-white/90 sm:text-[34px] md:text-[42px]">
              description i wrote years ago when the weather was different.
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
                  <UserCircle2 size={12} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.2em]">
                    @{data.username}
                  </p>
                </div>

                <p className="rounded-full border border-white/[0.045] bg-black/45 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#666666] backdrop-blur-sm">
                  profile
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
                      saved profile
                    </p>
                  </div>

                  <p className="max-w-md text-[16px] font-light leading-snug tracking-[-0.04em] text-white/85 sm:text-[19px]">
                    online somewhere quiet, between games that felt like small
                    rooms.
                  </p>

                  <div className="space-y-2">
                    <MiniMessage align="left" text="where did everyone go?" />
                    <MiniMessage align="right" text="still here, just quiet." />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section>
          <ShelfHeader
            title="GAME ARCHIVE"
            count={gameLoading ? "loading" : `${gameArchives.length} games`}
          />

          {gameLoading ? (
            <div className="flex gap-5 overflow-hidden pb-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[390px] w-[270px] shrink-0 animate-pulse rounded-2xl border border-white/[0.04] bg-white/[0.012] sm:w-[310px]"
                />
              ))}
            </div>
          ) : gameArchives.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 hidden w-24 bg-gradient-to-l from-[#020202] to-transparent md:block" />

              <div className="game-shelf flex snap-x gap-5 overflow-x-auto overflow-y-hidden pb-5">
                {gameArchives.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onOpen={() => setSelectedGame(game)}
                  />
                ))}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 text-[7px] uppercase tracking-[0.2em] text-[#444444]">
                <span>scroll sideways</span>
                <ChevronRight size={11} strokeWidth={1.5} />
              </div>
            </div>
          ) : (
            <EmptyBlock text="no game archive saved yet" />
          )}
        </section>

        <section id="old-captures" className="scroll-mt-36">
          <ShelfHeader
            title="OLD CAPTURES"
            count={!loading ? `${images.length} traces` : "loading"}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: GALLERY_COLLAPSE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-2xl border border-white/[0.045] bg-white/[0.012]"
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {visibleImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <img
                      src={img.image_url}
                      alt="memory remnant"
                      className="h-full w-full object-cover grayscale opacity-35 transition-all duration-1000 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:opacity-82"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80" />

                    <div className="absolute left-3 top-3 rounded-full border border-white/[0.045] bg-black/45 px-2 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777] backdrop-blur-sm">
                      trace {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="line-clamp-2 text-[8px] uppercase tracking-[0.18em] text-white/70">
                        saved from an older server
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {images.length > GALLERY_COLLAPSE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMoreGallery && (
                    <button
                      type="button"
                      onClick={showMoreGallery}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      show more
                      <ChevronDown
                        size={11}
                        strokeWidth={1.5}
                        className="transition-transform duration-700 group-hover:translate-y-0.5"
                      />
                    </button>
                  )}

                  {isGalleryExpanded && (
                    <button
                      type="button"
                      onClick={collapseGallery}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      collapse again
                      <ChevronUp
                        size={11}
                        strokeWidth={1.5}
                        className="transition-transform duration-700 group-hover:-translate-y-0.5"
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyBlock text="no captures saved yet" />
          )}
        </section>

        <footer className="flex flex-col items-center border-t border-white/[0.04] py-16">
          <a
            href={robloxProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.015] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03]">
              <Gamepad2
                size={16}
                strokeWidth={1.5}
                className="text-[#555555] transition-colors duration-700 group-hover:text-white/70"
              />
            </div>

            <span className="text-[8px] uppercase tracking-[0.22em] text-[#555555] transition-colors duration-700 group-hover:text-white/70">
              view roblox profile
            </span>

            <ExternalLink
              size={12}
              className="text-[#444444] transition-colors duration-700 group-hover:text-white/60"
            />
          </a>
        </footer>
      </div>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          background: #020202;

          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 255, 255, 0.14)
            rgba(255, 255, 255, 0.025);
        }

        body {
          background: #020202;

          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 255, 255, 0.14)
            rgba(255, 255, 255, 0.025);
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background:
            linear-gradient(
              180deg,
              rgba(7, 7, 7, 0.96),
              rgba(2, 2, 2, 1)
            );
        }

        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          border-radius: 999px;

          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.16),
              rgba(255, 255, 255, 0.07)
            );

          border: 2px solid #020202;

          box-shadow:
            0 0 12px rgba(255, 255, 255, 0.045),
            inset 0 0 8px rgba(255, 255, 255, 0.03);

          transition:
            background 500ms ease,
            box-shadow 500ms ease,
            opacity 500ms ease;
        }

        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(
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
        }

        .drop {
          width: 1px;
          height: 65px;
          animation: rain linear infinite;
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

        .game-shelf,
        .category-scroll,
        .modal-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .game-shelf::-webkit-scrollbar,
        .category-scroll::-webkit-scrollbar,
        .modal-scroll::-webkit-scrollbar {
          display: none;
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
            transform: translateY(4px);
            filter: blur(2px);
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
      `}</style>
    </main>
  );
}

const GameCard = ({
  game,
  onOpen,
}: {
  game: GameArchive;
  onOpen: () => void;
}) => {
  const previewShelves = game.inventory
    .filter((category) => category.images.length > 0)
    .slice(0, 3);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-[270px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] text-left shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.025] sm:w-[310px]"
    >
      <div className="relative h-36 overflow-hidden border-b border-white/[0.04] bg-black/40">
        {game.banner ? (
          <img
            src={game.banner}
            alt={game.name}
            className="h-full w-full object-cover grayscale opacity-35 transition-all duration-1000 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:opacity-80"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#555555]">
            <Gamepad2 size={18} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-black/30 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/[0.05] bg-black/45 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777] backdrop-blur-md">
          <Gamepad2 size={10} strokeWidth={1.5} />
          game
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-[14px] font-light tracking-wide text-white/85">
            {game.name}
          </h3>
          <p className="mt-1 truncate text-[9px] lowercase tracking-[0.12em] text-[#777777]">
            {game.mood}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#666666]">
            <Trophy size={12} strokeWidth={1.5} />
            <span className="text-[8px] uppercase tracking-[0.2em]">
              inventory shelves
            </span>
          </div>

          <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-2.5 py-1 text-[7px] uppercase tracking-[0.18em] text-[#555555]">
            {game.inventory.length} shelves
          </span>
        </div>

        {previewShelves.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {previewShelves.map((category) => (
              <div
                key={`${game.id}-${category.id}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.04] bg-black/35"
              >
                <img
                  src={category.images[0]}
                  alt={category.title}
                  className="h-full w-full object-cover grayscale opacity-35 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[6px] uppercase tracking-[0.12em] text-white/50">
                  {category.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[92px] items-center justify-center rounded-xl border border-dashed border-white/[0.04] bg-black/30 text-[7px] uppercase tracking-[0.18em] text-[#444444]">
            no shelf photos
          </div>
        )}

        <div className="rounded-2xl rounded-bl-sm border border-white/[0.045] bg-white/[0.018] px-3 py-2">
          <p className="line-clamp-2 text-[10.5px] italic leading-relaxed text-[#666666]">
            “{game.shortLine}”
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
          <span className="text-[7px] uppercase tracking-[0.2em] text-[#444444]">
            {game.status}
          </span>

          <span className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.2em] text-[#777777] transition-colors duration-700 group-hover:text-white/70">
            open inventory
            <ChevronRight size={11} strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </button>
  );
};

const GameModal = ({
  game,
  onClose,
}: {
  game: GameArchive;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md sm:px-6">
    <button
      type="button"
      onClick={onClose}
      className="absolute inset-0 cursor-default"
      aria-label="close inventory window"
    />

    <section className="relative z-10 flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#050505]/95 shadow-[0_35px_100px_rgba(0,0,0,0.8)]">
      <div className="relative h-44 shrink-0 overflow-hidden border-b border-white/[0.05] bg-black sm:h-56">
        {game.banner ? (
          <img
            src={game.banner}
            alt={game.name}
            className="h-full w-full object-cover grayscale opacity-45"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#555555]">
            <Gamepad2 size={22} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/55 to-black/10" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-black/55 text-[#777777] backdrop-blur-md transition-all duration-700 hover:border-white/15 hover:text-white"
          aria-label="close"
        >
          <X size={15} strokeWidth={1.5} />
        </button>

        <div className="absolute bottom-6 left-5 right-5 sm:left-7 sm:right-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/45 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777] backdrop-blur-md">
              <Layers size={10} strokeWidth={1.5} />
              inventory window
            </span>

            <span className="rounded-full border border-white/[0.06] bg-black/45 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777] backdrop-blur-md">
              {game.status}
            </span>
          </div>

          <h3 className="text-[22px] font-light tracking-wide text-white/90 sm:text-[28px]">
            {game.name}
          </h3>

          <p className="mt-2 max-w-xl text-[11px] lowercase leading-relaxed tracking-[0.1em] text-[#8a8a8a]">
            {game.mood}
          </p>

          {game.gameUrl && (
            <a
              href={game.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/45 px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#888888] backdrop-blur-md transition-colors hover:text-white"
            >
              open game
              <ExternalLink size={10} strokeWidth={1.5} />
            </a>
          )}
        </div>
      </div>

      <div className="modal-scroll overflow-y-auto p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2">
                <Crown size={12} strokeWidth={1.5} className="text-[#666666]" />
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  inventory shelves
                </h4>
              </div>

              <span className="text-[7px] uppercase tracking-[0.2em] text-[#444444]">
                {game.inventory.length} shelves
              </span>
            </div>

            <div className="space-y-6">
              {game.inventory.length > 0 ? (
                game.inventory.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                        {category.title}
                      </p>

                      <span className="text-[7px] uppercase tracking-[0.18em] text-[#444444]">
                        {category.images.length} saved
                      </span>
                    </div>

                    {category.images.length > 0 ? (
                      <div className="category-scroll flex items-end gap-4 overflow-x-auto pb-2">
                        {category.images.map((img, index) => (
                          <img
                            key={`${category.id}-${index}`}
                            src={img}
                            alt={category.title}
                            className={`h-auto w-auto shrink-0 rounded-[10px] grayscale opacity-45 transition-all duration-700 hover:scale-[1.03] hover:grayscale-0 hover:opacity-95 ${
                              category.height || "max-h-60"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.01] text-[7px] uppercase tracking-[0.18em] text-[#444444]">
                        no photos in this shelf
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyBlock text="no inventory shelves saved yet" />
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-5">
              <div className="mb-4 flex items-center gap-2">
                <ScrollText
                  size={12}
                  strokeWidth={1.5}
                  className="text-[#666666]"
                />
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  grind log
                </h4>
              </div>

              <div className="space-y-3">
                {game.grindLogs.length > 0 ? (
                  game.grindLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className="group/log rounded-2xl border border-white/[0.04] bg-black/25 p-4 transition-all duration-700 hover:border-white/10 hover:bg-white/[0.02]"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#888888] group-hover/log:text-white/75">
                          {log.title}
                        </p>

                        <span className="text-[7px] uppercase tracking-[0.18em] text-[#444444]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="text-[10.5px] leading-relaxed text-[#666666] group-hover/log:text-[#9a9a9a]">
                        {log.detail}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyBlock text="no grind log saved yet" />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle
                  size={12}
                  strokeWidth={1.5}
                  className="text-[#666666]"
                />
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  lobby chat
                </h4>
              </div>

              <div className="space-y-2">
                <MiniMessage align="left" text="saved this one too." />
                <MiniMessage align="right" text="it looks lonely but cute." />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles
                  size={12}
                  strokeWidth={1.5}
                  className="text-[#666666]"
                />
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  quiet note
                </h4>
              </div>

              <p className="text-[11px] italic leading-relaxed text-[#666666]">
                “{game.shortLine}”
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
);

const ShelfHeader = ({ title, count }: { title: string; count: string }) => (
  <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.04] pb-3">
    <div className="flex items-center gap-2">
      <Server size={12} className="text-[#555555] stroke-[1.5px]" />
      <h2 className="text-[11.5px] font-light tracking-wide text-white/70">
        {title}
      </h2>
    </div>

    <p className="text-[7px] uppercase tracking-[0.2em] text-[#444444]">
      {count}
    </p>
  </div>
);

const ChatBubble = ({ text }: { text: string }) => (
  <div className="group relative flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/[0.055] bg-white/[0.018] px-3.5 py-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/70">
    <MessageCircle
      size={11}
      strokeWidth={1.5}
      className="text-[#555555] transition-colors duration-700 group-hover:text-white/60"
    />
    {text}
  </div>
);

const MiniMessage = ({
  align,
  text,
}: {
  align: "left" | "right";
  text: string;
}) => (
  <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
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

const EmptyBlock = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-16 text-[#555555]">
    <Heart size={16} strokeWidth={1.5} className="mb-3 opacity-50" />
    <p className="text-[8px] uppercase tracking-[0.22em]">{text}</p>
  </div>
);

const LoadingState = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-[#020202]">
    <div className="h-px w-8 animate-pulse bg-white/30 shadow-[0_0_18px_rgba(255,255,255,0.24)]" />
    <p className="mt-4 text-[9px] lowercase tracking-[0.26em] text-[#666666]">
      rendering lobby...
    </p>
  </main>
);