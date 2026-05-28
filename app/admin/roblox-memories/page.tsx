"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  X,
  Trash2,
  ArrowLeft,
  Camera,
  Ghost,
  Sparkles,
  Loader2,
  Plus,
  CloudRain,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type MemoryImage = {
  id: number;
  image_url: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 10;

export default function ImageAdmin() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<MemoryImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const isAdmin = userEmail === "strangeclause@gmail.com";
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const isExpanded = items.length > 0 && visibleCount >= items.length;

  const footerLines = useMemo(
    () => [
      "some images are only evidence of a feeling.",
      "the vessel remembers what the room forgot.",
      "pixels are fragile little ghosts.",
      "nothing disappears cleanly in the archive.",
      "some fragments still glow when no one looks.",
    ],
    []
  );

  const footerText = useMemo(
    () => footerLines[Math.floor(Math.random() * footerLines.length)],
    [footerLines]
  );

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchImages = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("memory_gallery")
      .select("id, image_url")
      .order("id", { ascending: false });

    if (error) {
      setStatus("failed to load fragments");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setItems((data || []) as MemoryImage[]);
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUserEmail(session?.user?.email || null);
      await fetchImages();
    };

    init();
  }, []);

  const closeModal = (): void => {
    if (loading) return;

    setModalOpen(false);
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const upload = async (): Promise<void> => {
    if (!file) {
      setStatus("the void is empty");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    if (!isAdmin) {
      setStatus("you are not allowed inside this room");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("virtual-memory")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("virtual-memory")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("memory_gallery").insert({
        image_url: urlData.publicUrl,
        uploaded_by: userEmail,
      });

      if (dbError) throw dbError;

      setStatus("fragment archived");
      setFile(null);
      setModalOpen(false);
      setVisibleCount(COLLAPSE_SIZE);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchImages();
    } catch {
      setStatus("it did not want to stay");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const deleteImage = async (id: number): Promise<void> => {
    if (!confirm("Let this image fade from the archive?")) return;

    const { error } = await supabase.from("memory_gallery").delete().eq("id", id);

    if (error) {
      setStatus("it is stuck here");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setStatus("erased");
    await fetchImages();

    setTimeout(() => setStatus(""), 3000);
  };

  const showMore = (): void => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, items.length));
  };

  const collapse = (): void => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("visual-residue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            type="button"
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
            type="button"
            onClick={() => router.push("/")}
            className="group flex min-w-0 flex-col items-center text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>

            <span className="hidden max-w-[310px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              roblox memories
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
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

      {status && (
        <div className="animate-fade-in fixed left-1/2 top-24 z-[999] -translate-x-1/2 rounded-full border border-white/[0.045] bg-[#070707]/95 px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#b7b7b7] shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {status}
        </div>
      )}

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / roblox memories
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              proof that i was
              <br />
              there.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some pictures are just rooms pretending to be memories.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <Camera size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {items.length} roblox memories saved
            </p>

          </aside>
        </header>

        <section id="visual-residue" className="scroll-mt-36">
          <ShelfHeader
            title="ROBLOX MEMORIES SAVED"
            count={`${visibleItems.length} shown · ${items.length} saved`}
          />

          {items.length === 0 ? (
            <EmptyImages />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] shadow-[0_12px_36px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <img
                      src={item.image_url}
                      alt="memory"
                      className="h-full w-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                    />

                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-70" />

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteImage(item.id)}
                        className="absolute right-2 top-2 z-30 rounded-full border border-white/[0.045] bg-black/70 p-1.5 text-[#777777] opacity-100 backdrop-blur-md transition-all duration-700 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={11} strokeWidth={1.5} />
                      </button>
                    )}

                    <div className="absolute bottom-3 left-3 z-30 opacity-0 transition-all duration-700 group-hover:opacity-100">
                      <p className="text-[7px] uppercase tracking-[0.18em] text-[#cfcfcf]">
                        frag. {String(item.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {items.length > COLLAPSE_SIZE && (
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

      {modalOpen && (
        <div
          onClick={closeModal}
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white disabled:opacity-30"
            >
              <X size={14} />
            </button>

            <div className="mb-6">
              <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                new vessel
              </p>

              <h2 className="text-[14px] font-light uppercase tracking-[0.2em] text-white/90 sm:text-[15px]">
                archive an image
              </h2>

              <p className="mt-2 text-[11.5px] leading-relaxed text-[#777777]">
                Upload one image fragment. It will be saved into the visual
                residue gallery.
              </p>
            </div>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] p-4 text-center transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04]"
            >
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="max-h-[220px] w-full rounded-xl object-cover grayscale opacity-80"
                />
              ) : (
                <>
                  <Upload
                    size={18}
                    strokeWidth={1.5}
                    className="mb-4 text-[#777777]"
                  />
                  <p className="text-[8px] uppercase tracking-[0.18em] text-[#777777]">
                    choose image
                  </p>
                </>
              )}
            </button>

            {file && (
              <p className="mt-3 line-clamp-1 text-[10px] text-[#777777]">
                {file.name}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.055] pt-4">
              <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                {isAdmin ? "allowed room" : "locked room"}
              </p>

              <button
                type="button"
                onClick={upload}
                disabled={loading || !file || !isAdmin}
                className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {loading && (
                  <Loader2
                    size={10}
                    strokeWidth={1.5}
                    className="animate-spin"
                  />
                )}
                {loading ? "saving" : "archive"}
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

function EmptyImages() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <Ghost size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

      <p className="text-[8px] uppercase tracking-[0.22em]">
        the gallery is a ghost town
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
        scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.025);
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
            rgba(7,7,7,0.96),
            rgba(2,2,2,1)
          );
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background:
          linear-gradient(
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
        background:
          linear-gradient(
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

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
}