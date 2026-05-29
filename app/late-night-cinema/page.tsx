"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Film,
  Send,
  X,
  Plus,
  Clapperboard,
  Loader2,
  Sparkles,
  Quote,
  Clock3,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CloudRain,
  ExternalLink,
  MessageCircle,
  Star,
  Ghost,
  Reply,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview?: string | null;
};

type Cinema = {
  id: number;
  title: string | null;
  image_url: string | null;
  overview: string | null;
  release_date: string | null;
  genre: string | null;
  link: string | null;
  quote: string | null;
  review: string | null;
  rating: number | null;
  created_at?: string | null;
};

type Recommendation = {
  id: string;
  title: string;
  link: string;
  poster: string;
  image_url?: string | null;
  overview?: string | null;
  release_date?: string | null;
  reason: string;
  review?: string | null;
  genre: string | null;
  quote: string | null;
  rating?: number | null;
  year: string | null;
  user_name: string | null;
  is_anonymous: boolean | null;
  created_at?: string | null;
};

type CinemaComment = {
  id: string;
  cinema_id: number;
  parent_id: string | null;
  comment: string;
  user_name: string | null;
  is_anonymous: boolean | null;
  created_at?: string | null;
};

type RecommendationComment = {
  id: string;
  recommendation_id: string;
  parent_id: string | null;
  comment: string;
  user_name: string | null;
  is_anonymous: boolean | null;
  created_at?: string | null;
};

type ArchiveItem = {
  id: string;
  source: "cinema" | "recommendation";
  title: string;
  image: string;
  genre: string;
  quote: string;
  review: string;
  overview: string;
  link: string;
  rating: number | null;
  year: string;
  userName: string | null;
  isAnonymous: boolean;
  createdAt: string;
};

type FilterMode = "all" | "cinema" | "recommendation";
type SortMode = "default" | "latest" | "oldest" | "az" | "za" | "rating";

const PAGE_SIZE = 8;
const FOOTER_TEXT =
  "everyone went home early because of the dark sky. i am still sitting here by myself.";

export default function CinemaArchive({ goBack }: { goBack?: () => void }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [cinema, setCinema] = useState<Cinema[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [cinemaComments, setCinemaComments] = useState<CinemaComment[]>([]);
  const [recommendationComments, setRecommendationComments] = useState<
    RecommendationComment[]
  >([]);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);

  const [rainDrops, setRainDrops] = useState<
    { left: string; delay: string; duration: string }[]
  >([]);

  const [form, setForm] = useState({
    reason: "",
    genre: "",
    quote: "",
    review: "",
    user_name: "",
    is_anonymous: true,
    title: "",
    link: "",
    poster: "",
    image_url: "",
    overview: "",
    release_date: "",
    rating: "",
    year: "",
  });

  const [commentForm, setCommentForm] = useState({
    comment: "",
    user_name: "",
    is_anonymous: true,
  });

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchData = useCallback(async () => {
    const [
      { data: cinemaData },
      { data: recData },
      { data: cinemaCommentData },
      { data: recCommentData },
    ] = await Promise.all([
      supabase.from("cinema").select("*").order("id", { ascending: false }),
      supabase
        .from("cinema_recommendations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("cinema_comments")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("cinema_recommendation_comments")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

    setCinema(cinemaData || []);
    setRecs(recData || []);
    setCinemaComments(cinemaCommentData || []);
    setRecommendationComments(recCommentData || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allItems = useMemo<ArchiveItem[]>(() => {
    const cinemaItems = cinema.map((item) => ({
      id: String(item.id),
      source: "cinema" as const,
      title: item.title || "untitled Note",
      image: item.image_url || "",
      genre: item.genre || "quiet",
      quote: item.quote || "",
      review: item.review || "",
      overview: item.overview || "",
      link: item.link || "",
      rating: item.rating,
      year: item.release_date || "",
      userName: null,
      isAnonymous: false,
      createdAt: item.created_at || String(item.id),
    }));

    const recommendationItems = recs.map((item) => ({
      id: item.id,
      source: "recommendation" as const,
      title: item.title || "untitled Note",
      image: item.poster || item.image_url || "",
      genre: item.genre || "quiet",
      quote: item.quote || "",
      review: item.review || item.reason || "",
      overview: item.overview || "",
      link: item.link || "",
      rating: item.rating || null,
      year: item.year || item.release_date || "",
      userName: item.user_name,
      isAnonymous: Boolean(item.is_anonymous),
      createdAt: item.created_at || "",
    }));

    return [...cinemaItems, ...recommendationItems];
  }, [cinema, recs]);

  const getItemComments = useCallback(
    (item: ArchiveItem) => {
      if (item.source === "cinema") {
        return cinemaComments.filter(
          (comment) => comment.cinema_id === Number(item.id)
        );
      }

      return recommendationComments.filter(
        (comment) => comment.recommendation_id === item.id
      );
    },
    [cinemaComments, recommendationComments]
  );

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = allItems.filter((item) => {
      const commentText = getItemComments(item)
        .map((comment) => comment.comment)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.genre.toLowerCase().includes(keyword) ||
        item.quote.toLowerCase().includes(keyword) ||
        item.review.toLowerCase().includes(keyword) ||
        item.overview.toLowerCase().includes(keyword) ||
        commentText.includes(keyword);

      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "cinema" && item.source === "cinema") ||
        (filterMode === "recommendation" &&
          item.source === "recommendation");

      return matchesSearch && matchesFilter;
    });

    const sorted = [...filtered];

    if (sortMode === "default" || sortMode === "latest") {
      sorted.sort((a, b) => {
        const bTime = Date.parse(b.createdAt || "") || Number(b.id) || 0;
        const aTime = Date.parse(a.createdAt || "") || Number(a.id) || 0;
        return bTime - aTime;
      });
    }

    if (sortMode === "oldest") {
      sorted.sort((a, b) => {
        const aTime = Date.parse(a.createdAt || "") || Number(a.id) || 0;
        const bTime = Date.parse(b.createdAt || "") || Number(b.id) || 0;
        return aTime - bTime;
      });
    }

    if (sortMode === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortMode === "za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    if (sortMode === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return sorted;
  }, [allItems, searchTerm, filterMode, sortMode, getItemComments]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const selectedComments = useMemo(() => {
    if (!selectedItem) return [];
    return getItemComments(selectedItem);
  }, [selectedItem, getItemComments]);

  const hasMoreItems = visibleCount < filteredItems.length;
  const isExpanded = visibleCount >= filteredItems.length;

  const resetCollapse = () => setVisibleCount(PAGE_SIZE);

  const filterOrder: FilterMode[] = ["all", "cinema", "recommendation"];

  const cycleFilterMode = () => {
    setFilterMode((current) => {
      const currentIndex = filterOrder.indexOf(current);
      const nextIndex = (currentIndex + 1) % filterOrder.length;
      return filterOrder[nextIndex];
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

  const cycleRatingSort = () => {
    setSortMode((current) => (current === "rating" ? "default" : "rating"));
    resetCollapse();
  };

  const filterIcon =
    filterMode === "cinema" ? (
      <Clapperboard size={11} />
    ) : filterMode === "recommendation" ? (
      <MessageCircle size={11} />
    ) : (
      <SlidersHorizontal size={11} />
    );

  const getFilterLabel = () => {
    if (filterMode === "all") return "all";
    if (filterMode === "cinema") return "by din";
    return "passerby";
  };

  const getSortDateLabel = () => {
    if (sortMode === "latest") return "latest";
    if (sortMode === "oldest") return "oldest";
    return "date";
  };

  const getSortAlphaLabel = () => {
    if (sortMode === "az") return "z to a";
    if (sortMode === "za") return "a to z";
    return "by title";
  };

  const searchMovie = async (value: string) => {
    setQuery(value);

    if (!value || value.length < 2) {
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
    } catch (error) {
      console.error("TMDB error:", error);
    }
  };

  const selectMovie = (movie: Movie) => {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    setForm((prev) => ({
      ...prev,
      title: movie.title,
      poster,
      image_url: poster,
      overview: movie.overview || "",
      release_date: movie.release_date || "",
      year: movie.release_date?.split("-")[0] || "",
      link: `https://www.themoviedb.org/movie/${movie.id}`,
    }));

    setQuery(movie.title);
    setResults([]);
  };

  const handleRatingChange = (value: string) => {
    if (value === "") {
      setForm((prev) => ({ ...prev, rating: "" }));
      return;
    }

    if (/^[1-5]$/.test(value)) {
      setForm((prev) => ({ ...prev, rating: value }));
    }
  };

  const resetForm = () => {
    setForm({
      reason: "",
      genre: "",
      quote: "",
      review: "",
      user_name: "",
      is_anonymous: true,
      title: "",
      link: "",
      poster: "",
      image_url: "",
      overview: "",
      release_date: "",
      rating: "",
      year: "",
    });

    setQuery("");
    setResults([]);
  };

  const submitRec = async () => {
    if (!form.title || !form.reason.trim() || isSubmitting) return;

    const ratingValue = form.rating ? Number(form.rating) : null;

    if (
      ratingValue !== null &&
      (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("cinema_recommendations").insert([
        {
          title: form.title,
          reason: form.reason,
          genre: form.genre,
          quote: form.quote,
          review: form.review,
          link: form.link,
          poster: form.poster,
          image_url: form.image_url,
          overview: form.overview,
          release_date: form.release_date,
          rating: ratingValue,
          year: form.year,
          user_name: form.is_anonymous ? null : form.user_name || null,
          is_anonymous: form.is_anonymous,
        },
      ]);

      if (error) throw error;

      resetForm();
      setOpen(false);
      await fetchData();
      resetCollapse();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComment = async (parentId: string | null = null) => {
    if (!selectedItem || !commentForm.comment.trim() || isCommenting) return;

    setIsCommenting(true);

    try {
      if (selectedItem.source === "cinema") {
        const { error } = await supabase.from("cinema_comments").insert([
          {
            cinema_id: Number(selectedItem.id),
            parent_id: parentId,
            comment: commentForm.comment.trim(),
            user_name: commentForm.is_anonymous
              ? null
              : commentForm.user_name || null,
            is_anonymous: commentForm.is_anonymous,
          },
        ]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cinema_recommendation_comments")
          .insert([
            {
              recommendation_id: selectedItem.id,
              parent_id: parentId,
              comment: commentForm.comment.trim(),
              user_name: commentForm.is_anonymous
                ? null
                : commentForm.user_name || null,
              is_anonymous: commentForm.is_anonymous,
            },
          ]);

        if (error) throw error;
      }

      setCommentForm({
        comment: "",
        user_name: "",
        is_anonymous: true,
      });

      setReplyTargetId(null);
      await fetchData();
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const renderComments = (parentId: string | null = null, level = 0) => {
    const list = selectedComments.filter(
      (comment) => comment.parent_id === parentId
    );

    if (list.length === 0 && level === 0) {
      return (
        <p className="rounded-2xl border border-white/[0.045] bg-white/[0.016] p-4 text-[11px] text-[#666666]">
          nothing is here right now
        </p>
      );
    }

    return list.map((comment) => (
      <div
        key={comment.id}
        className={`${
          level > 0 ? "ml-4 border-l border-white/[0.055] pl-3" : ""
        }`}
      >
        <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-[#777777]">
              {comment.is_anonymous
                ? "anonymous"
                : comment.user_name || "someone"}
            </p>

            <button
              type="button"
              onClick={() =>
                setReplyTargetId((current) =>
                  current === comment.id ? null : comment.id
                )
              }
              className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.18em] text-[#666666] transition-colors hover:text-white"
            >
              <Reply size={9} />
              reply
            </button>
          </div>

          <p className="text-[12px] leading-relaxed text-[#d0d0d0]">
            {comment.comment}
          </p>

          {replyTargetId === comment.id && (
            <div className="mt-4 space-y-3 border-t border-white/[0.045] pt-4">
              <textarea
                value={commentForm.comment}
                onChange={(event) =>
                  setCommentForm({
                    ...commentForm,
                    comment: event.target.value,
                  })
                }
                placeholder="type a thought..."
                className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3 text-[11px] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

              <CommentIdentity
                form={commentForm}
                setForm={setCommentForm}
                disabled={isCommenting}
                onSubmit={() => submitComment(comment.id)}
              />
            </div>
          )}
        </div>

        <div className="mt-3 space-y-3">{renderComments(comment.id, level + 1)}</div>
      </div>
    ));
  };

  return (
    <main
      className={`${inter.className} relative flex min-h-screen flex-col overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
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

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => (goBack ? goBack() : router.push("/"))}
            className="group hidden shrink-0 items-center gap-2 justify-self-start text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 md:flex md:text-[9px]"
          >
            <ArrowLeft
              size={12}
              className="transition-transform duration-700 group-hover:-translate-x-1"
            />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group col-start-1 row-start-1 flex min-w-0 flex-col items-start justify-self-start text-left md:col-start-2 md:items-center md:justify-self-center md:text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>
            <span className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[260px] sm:text-[8px]">
              late night cinema
            </span>
          </button>

          <button
            onClick={() => setOpen(true)}
            className="group col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px] md:col-start-3"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            <span className="hidden sm:inline">add scene</span>
            <span className="sm:hidden">add</span>
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto flex-1 max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-14 max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
              foggy windows
            </p>
          </div>

          <h1 className="text-[26px] font-light leading-[1.1] tracking-[-0.05em] text-white/90 sm:text-[34px] md:text-[42px]">
            just some old tapes i left on the table that i do not watch anymore.
          </h1>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} className="stroke-[1.5px]" />
              <span>no one is around anymore.</span>
            </div>
          </div>
        </header>

        <section id="cinema-list" className="scroll-mt-36">
          <ShelfHeader
            title="SCENE SHELF"
            count={`${filteredItems.length} shown · ${allItems.length} saved`}
          />

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,auto)]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search
                size={12}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]"
              />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetCollapse();
                }}
                placeholder="type a word to find something..."
                className="w-full rounded-full border border-white/[0.045] bg-white/[0.016] py-3 pl-10 pr-4 text-[11px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />
            </div>

            <ControlButton
              active={filterMode !== "all"}
              icon={filterIcon}
              label={getFilterLabel()}
              onClick={cycleFilterMode}
            />

            <ControlButton
              active={sortMode === "latest" || sortMode === "oldest"}
              icon={<Clock3 size={11} />}
              label={getSortDateLabel()}
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
              label={getSortAlphaLabel()}
              onClick={cycleAlphabetSort}
            />

            <ControlButton
              active={sortMode === "rating"}
              icon={<Star size={11} />}
              label="by rating"
              onClick={cycleRatingSort}
            />
          </div>

          {visibleItems.length === 0 ? (
            <EmptyShelf />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {visibleItems.map((item, index) => {
                  const count = getItemComments(item).length;

                  return (
                    <button
                      key={`${item.source}-${item.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedItem(item);
                        setReplyTargetId(null);
                        setCommentForm({
                          comment: "",
                          user_name: "",
                          is_anonymous: true,
                        });
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] text-left shadow-[0_16px_45px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.026]"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover grayscale opacity-75 transition-all duration-1000 group-hover:scale-[1.04] group-hover:opacity-40"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#5f5f5f]">
                            <Film size={16} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-40" />

                        <div className="absolute inset-0 z-20 flex translate-y-4 flex-col justify-end bg-black/80 p-3 opacity-0 backdrop-blur-sm transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="mb-3 space-y-2">
                            {item.quote ? (
                              <div>
                                <div className="mb-1 flex items-center gap-1.5 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                                  <Quote size={8} />
                                  dialogue
                                </div>
                                <p className="line-clamp-3 text-[10px] leading-relaxed text-[#dcdcdc]">
                                  “{item.quote}”
                                </p>
                              </div>
                            ) : (
                              <p className="text-[10px] leading-relaxed text-[#777777]">
                                no lines written down for this one.
                              </p>
                            )}

                            <div>
                              <div className="mb-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                                personal note
                              </div>
                              <p className="line-clamp-4 text-[10px] leading-relaxed text-[#bdbdbd]">
                                {item.review || item.overview || "write down your thoughts about it..."}
                              </p>
                            </div>
                          </div>

                          <span className="w-fit rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[7px] uppercase tracking-[0.16em] text-[#bdbdbd]">
                            look further
                          </span>
                        </div>

                        <span className="absolute right-2 top-2 z-30 rounded-full border border-white/[0.055] bg-black/70 px-2 py-1 text-[7px] tracking-[0.16em] text-[#cfcfcf] backdrop-blur-md">
                          {item.rating
                            ? `${item.rating}/5`
                            : String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="absolute bottom-0 left-0 right-0 z-10 p-3 transition-opacity duration-700 group-hover:opacity-0">
                          <p className="mb-1 text-[7px] uppercase tracking-[0.2em] text-[#8d8d8d]">
                            {item.genre}
                          </p>
                          <p className="line-clamp-2 text-[9px] uppercase tracking-[0.18em] text-white">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 text-[7px] uppercase tracking-[0.16em] text-[#666666]">
                        <span>
                          {item.source === "cinema"
                            ? "by din"
                            : item.isAnonymous
                            ? "anonymous"
                            : item.userName || "someone"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={9} />
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredItems.length > PAGE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMoreItems && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((prev) =>
                          Math.min(prev + PAGE_SIZE, filteredItems.length)
                        )
                      }
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      look further
                      <ChevronDown size={11} />
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCollapse();
                        document
                          .getElementById("cinema-list")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75"
                    >
                      draw back
                      <ChevronUp size={11} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="animate-fade-in fixed inset-0 z-[420] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-5 top-5 z-20 text-[#666666] transition-colors hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="grid gap-6 md:grid-cols-[190px_1fr]">
              <div className="relative mx-auto w-full max-w-[190px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025]">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="h-[285px] w-full object-cover grayscale opacity-80"
                  />
                ) : (
                  <div className="flex h-[285px] items-center justify-center text-[#666666]">
                    <Film size={24} />
                  </div>
                )}
              </div>

              <div className="min-w-0 text-center md:text-left">
                <p className="text-[8px] uppercase tracking-[0.24em] text-[#777777]">
                  {selectedItem.source === "cinema" ? "by din" : "passerby"}
                </p>

                <h2 className="mt-3 text-[26px] font-light leading-tight tracking-[-0.05em] text-white/90">
                  {selectedItem.title}
                </h2>

                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  <span className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                    {selectedItem.genre}
                  </span>

                  {selectedItem.rating && (
                    <span className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                      {selectedItem.rating}/5
                    </span>
                  )}

                  {selectedItem.year && (
                    <span className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                      {selectedItem.year}
                    </span>
                  )}
                </div>

                {selectedItem.quote && (
                  <div className="mt-5 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                    <div className="mb-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                      <Quote size={12} />
                      dialogue
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#d6d6d6]">
                      “{selectedItem.quote}”
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                  <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                    personal note
                  </p>
                  <p className="text-[12px] leading-relaxed text-[#cfcfcf]">
                    {selectedItem.review ||
                      selectedItem.overview ||
                      "write down your thoughts about it..."}
                  </p>
                </div>

                {selectedItem.link && (
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#888888] transition-colors hover:text-white"
                  >
                    open link
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-7 border-t border-white/[0.055] pt-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={13} className="text-[#777777]" />
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/80">
                  replies
                </h3>
              </div>

              <div className="mb-5 space-y-3">{renderComments()}</div>

              {!replyTargetId && (
                <div className="space-y-3 rounded-2xl border border-white/[0.055] bg-white/[0.018] p-4">
                  <textarea
                    value={commentForm.comment}
                    onChange={(event) =>
                      setCommentForm({
                        ...commentForm,
                        comment: event.target.value,
                  })
                }
                    placeholder="type a short thought..."
                    className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3 text-[11px] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                  />

                  <CommentIdentity
                    form={commentForm}
                    setForm={setCommentForm}
                    disabled={isCommenting}
                    onSubmit={() => submitComment(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          onClick={() => !isSubmitting && setOpen(false)}
        >
          <div
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => !isSubmitting && setOpen(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors hover:text-white"
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
                add scene
              </h2>

              <p className="mt-2 text-[11px] leading-relaxed text-[#777777]">
                put down something small so it stays here after you close the tab.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-0 top-3 text-[#666666]"
                />

                <input
                  value={query}
                  onChange={(event) => searchMovie(event.target.value)}
                  placeholder="type a movie name..."
                  className="w-full border-b border-white/[0.08] bg-transparent py-2.5 pl-5 text-[12px] text-white/85 outline-none placeholder:text-[#666666] focus:border-white/20"
                />
              </div>

              {results.length > 0 && (
                <div className="scrollbar-hide grid max-h-40 gap-2 overflow-y-auto">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className="flex items-center justify-between rounded-xl border border-white/[0.045] bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0]">
                        {movie.title}
                      </p>

                      <span className="text-[7px] tracking-[0.18em] text-[#666666]">
                        {movie.release_date?.split("-")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {form.title && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3">
                  <div className="h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-black">
                    {form.poster ? (
                      <img
                        src={form.poster}
                        className="h-full w-full object-cover grayscale"
                        alt={form.title}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#666666]">
                        <Film size={10} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] uppercase tracking-[0.18em] text-white">
                      {form.title}
                    </p>

                    <p className="mt-1 text-[7px] tracking-[0.18em] text-[#666666]">
                      {form.year}
                    </p>
                  </div>
                </div>
              )}

              <textarea
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
                placeholder="why should this movie stay here?"
                className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

              <textarea
                value={form.quote}
                onChange={(event) =>
                  setForm({ ...form, quote: event.target.value })
                }
                placeholder="a line you still keep..."
                className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  value={form.genre}
                  onChange={(event) =>
                    setForm({ ...form, genre: event.target.value })
                  }
                  placeholder="genre"
                  className="border-b border-white/[0.08] bg-transparent py-2 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />

                <input
                  value={form.rating}
                  onChange={(event) => handleRatingChange(event.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  pattern="[1-5]"
                  placeholder="rating 1-5"
                  className="border-b border-white/[0.08] bg-transparent py-2 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />
              </div>

              <textarea
                value={form.review}
                onChange={(event) =>
                  setForm({ ...form, review: event.target.value })
                }
                placeholder="review or personal note..."
                className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

            <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    is_anonymous: !prev.is_anonymous,
                  }))
                }
                className="flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] transition-colors hover:text-white"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full border border-white/[0.18] ${
                    form.is_anonymous
                      ? "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                      : ""
                  }`}
                />
                anonymous
              </button>

              {!form.is_anonymous && (
                <input
                  value={form.user_name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      user_name: event.target.value,
                    }))
                  }
                  placeholder="your name"
                  className="ml-auto w-32 border-0 border-b border-b-white/[0.08] bg-transparent px-0 py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-right placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#666666] focus:border-white/20 focus:ring-0"
                />
              )}
            </div>

              <button
                onClick={submitRec}
                disabled={isSubmitting || !form.title || !form.reason.trim()}
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] transition-all hover:border-white/15 hover:text-white disabled:opacity-20"
              >
                {isSubmitting ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  "release"
                )}
                <Send size={10} />
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
        .line-clamp-2,
        .line-clamp-3,
        .line-clamp-4 {
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

        .line-clamp-4 {
          -webkit-line-clamp: 4;
        }

        html {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.03);
        }

        body {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.03);
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 8px;
        }

        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
        }

        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.14);
          border-radius: 999px;
          border: 2px solid #020202;
        }

        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.22);
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

const CommentIdentity = ({
  form,
  setForm,
  disabled,
  onSubmit,
}: {
  form: {
    comment: string;
    user_name: string;
    is_anonymous: boolean;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      comment: string;
      user_name: string;
      is_anonymous: boolean;
    }>
  >;
  disabled: boolean;
  onSubmit: () => void;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-1 items-center justify-between gap-3">
      <button
        type="button"
        onClick={() =>
          setForm((prev) => ({
            ...prev,
            is_anonymous: !prev.is_anonymous,
          }))
        }
        className="flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] transition-colors hover:text-white"
      >
        <span
          className={`h-2.5 w-2.5 rounded-full border border-white/[0.18] ${
            form.is_anonymous ? "bg-white/60" : ""
          }`}
        />
        anonymous
      </button>

      {!form.is_anonymous && (
        <input
          value={form.user_name}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              user_name: event.target.value,
            }))
          }
          placeholder="your name"
          className="ml-auto w-32 border-0 border-b border-b-white/[0.08] bg-transparent px-0 py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-right placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#666666] focus:border-white/20 focus:ring-0"
        />
      )}
    </div>

    <button
      type="button"
      disabled={disabled || !form.comment.trim()}
      onClick={onSubmit}
      className="flex items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] transition-colors hover:text-white disabled:opacity-20"
    >
      {disabled ? <Loader2 size={10} className="animate-spin" /> : "send"}
      <Send size={10} />
    </button>
  </div>
);

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

const EmptyShelf = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] px-4 py-20 text-center text-[#666666]">
    <Clapperboard size={16} className="mb-3 opacity-50 stroke-[1.5px]" />

    <p className="text-[8px] uppercase tracking-[0.22em]">
      nothing is here right now
    </p>
  </div>
);