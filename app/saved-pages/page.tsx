"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Send,
  Sparkles,
  X,
  Plus,
  Loader2,
  Quote,
  Clock3,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  Ghost,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  CloudRain,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type BookResult = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
};

type BookRecommendation = {
  id: number;
  title: string;
  author: string;
  genre: string;
  cover: string;
  book_url: string;
  favorite_character: string;
  character_reason: string;
  favorite_quote: string;
  review: string;
  username: string | null;
  is_anonymous: boolean;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

type FilterMode = "all" | "anonymous" | "named" | "genre" | "character";
type SortMode = "default" | "latest" | "oldest" | "az" | "za";

const PAGE_SIZE = 8;
const STORAGE_BUCKET = "stranger-uploads";
const FOOTER_TEXT =
  "everyone went home early because of the dark sky. i am still sitting here by myself.";

export default function SavedPagesPage({ goBack }: { goBack?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [results, setResults] = useState<BookResult[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRecommendation | null>(
    null
  );
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    cover: "",
    book_url: "",
    favorite_character: "",
    character_reason: "",
    favorite_quote: "",
    review: "",
    username: "",
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

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("book_recommendations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Failed to fetch saved pages:", error);
      return;
    }

    setBooks(data || []);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = books.filter((book) => {
      const matchesSearch =
        !keyword ||
        book.title?.toLowerCase().includes(keyword) ||
        book.author?.toLowerCase().includes(keyword) ||
        book.genre?.toLowerCase().includes(keyword) ||
        book.favorite_character?.toLowerCase().includes(keyword) ||
        book.favorite_quote?.toLowerCase().includes(keyword) ||
        book.review?.toLowerCase().includes(keyword) ||
        book.username?.toLowerCase().includes(keyword);

      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "anonymous" && book.is_anonymous) ||
        (filterMode === "named" && !book.is_anonymous) ||
        (filterMode === "genre" && Boolean(book.genre?.trim())) ||
        (filterMode === "character" &&
          Boolean(book.favorite_character?.trim()));

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
  }, [books, searchTerm, filterMode, sortMode]);

  const visibleBooks = filteredBooks.slice(0, visibleCount);
  const hasMoreBooks = visibleCount < filteredBooks.length;
  const isExpanded =
    filteredBooks.length > 0 && visibleCount >= filteredBooks.length;

  const resetCollapse = () => setVisibleCount(PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetCollapse();
  };

  const cycleFilterMode = () => {
    setFilterMode((current) => {
      if (current === "all") return "anonymous";
      if (current === "anonymous") return "named";
      if (current === "named") return "genre";
      if (current === "genre") return "character";
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

  const showMoreBooks = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBooks.length));
  };

  const collapseBooks = () => {
    setVisibleCount(PAGE_SIZE);
    document
      .getElementById("books-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterIcon =
    filterMode === "anonymous" ? (
      <Ghost size={11} />
    ) : filterMode === "named" ? (
      <User size={11} />
    ) : filterMode === "genre" ? (
      <Tag size={11} />
    ) : filterMode === "character" ? (
      <BookOpen size={11} />
    ) : (
      <SlidersHorizontal size={11} />
    );

  const filterLabel =
    filterMode === "anonymous"
      ? "anonymous"
      : filterMode === "named"
      ? "named"
      : filterMode === "genre"
      ? "genre"
      : filterMode === "character"
      ? "character"
      : "all";

  const searchBook = async (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          value
        )}&limit=6`
      );

      const data = await res.json();
      setResults(data.docs || []);
    } catch (error) {
      console.error("OpenLibrary search error:", error);
    }
  };

  const selectBook = (book: BookResult) => {
    const author = book.author_name?.[0] || "unknown author";
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : "";

    setForm((prev) => ({
      ...prev,
      title: book.title,
      author,
      cover,
      book_url: `https://openlibrary.org${book.key}`,
    }));

    setQuery(`${book.title} — ${author}`);
    setResults([]);
  };

  const uploadCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingCover(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `books/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        cover: data.publicUrl,
      }));
    } catch (error) {
      console.error("Cover upload error:", error);
      setStatus("error");
    } finally {
      setUploadingCover(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      genre: "",
      cover: "",
      book_url: "",
      favorite_character: "",
      character_reason: "",
      favorite_quote: "",
      review: "",
      username: "",
      is_anonymous: true,
    });

    setQuery("");
    setResults([]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitBook = async () => {
    if (!form.title || !form.review.trim() || status === "submitting") return;

    setStatus("submitting");

    try {
      const { error } = await supabase.from("book_recommendations").insert([
        {
          ...form,
          username: form.is_anonymous ? null : form.username || null,
        },
      ]);

      if (error) throw error;

      setStatus("success");
      resetForm();
      fetchBooks();
      resetCollapse();

      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 900);
    } catch (error) {
      console.error("Submit saved page error:", error);
      setStatus("error");
    }
  };

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => (goBack ? goBack() : router.push("/"))}
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
            <span className="hidden max-w-[280px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              saved pages
            </span>
          </button>

          <button
            onClick={() => setOpen(true)}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            add page
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-14 max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
              foggy windows 
            </p>
          </div>

          <h1 className="text-[26px] font-light leading-[1.1] tracking-[-0.05em] text-white/90 sm:text-[34px] md:text-[42px]">
            i kept these books open but i never turned to the next side.
          </h1>

          <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
            <BookOpen size={12} strokeWidth={1.5} />
            <span>no one is around anymore.</span>
          </div>
        </header>

        <section id="books-list" className="scroll-mt-36">
          <ShelfHeader
            title="shelf"
            count={`${filteredBooks.length} shown · ${books.length} saved`}
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
                onChange={(event) => handleSearchChange(event.target.value)}
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
              label={sortMode === "az" ? "a-z" : sortMode === "za" ? "z-a" : "a-z"}
              onClick={cycleAlphabetSort}
            />
          </div>

          {filteredBooks.length === 0 ? (
            <EmptyBooks />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {visibleBooks.map((book, index) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => setSelectedBook(book)}
                    style={{ animationDelay: `${index * 45}ms` }}
                    className="group animate-fade-in relative overflow-hidden rounded-[20px] border border-white/[0.04] bg-white/[0.012] text-left shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="relative aspect-[0.72] overflow-hidden">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="h-full w-full object-cover grayscale opacity-72 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#666666]">
                          <BookOpen size={20} strokeWidth={1.5} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
                        <div className="mb-1.5 flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/70 px-2 py-0.5 text-[5.8px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
                          <Quote size={8} strokeWidth={1.5} />
                          <span className="truncate">{book.genre || "page"}</span>
                        </div>

                        <h3 className="line-clamp-2 text-[11px] font-light leading-snug tracking-[-0.03em] text-white">
                          {book.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2.5 p-2.5">
                      <p className="line-clamp-1 text-[6px] uppercase tracking-[0.18em] text-[#777777]">
                        {book.author || "unknown author"}
                      </p>

                      <p className="line-clamp-3 text-[9px] leading-relaxed text-[#8d8d8d] transition-colors duration-700 group-hover:text-[#f1f1f1]">
                        “{book.favorite_quote || book.review || "no line saved"}”
                      </p>

                      {book.favorite_character && (
                        <p className="border-t border-white/[0.07] pt-2 text-[6px] uppercase tracking-[0.18em] text-[#777777]">
                          kept: {book.favorite_character}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredBooks.length > PAGE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMoreBooks && (
                    <button
                      type="button"
                      onClick={showMoreBooks}
                      className="CollapseBtn"
                    >
                      show more
                      <ChevronDown size={11} strokeWidth={1.5} />
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      type="button"
                      onClick={collapseBooks}
                      className="CollapseBtn"
                    >
                      fold again
                      <ChevronUp size={11} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      {open && (
        <div
          onClick={() => status !== "submitting" && setOpen(false)}
          className="animate-fade-in fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => status !== "submitting" && setOpen(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3">
                  <BookOpen
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                add book
              </h2>

              <p className="mt-2 text-[11px] leading-relaxed text-[#777777]">
                put down something small so it stays here after you close the tab.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search
                  size={12}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]"
                />

                <input
                  value={query}
                  onChange={(event) => searchBook(event.target.value)}
                  placeholder="search book..."
                  className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.022] px-10 py-3 text-[12px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] transition-colors hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {results.length > 0 && (
                <div className="scrollbar-hide grid max-h-40 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {results.map((book) => (
                    <button
                      key={book.key}
                      onClick={() => selectBook(book)}
                      className="rounded-xl border border-white/[0.045] bg-white/[0.02] p-3 text-left transition-all duration-700 hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <p className="line-clamp-1 text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0]">
                        {book.title}
                      </p>

                      <p className="mt-1 line-clamp-1 text-[8px] text-[#777777]">
                        {book.author_name?.[0] || "unknown"}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#777777]">
                    selected page
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-colors hover:text-white"
                  >
                    {uploadingCover ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Upload size={10} />
                    )}
                    upload cover
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={uploadCover}
                  />
                </div>

                <div className="flex items-center gap-3">
                  {form.cover ? (
                    <img
                      src={form.cover}
                      alt={form.title || "cover"}
                      className="h-20 w-14 rounded-xl object-cover grayscale opacity-80"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.025] text-[#666666] transition-colors hover:text-white"
                    >
                      {uploadingCover ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  )}

                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      placeholder="book title"
                      className="w-full rounded-xl border border-white/[0.055] bg-black/30 px-3 py-2 text-[11px] text-white outline-none placeholder:text-[#666666] focus:border-white/15"
                    />

                    <input
                      value={form.author}
                      onChange={(event) =>
                        setForm({ ...form, author: event.target.value })
                      }
                      placeholder="author"
                      className="w-full rounded-xl border border-white/[0.055] bg-black/30 px-3 py-2 text-[11px] text-white outline-none placeholder:text-[#666666] focus:border-white/15"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  value={form.genre}
                  onChange={(event) =>
                    setForm({ ...form, genre: event.target.value })
                  }
                  placeholder="genre"
                  className="rounded-2xl border border-white/[0.055] bg-white/[0.022] px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />

                <input
                  value={form.favorite_character}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      favorite_character: event.target.value,
                    })
                  }
                  placeholder="character"
                  className="rounded-2xl border border-white/[0.055] bg-white/[0.022] px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />
              </div>

              <textarea
                value={form.favorite_quote}
                onChange={(event) =>
                  setForm({ ...form, favorite_quote: event.target.value })
                }
                placeholder="a line you still keep..."
                className="h-20 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />

              <textarea
                value={form.character_reason}
                onChange={(event) =>
                  setForm({ ...form, character_reason: event.target.value })
                }
                placeholder="why do you still remember them?"
                className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />

              <textarea
                value={form.review}
                onChange={(event) =>
                  setForm({ ...form, review: event.target.value })
                }
                placeholder="why should this page stay here?"
                className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
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
                  className="flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] transition-colors duration-700 hover:text-white"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full border border-white/[0.18] transition-all duration-700 ${
                      form.is_anonymous
                        ? "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                        : ""
                    }`}
                  />

                  anonymous
                </button>

                {!form.is_anonymous && (
                  <input
                    value={form.username}
                    onChange={(event) =>
                      setForm({ ...form, username: event.target.value })
                    }
                    placeholder="your name"
                    className="ml-auto w-32 border-0 border-b border-b-white/[0.08] bg-transparent px-0 py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-right placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#666666] focus:border-white/20 focus:ring-0"
                  />
                )}
              </div>

              {status === "error" && (
                <p className="text-[10px] text-[#b7b7b7]">
                  something failed. try again softly.
                </p>
              )}

              <button
                onClick={submitBook}
                disabled={
                  status === "submitting" ||
                  uploadingCover ||
                  !form.title ||
                  !form.review.trim()
                }
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {status === "submitting" ? (
                  <Loader2
                    size={10}
                    strokeWidth={1.5}
                    className="animate-spin"
                  />
                ) : status === "success" ? (
                  "saved"
                ) : (
                  "release"
                )}

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

      <GlobalStyles />
    </main>
  );
}

function BookModal({
  book,
  onClose,
}: {
  book: BookRecommendation;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[420] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-hide relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
        >
          <X size={14} />
        </button>

        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div className="relative mx-auto w-full max-w-[180px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="h-[270px] w-full object-cover grayscale opacity-80"
              />
            ) : (
              <div className="flex h-[270px] w-full items-center justify-center text-[#666666]">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>

          <div className="flex min-w-0 flex-col justify-center text-center md:text-left">
            <p className="text-[8px] uppercase tracking-[0.24em] text-[#777777]">
              saved page
            </p>

            <h2 className="mt-3 text-[26px] font-light leading-tight tracking-[-0.05em] text-white/90">
              {book.title || "untitled"}
            </h2>

            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#777777]">
              {book.author || "unknown author"}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              {book.genre && (
                <span className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                  {book.genre}
                </span>
              )}

              {book.favorite_character && (
                <span className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                  {book.favorite_character}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-white/[0.055] pt-5">
          {book.favorite_quote && (
            <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                <Quote size={12} />
                kept line
              </div>

              <p className="text-[13px] font-light leading-relaxed text-[#d6d6d6]">
                “{book.favorite_quote}”
              </p>
            </div>
          )}

          {book.character_reason && (
            <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
              <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                why it stayed
              </p>
              <p className="text-[12px] leading-relaxed text-[#cfcfcf]">
                {book.character_reason}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
            <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
              note
            </p>
            <p className="text-[12px] leading-relaxed text-[#cfcfcf]">
              {book.review || "no note was written here."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-[#666666]">
            <span className="flex items-center gap-2">
              <User size={11} />
              saved by{" "}
              {book.is_anonymous ? "anonymous" : book.username || "someone"}
            </span>

            {book.book_url && (
              <a
                href={book.book_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#888888] transition-colors hover:text-white"
              >
                open page
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
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

function ControlButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
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
}

function ShelfHeader({ title, count }: { title: string; count: string }) {
  return (
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
}

function EmptyBooks() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] px-4 py-20 text-center text-[#666666]">
      <BookOpen size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

      <p className="text-[8px] uppercase tracking-[0.22em]">
        nothing is here right now
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
        scrollbar-color: rgba(255, 255, 255, 0.14)
          rgba(255, 255, 255, 0.025);
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.025);
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        border: 2px solid #020202;
        transition: background 400ms ease;
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.22);
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