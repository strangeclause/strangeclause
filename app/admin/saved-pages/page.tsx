"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Ghost,
  X,
  Upload,
  Trash2,
  Edit,
  Save,
  Sparkles,
  Loader2,
  Quote,
  CloudRain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Book = {
  id: number;
  title: string;
  author: string;
  image_url?: string | null;
  cover?: string | null;
  favorite_character?: string | null;
  quote?: string | null;
  favorite_quote?: string | null;
  description?: string | null;
  review?: string | null;
  genre?: string | null;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 6;
const STORAGE_BUCKET = "stranger-uploads";

export default function BookAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [form, setForm] = useState({
    title: "",
    author: "",
    image_url: "",
    favorite_character: "",
    quote: "",
    description: "",
    genre: "",
  });

  const visibleBooks = books.slice(0, visibleCount);
  const hasMore = visibleCount < books.length;
  const expanded = books.length > 0 && visibleCount >= books.length;

  const footerTexts = [
    "some pages keep people alive quietly.",
    "a book can stay after everyone leaves.",
    "some characters follow us home.",
    "the page remembers what the room forgot.",
    "not every ending knows how to leave.",
  ];

  const [footerText, setFooterText] = useState(footerTexts[0]);

  useEffect(() => {
    setFooterText(
      footerTexts[Math.floor(Math.random() * footerTexts.length)]
    );
  }, []);

  const getImage = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;

    const cleanPath = url.replace(/^\/+/, "");
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(cleanPath);

    return data.publicUrl;
  };

  const getBookImage = (book: Book) => {
    return book.image_url || book.cover || "";
  };

  const getBookQuote = (book: Book) => {
    return book.quote || book.favorite_quote || book.description || book.review || "";
  };

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("book_recommendations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setBooks(data || []);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      image_url: "",
      favorite_character: "",
      quote: "",
      description: "",
      genre: "",
    });

    setEditingId(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingImg(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `books/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (error) throw error;

      setForm((prev) => ({
        ...prev,
        image_url: filePath,
      }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoadingImg(false);
    }
  };

  const submitBook = async () => {
    if (
      !editingId ||
      !form.title.trim() ||
      !form.author.trim() ||
      !form.image_url.trim()
    ) {
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title,
      author: form.author,
      image_url: form.image_url,
      cover: form.image_url,
      favorite_character: form.favorite_character,
      quote: form.quote,
      favorite_quote: form.quote,
      description: form.description,
      review: form.description,
      genre: form.genre,
    };

    const { error } = await supabase
      .from("book_recommendations")
      .update(payload)
      .eq("id", editingId);

    if (error) console.error(error);

    setSaving(false);
    setOpen(false);
    resetForm();
    fetchBooks();
  };

  const editBook = (book: Book) => {
    const image = getBookImage(book);

    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      image_url: image,
      favorite_character: book.favorite_character || "",
      quote: book.quote || book.favorite_quote || "",
      description: book.description || book.review || "",
      genre: book.genre || "",
    });

    setOpen(true);
  };

  const deleteBook = async (id: number) => {
    if (!confirm("Remove this book from the archive?")) return;

    const { error } = await supabase.from("book_recommendations").delete().eq("id", id);

    if (error) console.error(error);

    fetchBooks();
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, books.length));
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("book-section")
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
            onClick={() => router.back()}
            className="group flex shrink-0 items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 sm:text-[9px]"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
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
              admin books kept behind rainy glass
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
                admin / attached pages
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              books people
              <br />
              left behind.
            </h1>

            <p className="max-w-lg text-[12.5px] leading-relaxed text-[#8f8f8f]">
              Edit or remove book recommendations submitted from the anonymous
              page.
            </p>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some characters follow us home.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <BookOpen size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {books.length} books saved
            </p>

            <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              Add stays on the anon page. This room only edits what arrived.
            </p>
          </aside>
        </header>

        <section id="book-section" className="scroll-mt-36">
          <ShelfHeader
            title="annotated shelves"
            count={`${visibleBooks.length} shown · ${books.length} saved`}
          />

          {books.length === 0 ? (
            <EmptyBooks />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {visibleBooks.map((book, index) => {
                  const image = getImage(getBookImage(book));
                  const quote = getBookQuote(book);

                  return (
                    <div
                      key={book.id}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className="group animate-fade-in relative overflow-hidden rounded-[20px] border border-white/[0.04] bg-white/[0.012] shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                    >
                      <div className="relative aspect-[0.72] overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt={book.title}
                            className="h-full w-full object-cover grayscale opacity-72 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#666666]">
                            <BookOpen size={20} strokeWidth={1.5} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute right-2 top-2 z-30 flex gap-1.5 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            onClick={() => editBook(book)}
                            className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
                          >
                            <Edit size={9} />
                          </button>

                          <button
                            onClick={() => deleteBook(book.id)}
                            className="rounded-full border border-white/[0.08] bg-black/70 p-1.5 text-[#777777] transition-colors duration-500 hover:text-white"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
                          <div className="mb-1.5 flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/70 px-2 py-0.5 text-[5.8px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
                            <Quote size={8} strokeWidth={1.5} />
                            <span className="truncate">{book.genre || "book"}</span>
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
                          “{quote || "no quote saved"}”
                        </p>

                        {book.favorite_character && (
                          <p className="border-t border-white/[0.07] pt-2 text-[6px] uppercase tracking-[0.18em] text-[#777777]">
                            carried: {book.favorite_character}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {books.length > COLLAPSE_SIZE && (
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

      {open && (
        <div
          onClick={() => !saving && setOpen(false)}
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-5 backdrop-blur-xl"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
          >
            <button
              onClick={() => !saving && setOpen(false)}
              disabled={saving}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-500 hover:text-white disabled:opacity-30"
            >
              <X size={14} />
            </button>

            <div className="mb-6">
              <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                edit shelf
              </p>

              <h2 className="text-[22px] font-light tracking-[-0.05em] text-white">
                edit this book.
              </h2>
            </div>

            <div className="space-y-4">
              <InputBox
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
                placeholder="book title"
              />

              <InputBox
                value={form.author}
                onChange={(value) => setForm({ ...form, author: value })}
                placeholder="author"
              />

              <InputBox
                value={form.genre}
                onChange={(value) => setForm({ ...form, genre: value })}
                placeholder="genre"
              />

              <label className="group flex min-h-[176px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] transition-all duration-700 hover:border-white/12 hover:bg-white/[0.04]">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUpload}
                />

                {getImage(form.image_url) ? (
                  <img
                    src={getImage(form.image_url)}
                    alt="upload"
                    className="max-h-[240px] w-full object-cover grayscale opacity-80"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#777777]">
                    {loadingImg ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Upload size={15} />
                    )}

                    <p className="text-[8px] uppercase tracking-[0.22em]">
                      {loadingImg ? "uploading..." : "upload cover"}
                    </p>
                  </div>
                )}
              </label>

              <InputBox
                value={form.favorite_character}
                onChange={(value) =>
                  setForm({ ...form, favorite_character: value })
                }
                placeholder="favorite character"
              />

              <textarea
                value={form.quote}
                onChange={(event) =>
                  setForm({ ...form, quote: event.target.value })
                }
                placeholder="favorite quote..."
                className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="why should this book stay?"
                className="h-28 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
              />

              <button
                onClick={submitBook}
                disabled={
                  saving ||
                  loadingImg ||
                  !editingId ||
                  !form.title.trim() ||
                  !form.author.trim() ||
                  !form.image_url.trim()
                }
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] transition-all duration-700 hover:border-white/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {saving ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Save size={10} />
                )}
                update book
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

function InputBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
    />
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

function EmptyBooks() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <BookOpen size={16} strokeWidth={1.5} className="mb-3 opacity-60" />
      <p className="text-[8px] uppercase tracking-[0.22em]">
        no books recovered
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

      ::-webkit-scrollbar {
        width: 0;
        height: 0;
      }

      * {
        scrollbar-width: none;
      }
    `}</style>
  );
}