"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Inter } from "next/font/google";
import {
  ArrowLeft,
  Plus,
  X,
  Ghost,
  Sparkles,
  Loader2,
  CloudRain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type MemoryImage = {
  id: number;
  image_url: string;
  file_path: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 10;

export default function MemoryPage() {
  const router = useRouter();

  const [images, setImages] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const footerLines = useMemo(
    () => [
      "some images keep breathing after everyone leaves.",
      "the jar remembers what the heart misplaced.",
      "nothing is gone if the pixels still hold it.",
      "some fragments look better in low light.",
      "the archive is quiet, but not empty.",
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

  const fetchImages = async () => {
    const { data } = await supabase
      .from("memories")
      .select("*")
      .order("id", { ascending: false });

    setImages(data || []);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("memory").upload(filePath, file);

    if (error) {
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from("memory").getPublicUrl(filePath);

    await supabase.from("memories").insert({
      image_url: data.publicUrl,
      file_path: filePath,
    });

    setLoading(false);
    setVisibleCount(COLLAPSE_SIZE);
    fetchImages();
  };

  const remove = async (id: number, file_path: string) => {
    await supabase.from("memories").delete().eq("id", id);
    await supabase.storage.from("memory").remove([file_path]);
    fetchImages();
  };

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;
  const isExpanded = visibleCount >= images.length;

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, images.length));
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);
    document
      .getElementById("memory-fragments")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main
      id="main-content"
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

            <span className="hidden max-w-[300px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              memories
            </span>
          </button>

          <label className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]">
            {loading ? (
              <Loader2 size={11} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Plus
                size={11}
                strokeWidth={1.5}
                className="transition-transform duration-700 group-hover:rotate-90"
              />
            )}
            {loading ? "saving" : "add"}
            <input type="file" hidden accept="image/*" onChange={upload} />
          </label>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / memories
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              things saved
              <br />
              inside the jar.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some pixels are just memories pretending to be images.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>
              <Sparkles size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">{images.length} memories saved</p>
          </aside>
        </header>

        <section id="memory-fragments" className="scroll-mt-36">
          <ShelfHeader
            title="SAVED MEMORIES"
            count={`${visibleImages.length} shown · ${images.length} saved`}
          />

          {images.length === 0 && !loading ? (
            <EmptyMemory />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {visibleImages.map((img, i) => (
                  <div
                    key={img.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] shadow-[0_12px_36px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <img
                      src={img.image_url}
                      alt="fragment"
                      className="h-full w-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                    />

                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80" />

                    <button
                      onClick={() => remove(img.id, img.file_path)}
                      className="absolute right-3 top-3 z-30 rounded-full border border-white/[0.055] bg-black/70 p-2 text-[#777777] opacity-0 backdrop-blur-md transition-all duration-700 hover:text-white group-hover:opacity-100"
                      title="remove memory"
                    >
                      <X size={12} strokeWidth={1.5} />
                    </button>

                    <div className="absolute bottom-3 left-3 z-30 opacity-0 transition-all duration-700 group-hover:opacity-100">
                      <p className="text-[7px] uppercase tracking-[0.18em] text-[#cfcfcf]">
                        frg_{String(img.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {images.length > COLLAPSE_SIZE && (
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
                        strokeWidth={1.5}
                        className="transition-transform duration-700 group-hover:translate-y-0.5"
                      />
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      type="button"
                      onClick={collapse}
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

const EmptyMemory = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
    <Ghost size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

    <p className="text-[8px] uppercase tracking-[0.22em]">
      the jar is empty
    </p>
  </div>
);

const GlobalStyles = () => (
  <style jsx global>{`
    html,
    body {
      scroll-behavior: smooth;
      background: #020202;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.025);
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
        rgba(7,7,7,0.96),
        rgba(2,2,2,1)
      );
    }

    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.16),
        rgba(255,255,255,0.07)
      );
      border: 2px solid #020202;
      box-shadow:
        0 0 12px rgba(255,255,255,0.045),
        inset 0 0 8px rgba(255,255,255,0.03);
    }

    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.26),
        rgba(255,255,255,0.12)
      );
      box-shadow:
        0 0 16px rgba(255,255,255,0.07),
        inset 0 0 10px rgba(255,255,255,0.05);
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
  `}</style>
);