"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Save,
  Upload,
  User,
  Globe,
  MessageSquare,
  Sparkles,
  Trash,
  Edit,
  X,
  ArrowLeft,
  Ghost,
  Plus,
  Loader2,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Music2,
  Film,
  ExternalLink,
} from "lucide-react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Encounter = {
  id: string;
  title: string;
  name: string;
  description: string;
  image_url?: string;
  how_i_called_them?: string;
  how_they_called_me?: string;
  first_met?: string;
  first_impression?: string;
  favorite_map?: string;
  common_words?: string;
  personality_bullets?: string[];
  why_i_remember_them?: string;
  short_character_summary?: string;
  matching_song?: string;
  spotify_url?: string;
  movie_character?: string;
  tmdb_url?: string;
  movie_reason?: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const COLLAPSE_SIZE = 8;

export default function RobloxAdminPage() {
  const router = useRouter();

  const [items, setItems] = useState<Encounter[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [howICalled, setHowICalled] = useState("");
  const [howTheyCalled, setHowTheyCalled] = useState("");
  const [firstMet, setFirstMet] = useState("");
  const [firstImpression, setFirstImpression] = useState("");
  const [favoriteMap, setFavoriteMap] = useState("");
  const [commonWords, setCommonWords] = useState("");
  const [personality, setPersonality] = useState("");
  const [whyRemember, setWhyRemember] = useState("");
  const [summary, setSummary] = useState("");
  const [matchingSong, setMatchingSong] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [movieCharacter, setMovieCharacter] = useState("");
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [movieReason, setMovieReason] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const footerLines = useMemo(
    () => [
      "some usernames still echo in empty servers.",
      "pixels remember what players forget.",
      "every lobby eventually becomes a ghost town.",
      "some friendships only existed because the map loaded.",
      "the server closed, but the warmth stayed.",
    ],
    []
  );

  const footerText = useMemo(
    () => footerLines[Math.floor(Math.random() * footerLines.length)],
    [footerLines]
  );

  const inputStyle =
    "w-full border-b border-white/[0.08] bg-transparent py-2.5 text-[9px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/25";

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const isExpanded = visibleCount >= items.length;

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const showNotif = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 2500);
  };

  const fetchItems = async () => {
    const { data } = await supabase
      .from("roblox_encounters")
      .select("*")
      .order("id", { ascending: false });

    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setTitle("");
    setName("");
    setDesc("");
    setHowICalled("");
    setHowTheyCalled("");
    setFirstMet("");
    setFirstImpression("");
    setFavoriteMap("");
    setCommonWords("");
    setPersonality("");
    setWhyRemember("");
    setSummary("");
    setMatchingSong("");
    setSpotifyUrl("");
    setMovieCharacter("");
    setTmdbUrl("");
    setMovieReason("");
    setExistingImage("");
    setEditId(null);
    setFile(null);
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("roblox-images")
      .upload(fileName, file);

    if (error) return "";

    const { data } = supabase.storage
      .from("roblox-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const save = async () => {
    if (!title.trim() || !name.trim()) {
      showNotif("error", "missing title or name");
      return;
    }

    setLoading(true);

    try {
      let image_url = existingImage;

      if (file) image_url = await uploadImage(file);

      const payload = {
        title,
        name,
        description: desc,
        how_i_called_them: howICalled,
        how_they_called_me: howTheyCalled,
        first_met: firstMet,
        first_impression: firstImpression,
        favorite_map: favoriteMap,
        common_words: commonWords,
        personality_bullets: personality.split("\n").filter(Boolean),
        why_i_remember_them: whyRemember,
        short_character_summary: summary,
        matching_song: matchingSong,
        spotify_url: spotifyUrl,
        movie_character: movieCharacter,
        tmdb_url: tmdbUrl,
        movie_reason: movieReason,
        image_url,
      };

      const { error } = editId
        ? await supabase
            .from("roblox_encounters")
            .update(payload)
            .eq("id", editId)
        : await supabase.from("roblox_encounters").insert(payload);

      if (error) throw error;

      showNotif("success", editId ? "memory updated" : "memory saved");
      resetForm();
      setModalOpen(false);
      setVisibleCount(COLLAPSE_SIZE);
      fetchItems();
    } catch {
      showNotif("error", "failed to save memory");
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item: Encounter) => {
    setEditId(item.id);
    setTitle(item.title || "");
    setName(item.name || "");
    setDesc(item.description || "");
    setHowICalled(item.how_i_called_them || "");
    setHowTheyCalled(item.how_they_called_me || "");
    setFirstMet(item.first_met || "");
    setFirstImpression(item.first_impression || "");
    setFavoriteMap(item.favorite_map || "");
    setCommonWords(item.common_words || "");
    setPersonality(item.personality_bullets?.join("\n") || "");
    setWhyRemember(item.why_i_remember_them || "");
    setSummary(item.short_character_summary || "");
    setMatchingSong(item.matching_song || "");
    setSpotifyUrl(item.spotify_url || "");
    setMovieCharacter(item.movie_character || "");
    setTmdbUrl(item.tmdb_url || "");
    setMovieReason(item.movie_reason || "");
    setExistingImage(item.image_url || "");
    setFile(null);
    setModalOpen(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this memory from the archive?")) return;

    const { error } = await supabase
      .from("roblox_encounters")
      .delete()
      .eq("id", id);

    if (error) {
      showNotif("error", "failed to remove memory");
      return;
    }

    showNotif("success", "memory removed");
    fetchItems();
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, items.length));
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);
    document
      .getElementById("friendship-archive")
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

            <span className="hidden max-w-[310px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              admin pixel memories kept behind rainy glass
            </span>
          </button>

          <button
            onClick={openNewModal}
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

      {notif && (
        <div className="animate-fade-in fixed left-1/2 top-24 z-[999] -translate-x-1/2 rounded-full border border-white/[0.045] bg-[#070707]/95 px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#b7b7b7] shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {notif.message}
        </div>
      )}

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / people in pixels
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              save the people
              <br />
              who made pixels warm.
            </h1>

            <p className="max-w-lg text-[12.5px] leading-relaxed text-[#8f8f8f]">
              Add, edit, or remove notes about Roblox friends, old maps, familiar
              usernames, and tiny things worth remembering.
            </p>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some people disappear when the lobby changes.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                archive status
              </p>
              <User size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {items.length} pixel memories saved
            </p>

            <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              Keep the cards small. Let each name stay like a quiet trace.
            </p>
          </aside>
        </header>

        <section id="friendship-archive" className="scroll-mt-36">
          <ShelfHeader
            title="friendship archive"
            count={`${visibleItems.length} shown · ${items.length} saved`}
          />

          {items.length === 0 ? (
            <EmptyRoblox />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] shadow-[0_12px_36px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="relative aspect-[4/5] overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover grayscale opacity-72 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-95"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[7px] uppercase tracking-[0.18em] text-[#666666]">
                          no image
                        </div>
                      )}

                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute right-2 top-2 z-30 flex gap-1.5 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          onClick={() => editItem(item)}
                          className="rounded-full border border-white/[0.045] bg-black/70 p-1.5 text-[#777777] backdrop-blur-md transition-colors duration-700 hover:text-white"
                        >
                          <Edit size={10} strokeWidth={1.5} />
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded-full border border-white/[0.045] bg-black/70 p-1.5 text-[#777777] backdrop-blur-md transition-colors duration-700 hover:text-white"
                        >
                          <Trash size={10} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 z-30">
                        <p className="mb-1.5 truncate text-[6.5px] uppercase tracking-[0.18em] text-[#cfcfcf]">
                          {item.name}
                        </p>

                        <h3 className="line-clamp-2 text-[12.5px] font-light leading-snug tracking-[-0.03em] text-white">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="relative z-20 space-y-3 p-3">
                      <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#8d8d8d] transition-colors duration-700 group-hover:text-[#f1f1f1]">
                        {item.description || "a memory kept here."}
                      </p>

                      {(item.matching_song || item.movie_character) && (
                        <div className="space-y-2 border-t border-white/[0.05] pt-3">
                          {item.matching_song && (
                            <a
                              href={item.spotify_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-2 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-colors duration-700 hover:text-white/80"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Music2 size={9} />
                                <span className="line-clamp-1">
                                  {item.matching_song}
                                </span>
                              </div>

                              {item.spotify_url && (
                                <ExternalLink size={8} className="shrink-0" />
                              )}
                            </a>
                          )}

                          {item.movie_character && (
                            <a
                              href={item.tmdb_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-2 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-colors duration-700 hover:text-white/80"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Film size={9} />
                                <span className="line-clamp-1">
                                  {item.movie_character}
                                </span>
                              </div>

                              {item.tmdb_url && (
                                <ExternalLink size={8} className="shrink-0" />
                              )}
                            </a>
                          )}

                          {item.movie_reason && (
                            <p className="line-clamp-2 text-[9px] leading-relaxed text-[#666666]">
                              {item.movie_reason}
                            </p>
                          )}
                        </div>
                      )}
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
          onClick={() => {
            setModalOpen(false);
            resetForm();
          }}
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6 md:p-8"
          >
            <button
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7">
              <p className="mb-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                {editId ? "rewrite the ghost" : "new pixel memory"}
              </p>

              <h3 className="text-[24px] font-light leading-tight tracking-[-0.05em] text-white">
                {editId ? "adjust what stayed." : "leave someone here."}
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#777777]">
                  <User size={13} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.22em]">
                    identity
                  </p>
                </div>

                <input placeholder="archive title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} />
                <input placeholder="friend name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} />
                <input placeholder="short description" value={desc} onChange={(e) => setDesc(e.target.value)} className={inputStyle} />
                <input placeholder="what i called them" value={howICalled} onChange={(e) => setHowICalled(e.target.value)} className={inputStyle} />
                <input placeholder="what they called me" value={howTheyCalled} onChange={(e) => setHowTheyCalled(e.target.value)} className={inputStyle} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#777777]">
                  <Globe size={13} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.22em]">
                    memory
                  </p>
                </div>

                <input placeholder="first met" value={firstMet} onChange={(e) => setFirstMet(e.target.value)} className={inputStyle} />
                <input placeholder="first impression" value={firstImpression} onChange={(e) => setFirstImpression(e.target.value)} className={inputStyle} />
                <input placeholder="favorite map" value={favoriteMap} onChange={(e) => setFavoriteMap(e.target.value)} className={inputStyle} />
                <input placeholder="things they said" value={commonWords} onChange={(e) => setCommonWords(e.target.value)} className={inputStyle} />
                <input placeholder="why i remember them" value={whyRemember} onChange={(e) => setWhyRemember(e.target.value)} className={inputStyle} />
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                  <Sparkles size={12} strokeWidth={1.5} />
                  traits
                </p>

                <textarea
                  placeholder="write one trait per line..."
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="h-32 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />
              </div>

              <div className="space-y-3">
                <p className="flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                  <MessageSquare size={12} strokeWidth={1.5} />
                  summary
                </p>

                <textarea
                  placeholder="a small final note..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="h-32 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#777777]">
                  <Music2 size={13} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.22em]">
                    soundtrack
                  </p>
                </div>

                <input
                  placeholder="song that feels like them"
                  value={matchingSong}
                  onChange={(e) => setMatchingSong(e.target.value)}
                  className={inputStyle}
                />

                <input
                  placeholder="spotify link"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#777777]">
                  <Film size={13} strokeWidth={1.5} />
                  <p className="text-[8px] uppercase tracking-[0.22em]">
                    movie feeling
                  </p>
                </div>

                <input
                  placeholder="movie character"
                  value={movieCharacter}
                  onChange={(e) => setMovieCharacter(e.target.value)}
                  className={inputStyle}
                />

                <input
                  placeholder="tmdb link"
                  value={tmdbUrl}
                  onChange={(e) => setTmdbUrl(e.target.value)}
                  className={inputStyle}
                />

                <textarea
                  placeholder="why do they feel like this character?"
                  value={movieReason}
                  onChange={(e) => setMovieReason(e.target.value)}
                  className="h-28 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/15"
                />
              </div>
            </div>

            <div className="mt-6 grid items-stretch gap-4 md:grid-cols-[1fr_150px]">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] p-6 text-center transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04]">
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <Upload
                  size={17}
                  strokeWidth={1.5}
                  className="mb-4 text-[#777777]"
                />

                <p className="text-[8px] uppercase tracking-[0.18em] text-[#777777]">
                  {file
                    ? file.name
                    : existingImage
                    ? "image already saved"
                    : "upload image"}
                </p>
              </label>

              {(file || existingImage) && (
                <div className="relative min-h-[150px] overflow-hidden rounded-2xl border border-white/[0.055] bg-white/[0.025]">
                  <img
                    src={file ? URL.createObjectURL(file) : existingImage}
                    alt="preview"
                    className="h-full w-full object-cover grayscale opacity-80"
                  />
                </div>
              )}
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={save}
                disabled={loading}
                className="group flex flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {loading ? (
                  <Loader2 size={10} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Save size={10} strokeWidth={1.5} />
                )}
                {loading ? "saving" : editId ? "update memory" : "save memory"}
              </button>

              {editId && (
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                  className="rounded-full border border-white/[0.055] bg-white/[0.025] px-5 text-[8px] uppercase tracking-[0.22em] text-[#777777] transition-all duration-700 hover:border-white/15 hover:text-white"
                >
                  cancel
                </button>
              )}
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

const EmptyRoblox = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
    <Ghost size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

    <p className="text-[8px] uppercase tracking-[0.22em]">
      no ghosts recovered
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
      scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.03);
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 8px;
    }

    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.02);
    }

    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.18),
        rgba(255,255,255,0.08)
      );
      border: 2px solid #020202;
    }

    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.28),
        rgba(255,255,255,0.14)
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

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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