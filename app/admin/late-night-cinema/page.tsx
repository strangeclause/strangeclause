"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaEdit, FaImage, FaTrash } from "react-icons/fa";
import {
  ArrowLeft,
  Film,
  Ghost,
  Search,
  Upload,
  X,
  Loader2,
  Plus,
  Sparkles,
  CloudRain,
  ChevronDown,
  ChevronUp,
  UserRound,
  MessageCircle,
  Send,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
};

type Cinema = {
  id: number;
  title: string;
  image_url: string | null;
  genre: string | null;
  quote: string | null;
  review: string | null;
  rating: number | null;
  overview: string | null;
  release_date: string | null;
  link: string | null;
};

type CinemaRecommendation = {
  id: string;
  title: string;
  link: string | null;
  poster: string | null;
  image_url?: string | null;
  year: string | null;
  reason: string | null;
  quote: string | null;
  genre?: string | null;
  mood?: string | null;
  user_name: string | null;
  is_anonymous: boolean | null;
  rating?: number | null;
  created_at: string | null;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

type CardItem = {
  id: string;
  title: string;
  image: string;
  genre: string;
  quote: string;
  rating: number;
  source: "cinema" | "recommendation";
  user: string;
};

const CINEMA_COLLAPSE_SIZE = 10;
const REC_COLLAPSE_SIZE = 10;

export default function CinemaAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cinema, setCinema] = useState<Cinema[]>([]);
  const [recommendations, setRecommendations] = useState<
    CinemaRecommendation[]
  >([]);

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [cinemaVisibleCount, setCinemaVisibleCount] =
    useState(CINEMA_COLLAPSE_SIZE);
  const [recVisibleCount, setRecVisibleCount] = useState(REC_COLLAPSE_SIZE);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    uploaded_image_url: "",
    overview: "",
    release_date: "",
    genre: "",
    link: "",
    quote: "",
    review: "",
    rating: 0,
  });


  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchCinema = async () => {
    const { data, error } = await supabase
      .from("cinema")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("cinema fetch error:", error);
      return;
    }

    setCinema(data || []);
  };

  const fetchRecommendations = async () => {
    const { data, error } = await supabase
      .from("cinema_recommendations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("recommendations fetch error:", error);
      return;
    }

    setRecommendations(data || []);
  };

  useEffect(() => {
    fetchCinema();
    fetchRecommendations();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      image_url: "",
      uploaded_image_url: "",
      overview: "",
      release_date: "",
      genre: "",
      link: "",
      quote: "",
      review: "",
      rating: 0,
    });

    setQuery("");
    setResults([]);
    setEditingId(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetCollapse = () => {
    setCinemaVisibleCount(CINEMA_COLLAPSE_SIZE);
    setRecVisibleCount(REC_COLLAPSE_SIZE);
  };

  const searchMovie = async (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          value
        )}&api_key=8d314751e43387fa2ea52b62958d2ef9`
      );

      const data = await res.json();
      setResults(data.results?.slice(0, 6) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectMovie = (movie: Movie) => {
    setForm((prev) => ({
      ...prev,
      title: movie.title,
      image_url: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "",
      uploaded_image_url: "",
      overview: movie.overview || "",
      release_date: movie.release_date || "",
      link: `https://www.themoviedb.org/movie/${movie.id}`,
    }));

    setQuery(movie.title);
    setResults([]);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoadingImg(true);

    const filePath = `cinema-uploads/${Date.now()}-${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("cinema-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("cinema-uploads")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        uploaded_image_url: data.publicUrl,
        image_url: "",
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImg(false);
    }
  };

  const submit = async () => {
    if (!form.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const finalImageUrl = form.uploaded_image_url || form.image_url;

    const payload = {
      title: form.title,
      genre: form.genre,
      quote: form.quote,
      review: form.review,
      rating: form.rating,
      image_url: finalImageUrl,
      overview: form.overview,
      release_date: form.release_date,
      link: form.link,
    };

    try {
      if (editingId) {
        await supabase.from("cinema").update(payload).eq("id", editingId);
      } else {
        await supabase.from("cinema").insert(payload);
      }

      setOpen(false);
      resetForm();
      fetchCinema();
      resetCollapse();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editCinema = (item: Cinema) => {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      image_url: item.image_url || "",
      uploaded_image_url: "",
      overview: item.overview || "",
      release_date: item.release_date || "",
      genre: item.genre || "",
      link: item.link || "",
      quote: item.quote || "",
      review: item.review || "",
      rating: item.rating || 0,
    });

    setOpen(true);
  };

  const deleteCinema = async (id: number) => {
    if (!confirm("Erase this film from late night cinema?")) return;

    await supabase.from("cinema").delete().eq("id", id);
    fetchCinema();
  };

  const deleteRecommendation = async (id: string) => {
    if (!confirm("Erase this recommendation from late night cinema?")) return;

    await supabase.from("cinema_recommendations").delete().eq("id", id);
    fetchRecommendations();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    resetCollapse();
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCinema = cinema.filter((item) => {
    if (!normalizedSearch) return true;

    return [
      item.title,
      item.genre,
      item.quote,
      item.review,
      item.overview,
      item.release_date,
      item.link,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const filteredRecommendations = recommendations.filter((item) => {
    if (!normalizedSearch) return true;

    return [
      item.title,
      item.genre,
      item.mood,
      item.quote,
      item.reason,
      item.user_name,
      item.year,
      item.link,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const visibleCinema = filteredCinema.slice(0, cinemaVisibleCount);
  const visibleRecommendations = filteredRecommendations.slice(
    0,
    recVisibleCount
  );

  const cinemaHasMore = cinemaVisibleCount < filteredCinema.length;
  const cinemaExpanded =
    filteredCinema.length > 0 && cinemaVisibleCount >= filteredCinema.length;

  const recHasMore = recVisibleCount < filteredRecommendations.length;
  const recExpanded =
    filteredRecommendations.length > 0 &&
    recVisibleCount >= filteredRecommendations.length;

  const showMoreCinema = () => {
    setCinemaVisibleCount((prev) =>
      Math.min(prev + CINEMA_COLLAPSE_SIZE, filteredCinema.length)
    );
  };

  const showMoreRecommendations = () => {
    setRecVisibleCount((prev) =>
      Math.min(prev + REC_COLLAPSE_SIZE, filteredRecommendations.length)
    );
  };

  const collapseCinema = () => {
    setCinemaVisibleCount(CINEMA_COLLAPSE_SIZE);

    document
      .getElementById("cinema-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const collapseRecommendations = () => {
    setRecVisibleCount(REC_COLLAPSE_SIZE);

    document
      .getElementById("recommendation-section")
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

            <span className="hidden max-w-[320px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              late night cinema
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
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / late night cinema
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              films and quiet scenes
              <br />
              that stayed longer than expected.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some frames stay because the heart keeps replaying them.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <Film size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {cinema.length + recommendations.length} saved scenes
            </p>

             <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              Keep the gallery small on first view. Let the rest unfold slowly.
            </p>
          </aside>
        </header>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search
              size={12}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]"
            />

            <input
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="search title, genre, quote, review, user..."
              className="w-full rounded-full border border-white/[0.045] bg-white/[0.016] py-3 pl-10 pr-10 text-[11px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] transition-colors hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <section id="cinema-section" className="scroll-mt-36">
          <ShelfHeader
            title="SAVED CINEMA"
            count={`${visibleCinema.length} shown · ${filteredCinema.length} matched · ${cinema.length} saved`}
          />

          {filteredCinema.length === 0 ? (
            <EmptyCinema text="no films saved in this shelf yet" />
          ) : (
            <>
              <SmallCinemaGrid>
                {visibleCinema.map((item, index) => (
                  <CinemaCard
                    key={`cinema-${item.id}`}
                    index={index}
                    item={{
                      id: String(item.id),
                      title: item.title,
                      image: item.image_url || "",
                      genre: item.genre || "unlabeled",
                      quote: item.quote || item.review || item.overview || "",
                      rating: item.rating || 0,
                      source: "cinema",
                      user: "admin saved",
                    }}
                    showEdit
                    onEdit={() => editCinema(item)}
                    onDelete={() => deleteCinema(item.id)}
                  />
                ))}
              </SmallCinemaGrid>

              {filteredCinema.length > CINEMA_COLLAPSE_SIZE && (
                <CollapseButtons
                  hasMore={cinemaHasMore}
                  expanded={cinemaExpanded}
                  onShowMore={showMoreCinema}
                  onCollapse={collapseCinema}
                />
              )}
            </>
          )}
        </section>

        <section id="recommendation-section" className="mt-14 scroll-mt-36">
          <ShelfHeader
            title="VISITOR RECOMMENDATIONS"
            count={`${visibleRecommendations.length} shown · ${filteredRecommendations.length} matched · ${recommendations.length} saved`}
          />

          {filteredRecommendations.length === 0 ? (
            <EmptyCinema text="no visitor recommendations saved yet" />
          ) : (
            <>
              <SmallCinemaGrid>
                {visibleRecommendations.map((item, index) => (
                  <CinemaCard
                    key={`recommendation-${item.id}`}
                    index={index}
                    item={{
                      id: item.id,
                      title: item.title,
                      image: item.poster || item.image_url || "",
                      genre: item.genre || item.mood || "unlabeled",
                      quote: item.quote || item.reason || "",
                      rating: item.rating || 0,
                      source: "recommendation",
                      user: item.is_anonymous
                        ? "anonymous"
                        : item.user_name || "unnamed",
                    }}
                    showEdit={false}
                    onDelete={() => deleteRecommendation(item.id)}
                  />
                ))}
              </SmallCinemaGrid>

              {filteredRecommendations.length > REC_COLLAPSE_SIZE && (
                <CollapseButtons
                  hasMore={recHasMore}
                  expanded={recExpanded}
                  onShowMore={showMoreRecommendations}
                  onCollapse={collapseRecommendations}
                />
              )}
            </>
          )}
        </section>
      </div>

      {open && (
        <div
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
          onClick={() => !isSubmitting && setOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="modal-scroll relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6 md:p-8"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            <button
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3 shadow-[0_0_24px_rgba(255,255,255,0.035)]">
                  <Film
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                {editingId ? "edit film" : "add film"}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-[#777777]">
                put down one quiet scene so it stays here after you close the tab.
              </p>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={12}
                  strokeWidth={1.5}
                  className="absolute left-0 top-3 text-[#666666]"
                />

                <input
                  value={query}
                  onChange={(event) => searchMovie(event.target.value)}
                  placeholder="search tmdb..."
                  className="w-full border-b border-white/[0.07] bg-transparent py-2.5 pl-5 text-[12px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/20"
                />
              </div>

              {results.length > 0 && (
                <div className="modal-inner-scroll mt-3 grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-white/[0.045] bg-black/20 p-2 sm:grid-cols-2">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.045] bg-white/[0.02] p-2.5 text-left transition-all duration-700 hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          className="h-12 w-8 rounded-md object-cover grayscale opacity-75"
                          alt=""
                        />
                      ) : (
                        <div className="flex h-12 w-8 items-center justify-center rounded-md bg-white/[0.04] text-[#666666]">
                          <Film size={10} strokeWidth={1.5} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0]">
                          {movie.title}
                        </p>

                        <p className="mt-1 text-[8px] text-[#777777]">
                          {movie.release_date?.split("-")[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04]"
                >
                  {form.image_url || form.uploaded_image_url ? (
                    <img
                      src={form.uploaded_image_url || form.image_url}
                      className="h-full w-full object-cover grayscale opacity-75 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                      alt=""
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-[#777777]">
                      {loadingImg ? (
                        <Loader2
                          size={18}
                          strokeWidth={1.5}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload size={18} strokeWidth={1.5} />
                      )}

                      <p className="text-[8px] uppercase tracking-[0.22em]">
                        {loadingImg ? "uploading..." : "upload poster"}
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="movie title"
                  className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[12px] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
                />

                <div className="relative">
                  <input
                    value={form.genre}
                    onChange={(event) =>
                      setForm({ ...form, genre: event.target.value })
                    }
                    placeholder="genre"
                    className="w-full border-b border-white/[0.07] bg-transparent py-2.5 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/20"
                  />
                </div>

                <textarea
                  value={form.quote}
                  onChange={(event) =>
                    setForm({ ...form, quote: event.target.value })
                  }
                  placeholder="a line that stayed..."
                  className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
                />

                <textarea
                  value={form.review}
                  onChange={(event) =>
                    setForm({ ...form, review: event.target.value })
                  }
                  placeholder="what did this film leave behind?"
                  className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    value={form.release_date}
                    onChange={(event) =>
                      setForm({ ...form, release_date: event.target.value })
                    }
                    placeholder="date"
                    className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                  />

                  <input
                    value={form.link}
                    onChange={(event) =>
                      setForm({ ...form, link: event.target.value })
                    }
                    placeholder="link"
                    className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
                  <span className="text-[8px] uppercase tracking-[0.18em] text-[#777777]">
                    rating
                  </span>

                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setForm({ ...form, rating: n })}
                        className={`text-sm transition-all duration-500 ${
                          form.rating >= n
                            ? "scale-110 text-white"
                            : "text-white/15 hover:text-white/45"
                        }`}
                      >
                        ●
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
                  <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                    quiet draft
                  </p>

                  <button
                    onClick={submit}
                    disabled={isSubmitting || !form.title.trim()}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    {isSubmitting && (
                      <Loader2
                        size={10}
                        strokeWidth={1.5}
                        className="animate-spin"
                      />
                    )}

                    {!isSubmitting && (
                      <Send
                        size={10}
                        strokeWidth={1.5}
                        className="transition-transform duration-700 group-hover:translate-x-0.5"
                      />
                    )}

                    {editingId ? "update" : "release"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-14 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          films and quiet scenes that stayed longer than expected.
        </p>
      </footer>

      <GlobalStyles />
    </main>
  );
}

function SmallCinemaGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {children}
    </div>
  );
}

function CinemaCard({
  item,
  index,
  onEdit,
  onDelete,
  showEdit,
}: {
  item: CardItem;
  index: number;
  onEdit?: () => void;
  onDelete: () => void;
  showEdit: boolean;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 45}ms` }}
      className="group animate-fade-in relative overflow-hidden rounded-[20px] border border-white/[0.04] bg-white/[0.012] shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
    >
      <div className="relative aspect-[0.72] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover grayscale opacity-72 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#666666]">
            <FaImage size={18} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute right-2 top-2 z-30 flex gap-1.5 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
          {showEdit && onEdit && (
            <button
              onClick={onEdit}
              className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
            >
              <FaEdit size={9} />
            </button>
          )}

          <button
            onClick={onDelete}
            className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
          >
            <FaTrash size={9} />
          </button>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
          <div className="mb-1.5 flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/70 px-2 py-0.5 text-[5.8px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
            {item.source === "recommendation" ? (
              <MessageCircle size={8} strokeWidth={1.5} />
            ) : (
              <Film size={8} strokeWidth={1.5} />
            )}

            <span className="truncate">{item.genre}</span>
          </div>

          <h3 className="line-clamp-2 text-[11px] font-light leading-snug tracking-[-0.03em] text-white">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="space-y-2.5 p-2.5">
        <p className="line-clamp-1 text-[6px] uppercase tracking-[0.18em] text-[#777777]">
          {item.user}
        </p>

        <p className="line-clamp-3 text-[9px] leading-relaxed text-[#8d8d8d] transition-colors duration-700 group-hover:text-[#f1f1f1]">
          “{item.quote || "no words left here"}”
        </p>

        <div className="flex items-center justify-between border-t border-white/[0.07] pt-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 w-1 rounded-full ${
                  item.rating && i < item.rating ? "bg-white/60" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-[6px] uppercase tracking-[0.16em] text-[#666666]">
            <UserRound size={8} strokeWidth={1.5} />
            {item.source === "recommendation" ? "visitor" : "main"}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapseButtons({
  hasMore,
  expanded,
  onShowMore,
  onCollapse,
}: {
  hasMore: boolean;
  expanded: boolean;
  onShowMore: () => void;
  onCollapse: () => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {hasMore && (
        <button type="button" onClick={onShowMore} className="CollapseBtn">
          show more
          <ChevronDown size={11} strokeWidth={1.5} />
        </button>
      )}

      {expanded && (
        <button type="button" onClick={onCollapse} className="CollapseBtn">
          fold again
          <ChevronUp size={11} strokeWidth={1.5} />
        </button>
      )}
    </div>
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

const ShelfHeader = ({ title, count }: { title: string; count: string }) => (
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

const EmptyCinema = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
    <Film size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

    <p className="text-[8px] uppercase tracking-[0.22em]">{text}</p>
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


    .modal-scroll::-webkit-scrollbar,
    .modal-inner-scroll::-webkit-scrollbar {
      display: none;
    }

    .modal-scroll,
    .modal-inner-scroll {
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