"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Upload,
  Ghost,
  Plus,
  Send,
  X,
  Loader2,
  Sparkles,
  Search,
  Clock3,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  User,
  ChevronDown,
  ChevronUp,
  CloudRain,
  ExternalLink,
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

type FilterMode = "all" | "anonymous" | "named" | "located";
type SortMode = "default" | "latest" | "oldest" | "az" | "za";

const PAGE_SIZE = 8;
const FOOTER_TEXT =
  "everyone went home early because of the dark sky. i am still sitting here by myself.";

export default function LonelyCornersPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [rainDrops, setRainDrops] = useState<
    { left: string; delay: string; duration: string }[]
  >([]);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    description: "",
    location_name: "",
    username: "",
    is_anonymous: true,
  });

  const router = useRouter();

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchPlaces = useCallback(async () => {
    const { data } = await supabase
      .from("places_404")
      .select("*")
      .order("id", { ascending: false });

    setPlaces(data || []);
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = places.filter((place) => {
      const matchesSearch =
        !keyword ||
        place.title?.toLowerCase().includes(keyword) ||
        place.description?.toLowerCase().includes(keyword) ||
        place.location_name?.toLowerCase().includes(keyword) ||
        place.username?.toLowerCase().includes(keyword);

      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "anonymous" && place.is_anonymous) ||
        (filterMode === "named" && !place.is_anonymous) ||
        (filterMode === "located" && Boolean(place.location_name?.trim()));

      return matchesSearch && matchesFilter;
    });

    const sorted = [...filtered];

    if (sortMode === "default" || sortMode === "latest") {
      sorted.sort((a, b) => b.id - a.id);
    }

    if (sortMode === "oldest") {
      sorted.sort((a, b) => a.id - b.id);
    }

    if (sortMode === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortMode === "za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    return sorted;
  }, [places, searchTerm, filterMode, sortMode]);

  const visiblePlaces = useMemo(
    () => filteredPlaces.slice(0, visibleCount),
    [filteredPlaces, visibleCount]
  );

  const hasMorePlaces = visibleCount < filteredPlaces.length;
  const isExpanded = visibleCount >= filteredPlaces.length;

  const resetCollapse = () => {
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetCollapse();
  };

  const cycleFilterMode = () => {
    setFilterMode((current) => {
      if (current === "all") return "anonymous";
      if (current === "anonymous") return "named";
      if (current === "named") return "located";
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

  const cycleAlphabetSort = () => {
    setSortMode((current) => {
      if (current === "az") return "za";
      if (current === "za") return "default";
      return "az";
    });

    resetCollapse();
  };

  const showMorePlaces = () => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredPlaces.length)
    );
  };

  const collapsePlaces = () => {
    setVisibleCount(PAGE_SIZE);

    document
      .getElementById("places-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterIcon =
    filterMode === "anonymous" ? (
      <Ghost size={11} />
    ) : filterMode === "named" ? (
      <User size={11} />
    ) : filterMode === "located" ? (
      <MapPin size={11} />
    ) : (
      <SlidersHorizontal size={11} />
    );

  const filterLabel =
    filterMode === "anonymous"
      ? "anonymous"
      : filterMode === "named"
      ? "named"
      : filterMode === "located"
      ? "located"
      : "all";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `places/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("stranger-uploads")
      .upload(filePath, file);

    if (error) {
      setStatus("error");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("stranger-uploads")
      .getPublicUrl(filePath);

    setForm((prev) => ({
      ...prev,
      image_url: data.publicUrl,
    }));

    setUploading(false);
  };

  const submitPlace = async () => {
    if (!form.title.trim() || !form.image_url.trim() || !form.description.trim())
      return;

    setStatus("idle");

    const { error } = await supabase.from("places_404").insert([
      {
        title: form.title,
        image_url: form.image_url,
        description: form.description,
        location_name: form.location_name,
        username: form.is_anonymous ? null : form.username || null,
        is_anonymous: form.is_anonymous,
      },
    ]);

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("success");

    setForm({
      title: "",
      image_url: "",
      description: "",
      location_name: "",
      username: "",
      is_anonymous: true,
    });

    fetchPlaces();
    resetCollapse();

    setTimeout(() => {
      setStatus("idle");
      setOpen(false);
    }, 1200);
  };

  return (
    <main
      id="main-content"
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
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group hidden items-center gap-2 justify-self-start text-[9px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 md:flex"
          >
            <ArrowLeft
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:-translate-x-1"
            />
            leave
          </button>

          <div className="col-start-1 row-start-1 flex min-w-0 flex-col items-start justify-self-start text-left md:col-start-2 md:items-center md:justify-self-center md:text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/80 sm:text-[11px]">
              strange clause
            </p>
            <p className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#666666] sm:max-w-[280px] sm:text-[8px]">
              lonely corners
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="group col-start-2 row-start-1 flex items-center justify-self-end gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px] md:col-start-3"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            <span className="hidden sm:inline">add corner</span>
            <span className="sm:hidden">add</span>
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
            places where the streetlights stay on even when nobody walks by.
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>no one is around anymore.</span>
            </div>
          </div>
        </header>

        <section id="places-list" className="scroll-mt-36">
          <ShelfHeader
            title="CORNERS SHELF"
            count={`${filteredPlaces.length} shown · ${places.length} saved`}
          />

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,auto)]">
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

            <ControlButton
              active={filterMode !== "all"}
              icon={filterIcon}
              label={filterLabel}
              onClick={cycleFilterMode}
            />

            <ControlButton
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

            <ControlButton
              active={sortMode === "az" || sortMode === "za"}
              icon={
                sortMode === "za" ? (
                  <ArrowUpAZ size={11} />
                ) : (
                  <ArrowDownAZ size={11} />
                )
              }
              label={
                sortMode === "az" ? "a-z" : sortMode === "za" ? "z-a" : "by title"
              }
              onClick={cycleAlphabetSort}
            />
          </div>

          {filteredPlaces.length === 0 ? (
            <EmptyPlaces />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {visiblePlaces.map((place, idx) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedPlace(place)}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] text-left shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="pointer-events-none absolute inset-x-5 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={place.image_url}
                        alt={place.title}
                        className="h-full w-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:scale-[1.04] group-hover:opacity-85"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <span className="absolute right-2 top-2 rounded-full border border-white/[0.055] bg-black/70 px-2 py-1 text-[6.5px] tracking-[0.16em] text-[#cfcfcf] backdrop-blur-md">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 text-[7px] uppercase tracking-[0.18em] text-[#bdbdbd]">
                        <MapPin size={9} strokeWidth={1.5} />
                        <span className="truncate">
                          {place.location_name || "nowhere"}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-2 p-3">
                      <h3 className="line-clamp-1 text-[12.5px] font-light leading-snug tracking-[-0.02em] text-white/90">
                        {place.title}
                      </h3>

                      <p className="line-clamp-2 text-[10px] leading-relaxed text-[#858585] transition-colors duration-700 group-hover:text-[#d8d8d8]">
                        “{place.description}”
                      </p>

                      <div className="flex items-center justify-between border-t border-white/[0.045] pt-2 text-[7px] uppercase tracking-[0.16em] text-[#666666]">
                        <span className="max-w-[70%] truncate">
                          {place.is_anonymous
                            ? "anonymous"
                            : place.username || "someone"}
                        </span>
                        <ExternalLink size={9} strokeWidth={1.5} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredPlaces.length > PAGE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMorePlaces && (
                    <button
                      type="button"
                      onClick={showMorePlaces}
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
                      onClick={collapsePlaces}
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

      {selectedPlace && (
        <div
          onClick={() => setSelectedPlace(null)}
          className="animate-fadeIn fixed inset-0 z-[420] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="grid gap-6 md:grid-cols-[230px_1fr]">
              <div className="relative mx-auto w-full max-w-[230px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                <img
                  src={selectedPlace.image_url}
                  alt={selectedPlace.title}
                  className="h-full max-h-[320px] min-h-[230px] w-full object-cover grayscale opacity-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              <div className="flex min-w-0 flex-col justify-center text-center md:text-left">
                <p className="text-[8px] uppercase tracking-[0.24em] text-[#777777]">
                  recovered corner
                </p>

                <h2 className="mt-3 text-[26px] font-light leading-tight tracking-[-0.05em] text-white/90">
                  {selectedPlace.title || "untitled"}
                </h2>

                <div className="mt-3 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#777777] md:justify-start">
                  <MapPin size={11} strokeWidth={1.5} />
                  <span>{selectedPlace.location_name || "nowhere"}</span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                  <p className="text-[13px] font-light leading-relaxed text-[#d6d6d6]">
                    “{selectedPlace.description}”
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                  <span className="flex items-center gap-2">
                    <User size={11} />
                    saved by
                  </span>
                  <span>
                    {selectedPlace.is_anonymous
                      ? "anonymous"
                      : selectedPlace.username || "someone"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-fadeIn fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>
            
            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3">
                  <MapPin
                    size={12}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                add corner
              </h2>

              <p className="mt-2 text-[11px] leading-relaxed text-[#777777]">
                put down something small so it stays here after you close the tab.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="title"
                  className="w-full border-b border-white/[0.08] bg-transparent py-2 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/25"
                />

                <input
                  value={form.location_name}
                  onChange={(e) =>
                    setForm({ ...form, location_name: e.target.value })
                  }
                  placeholder="location (optional)"
                  className="w-full border-b border-white/[0.08] bg-transparent py-2 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/25"
                />
              </div>

              <label className="group flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] sm:h-40">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUpload}
                />

                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="upload"
                    className="h-full w-full object-cover grayscale opacity-75 transition-all duration-1000 group-hover:scale-[1.03] group-hover:opacity-95"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#777777]">
                    {uploading ? (
                      <Loader2
                        size={15}
                        strokeWidth={1.5}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={15} strokeWidth={1.5} />
                    )}

                    <p className="text-[8px] uppercase tracking-[0.22em]">
                      {uploading ? "uploading..." : "upload image"}
                    </p>
                  </div>
                )}
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="a quiet memory tied to this place"
                className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />

              <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
                <label className="flex cursor-pointer items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] transition-colors duration-700 hover:text-white">
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) =>
                      setForm({ ...form, is_anonymous: e.target.checked })
                    }
                    className="hidden"
                  />

                  <span
                    className={`h-2.5 w-2.5 rounded-full border border-white/[0.18] transition-all duration-700 ${
                      form.is_anonymous
                        ? "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                        : ""
                    }`}
                  />

                  anonymous
                </label>

                {!form.is_anonymous && (
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="name"
                    className="w-28 border-b border-white/[0.08] bg-transparent py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                  />
                )}
              </div>

              {status === "error" && (
                <p className="text-[10px] text-[#b7b7b7]">
                  something failed. try again softly.
                </p>
              )}

              <button
                onClick={submitPlace}
                disabled={
                  uploading ||
                  !form.title.trim() ||
                  !form.image_url.trim() ||
                  !form.description.trim()
                }
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {status === "success" ? "stored" : "release"}

                <Send
                  size={10}
                  strokeWidth={1.5}
                  className="transition-transform duration-700 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
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
          scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
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

        .animate-fadeIn {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .line-clamp-1,
        .line-clamp-2,
        .line-clamp-3 {
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

        .line-clamp-3 {
          -webkit-line-clamp: 3;
        }
      `}</style>
    </main>
  );
}

const ControlButton = ({
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

const EmptyPlaces = () => (
  <div className="flex w-full flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] py-20 text-[#666666]">
    <Ghost size={16} strokeWidth={1.5} className="mb-3 opacity-60" />
    <p className="text-[8px] uppercase tracking-[0.22em]">
      nothing is here right now
    </p>
  </div>
);