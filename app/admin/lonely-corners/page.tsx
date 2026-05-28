"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Ghost,
  Plus,
  X,
  Upload,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Place = {
  id: number;
  title: string;
  image_url: string;
  description: string;
  location_name: string;
  username: string | null;
  is_anonymous: boolean;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 6;

export default function PlaceAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    description: "",
    location_name: "",
    username: "",
    is_anonymous: true,
  });

  const visiblePlaces = places.slice(0, visibleCount);
  const hasMore = visibleCount < places.length;
  const expanded = visibleCount >= places.length;

  const footerLines = useMemo(
    () => [
      "some places remember us better than people do.",
      "not every quiet room is empty.",
      "corners keep memories longer than voices.",
      "some streets still wait for someone.",
      "certain places never stop looking back.",
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

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from("places_404")
      .select("*")
      .order("id", { ascending: false });

    setPlaces(data || []);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      image_url: "",
      description: "",
      location_name: "",
      username: "",
      is_anonymous: true,
    });

    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoadingImg(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `places/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("stranger-uploads")
      .upload(filePath, file);

    if (error) {
      setLoadingImg(false);
      return;
    }

    const { data } = supabase.storage
      .from("stranger-uploads")
      .getPublicUrl(filePath);

    setForm((prev) => ({
      ...prev,
      image_url: data.publicUrl,
    }));

    setLoadingImg(false);
  };

  const submitPlace = async () => {
    if (
      !form.title.trim() ||
      !form.image_url.trim() ||
      !form.description.trim()
    )
      return;

    setSaving(true);

    const payload = {
      title: form.title,
      image_url: form.image_url,
      description: form.description,
      location_name: form.location_name,
      username: form.is_anonymous ? null : form.username || null,
      is_anonymous: form.is_anonymous,
    };

    if (editingId) {
      await supabase
        .from("places_404")
        .update(payload)
        .eq("id", editingId);
    } else {
      await supabase.from("places_404").insert([payload]);
    }

    setSaving(false);
    setOpen(false);
    resetForm();
    fetchPlaces();
  };

  const editPlace = (place: Place) => {
    setEditingId(place.id);

    setForm({
      title: place.title || "",
      image_url: place.image_url || "",
      description: place.description || "",
      location_name: place.location_name || "",
      username: place.username || "",
      is_anonymous: place.is_anonymous,
    });

    setOpen(true);
  };

  const deletePlace = async (id: number) => {
    if (!confirm("Remove this place from the archive?")) return;

    await supabase.from("places_404").delete().eq("id", id);

    fetchPlaces();
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("archive-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const showMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + COLLAPSE_SIZE, places.length)
    );
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
              lonely corners
            </span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
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
              <CloudRain
                size={12}
                className="text-[#666666] stroke-[1.4px]"
              />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / lonely corners
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              manage the places
              <br />
              that remembered too much.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>not every empty place is empty.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <MapPin
                size={12}
                strokeWidth={1.5}
                className="text-[#666666]"
              />
            </div>

            <p className="text-[13px] text-white/80">
              {places.length} places saved
            </p>

          </aside>
        </header>

        <section
          id="archive-section"
          className="scroll-mt-36"
        >
          <ShelfHeader
            title="SAVED CORNERS"
            count={`${visiblePlaces.length} shown · ${places.length} saved`}
          />

          {places.length === 0 ? (
            <EmptyPlaces />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {visiblePlaces.map((place, index) => (
                  <div
                    key={place.id}
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                    className="group animate-fade-in relative aspect-square overflow-hidden rounded-[1.4rem] border border-white/[0.045] bg-white/[0.015] shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.03]"
                  >
                    <div className="relative h-full overflow-hidden">
                      <img
                        src={place.image_url}
                        alt={place.title}
                        className="h-full w-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-all duration-700 group-hover:opacity-100">
                        <button
                          onClick={() => editPlace(place)}
                          className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                        >
                          <Edit size={11} />
                        </button>

                        <button
                          onClick={() =>
                            deletePlace(place.id)
                          }
                          className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/88 to-transparent p-3 sm:p-4">
                      <div className="mb-2 flex items-center gap-1.5 text-[#9a9a9a]">
                        <MapPin
                          size={10}
                          strokeWidth={1.5}
                        />

                        <span className="line-clamp-1 text-[6.5px] uppercase tracking-[0.18em] sm:text-[7px]">
                          {place.location_name || "nowhere"}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-[11px] font-light leading-snug tracking-[-0.03em] text-white sm:text-[13px]">
                        {place.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {places.length > COLLAPSE_SIZE && (
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

                  {expanded && (
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

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-scroll relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3 shadow-[0_0_24px_rgba(255,255,255,0.035)]">
                  <MapPin
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                {editingId ? "edit corner" : "add corner"}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-[#777777]">
                keep one quiet place here before the weather changes again.
              </p>
            </div>

            <div className="space-y-4">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="title"
                className="w-full border-b border-white/[0.07] bg-transparent py-2.5 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/20"
              />

              <input
                value={form.location_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location_name: e.target.value,
                  })
                }
                placeholder="place name"
                className="w-full border-b border-white/[0.07] bg-transparent py-2.5 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/20"
              />

              <label className="group flex min-h-[190px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] transition-all duration-700 hover:border-white/12 hover:bg-white/[0.04]">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUpload}
                />

                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="upload"
                    className="max-h-[340px] w-full object-cover grayscale opacity-80"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#777777]">
                    {loadingImg ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={15} />
                    )}

                    <p className="text-[8px] uppercase tracking-[0.22em]">
                      {loadingImg
                        ? "uploading..."
                        : "upload image"}
                    </p>
                  </div>
                )}
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="what did this place feel like?"
                className="h-28 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />

              <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                  quiet archive
                </p>

                <button
                  onClick={submitPlace}
                  disabled={
                    saving ||
                    !form.title.trim() ||
                    !form.image_url.trim() ||
                    !form.description.trim()
                  }
                  className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:opacity-20"
                >
                  {saving ? (
                    <Loader2
                      size={10}
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={10}
                      strokeWidth={1.5}
                      className="transition-transform duration-700 group-hover:translate-x-0.5"
                    />
                  )}

                  {editingId
                    ? "update"
                    : "release"}
                </button>
              </div>
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

function Background({
  rainDrops,
}: {
  rainDrops: RainDrop[];
}) {
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

function ShelfHeader({
  title,
  count,
}: {
  title: string;
  count: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/[0.045] pb-3">
      <div className="flex items-center gap-2">
        <Sparkles
          size={12}
          className="text-[#777777] stroke-[1.5px]"
        />

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

function EmptyPlaces() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <Ghost
        size={16}
        strokeWidth={1.5}
        className="mb-3 opacity-60"
      />

      <p className="text-[8px] uppercase tracking-[0.22em]">
        no places recovered
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
          transform: scale(0.98)
            translateY(10px);
          filter: blur(8px);
        }

        to {
          opacity: 1;
          transform: scale(1)
            translateY(0);
          filter: blur(0);
        }
      }

      .animate-fade-in {
        animation: fadeIn 1.8s
          cubic-bezier(0.16, 1, 0.3, 1)
          forwards;
      }

      .animate-modal {
        animation: modalFade 0.55s
          cubic-bezier(0.16, 1, 0.3, 1)
          forwards;
      }


      .modal-scroll::-webkit-scrollbar {
        display: none;
      }

      .modal-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );
}