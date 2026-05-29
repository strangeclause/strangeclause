"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Music,
  Send,
  Sparkles,
  Play,
  X,
  Radio,
  Plus,
  Loader2,
  Quote,
  ExternalLink,
  User,
  ListMusic,
  Users,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock3,
  CloudRain,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type SongResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
};

type MusicRecommendation = {
  id: number;
  title: string | null;
  artist: string | null;
  album: string | null;
  artwork: string | null;
  preview_url: string | null;
  song_url: string | null;
  reason: string | null;
  reminds: string | null;
  username: string | null;
  is_anonymous: boolean | null;
  created_at?: string | null;
  lyric_preview?: string | null;
};

type SortMode = "default" | "latest" | "oldest" | "az" | "za";

const PAGE_SIZE = 6;
const FOOTER_TEXT = "everyone went home early because of the dark sky. i am still sitting here by myself.";

export default function QuietMusicPage() {
  const router = useRouter();

  const [songs, setSongs] = useState<MusicRecommendation[]>([]);
  const [results, setResults] = useState<SongResult[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedSong, setSelectedSong] =
    useState<MusicRecommendation | null>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [rainDrops, setRainDrops] = useState<
    { left: string; delay: string; duration: string }[]
  >([]);
  const [lyricOptions, setLyricOptions] = useState<string[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [groupBySinger, setGroupBySinger] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    album: "",
    artwork: "",
    preview_url: "",
    song_url: "",
    favorite_lyrics: [] as number[],
    reminds: "",
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

  const cleanSyncedLyrics = (lyrics: string) => {
    return lyrics.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, "").trim();
  };

  const createLyricPreview = (lyrics: string) => {
    const words = lyrics.replace(/\s+/g, " ").trim().split(" ");
    return words.slice(0, 10).join(" ");
  };

  const fetchLyricPreview = async (
    title: string | null,
    artist: string | null
  ) => {
    if (!title || !artist) return null;

    try {
      const params = new URLSearchParams({
        track_name: title,
        artist_name: artist,
      });

      const res = await fetch(
        `https://lrclib.net/api/search?${params.toString()}`
      );

      if (!res.ok) return null;

      const data = await res.json();
      const matched = data?.[0];

      const rawLyrics =
        matched?.plainLyrics ||
        (matched?.syncedLyrics
          ? cleanSyncedLyrics(matched.syncedLyrics)
          : null);

      if (!rawLyrics) return null;

      return createLyricPreview(rawLyrics);
    } catch (error) {
      console.error("Lyrics fetch error:", error);
      return null;
    }
  };

  const fetchLyricOptions = async (title: string, artist: string) => {
    setLyricsLoading(true);
    setLyricOptions([]);

    try {
      const params = new URLSearchParams({
        track_name: title,
        artist_name: artist,
      });

      const res = await fetch(
        `https://lrclib.net/api/search?${params.toString()}`
      );

      if (!res.ok) {
        setLyricOptions([]);
        return;
      }

      const data = await res.json();
      const matched = data?.[0];

      const rawLyrics =
        matched?.plainLyrics ||
        (matched?.syncedLyrics
          ? cleanSyncedLyrics(matched.syncedLyrics)
          : null);

      if (!rawLyrics) {
        setLyricOptions([]);
        return;
      }

      const lines = rawLyrics
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 3)
        .slice(0, 40);

      setLyricOptions(lines);
    } catch (error) {
      console.error("Lyric options error:", error);
      setLyricOptions([]);
    } finally {
      setLyricsLoading(false);
    }
  };

  const fetchSongs = useCallback(async () => {
    const { data, error } = await supabase
      .from("music_recommendations")
      .select(
        "id,title,artist,album,artwork,preview_url,song_url,reason,reminds,username,is_anonymous,created_at"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      setSongs([]);
      return;
    }

    const songsWithLyrics = await Promise.all(
      (data || []).map(async (song) => {
        const lyric_preview = await fetchLyricPreview(song.title, song.artist);
        return { ...song, lyric_preview };
      })
    );

    setSongs(songsWithLyrics);
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const filteredSongs = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    const filtered = songs.filter((song) => {
      if (!keyword) return true;

      return (
        song.title?.toLowerCase().includes(keyword) ||
        song.artist?.toLowerCase().includes(keyword) ||
        song.album?.toLowerCase().includes(keyword) ||
        song.reminds?.toLowerCase().includes(keyword) ||
        song.reason?.toLowerCase().includes(keyword)
      );
    });

    const sorted = [...filtered];

    if (sortMode === "latest" || sortMode === "default") {
      sorted.sort((a, b) => b.id - a.id);
    }

    if (sortMode === "oldest") {
      sorted.sort((a, b) => a.id - b.id);
    }

    if (sortMode === "az") {
      sorted.sort((a, b) => {
        const titleCompare = (a.title || "").localeCompare(b.title || "");
        if (titleCompare !== 0) return titleCompare;
        return (a.artist || "").localeCompare(b.artist || "");
      });
    }

    if (sortMode === "za") {
      sorted.sort((a, b) => {
        const titleCompare = (b.title || "").localeCompare(a.title || "");
        if (titleCompare !== 0) return titleCompare;
        return (b.artist || "").localeCompare(a.artist || "");
      });
    }

    return sorted;
  }, [songs, searchTerm, sortMode]);

  const visibleSongs = useMemo(
    () => filteredSongs.slice(0, visibleCount),
    [filteredSongs, visibleCount]
  );

  const groupedVisibleSongs = useMemo(() => {
    return visibleSongs.reduce<Record<string, MusicRecommendation[]>>(
      (acc, song) => {
        const singer = song.artist || "unknown artist";

        if (!acc[singer]) acc[singer] = [];
        acc[singer].push(song);

        return acc;
      },
      {}
    );
  }, [visibleSongs]);

  const resetViewLimit = () => {
    setVisibleCount(PAGE_SIZE);
  };

  const cycleDateSort = () => {
    setSortMode((current) => {
      if (current === "latest") return "oldest";
      if (current === "oldest") return "default";
      return "latest";
    });

    resetViewLimit();
  };

  const cycleAlphabetSort = () => {
    setSortMode((current) => {
      if (current === "az") return "za";
      if (current === "za") return "default";
      return "az";
    });

    resetViewLimit();
  };

  const searchSong = async (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          value
        )}&entity=song&limit=5`
      );

      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("iTunes search error:", error);
    }
  };

  const selectSong = async (song: SongResult) => {
    setForm((prev) => ({
      ...prev,
      title: song.trackName,
      artist: song.artistName,
      album: song.collectionName,
      artwork: song.artworkUrl100.replace("100x100bb", "600x600bb"),
      preview_url: song.previewUrl,
      song_url: song.trackViewUrl,
      favorite_lyrics: [],
    }));

    setQuery(`${song.trackName} — ${song.artistName}`);
    setResults([]);

    await fetchLyricOptions(song.trackName, song.artistName);
  };

  const toggleFavoriteLyric = (index: number) => {
    const current = form.favorite_lyrics;

    if (current.includes(index)) {
      setForm({
        ...form,
        favorite_lyrics: current.filter((item) => item !== index),
      });
      return;
    }

    if (current.length >= 3) return;

    const next = [...current, index].sort((a, b) => a - b);
    const isSequential = next.every((item, i, arr) => {
      if (i === 0) return true;
      return item === arr[i - 1] + 1;
    });

    if (!isSequential) return;

    setForm({
      ...form,
      favorite_lyrics: next,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      artist: "",
      album: "",
      artwork: "",
      preview_url: "",
      song_url: "",
      favorite_lyrics: [],
      reminds: "",
      username: "",
      is_anonymous: true,
    });

    setQuery("");
    setResults([]);
    setLyricOptions([]);
  };

  const submitSong = async () => {
    if (!form.title || status === "submitting") return;

    setStatus("submitting");

    const favoriteLyric =
      form.favorite_lyrics.length > 0
        ? form.favorite_lyrics.map((index) => lyricOptions[index]).join("\n")
        : null;

    const { error } = await supabase.from("music_recommendations").insert([
      {
        title: form.title || null,
        artist: form.artist || null,
        album: form.album || null,
        artwork: form.artwork || null,
        preview_url: form.preview_url || null,
        song_url: form.song_url || null,
        reason: favoriteLyric,
        reminds: form.reminds || null,
        username: form.is_anonymous ? null : form.username || null,
        is_anonymous: form.is_anonymous,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      setStatus("error");
      return;
    }

    setStatus("success");
    resetForm();
    await fetchSongs();

    setTimeout(() => {
      setStatus("idle");
      setOpen(false);
    }, 900);
  };

  const SongCard = ({ song }: { song: MusicRecommendation }) => (
    <button
      key={song.id}
      onClick={() => setSelectedSong(song)}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] p-4 text-left shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
    >
      <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-[145px_1fr]">
        <div className="relative mx-auto flex h-[145px] w-[145px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.045] bg-black/70 shadow-[inset_0_0_45px_rgba(255,255,255,0.025),0_18px_45px_rgba(0,0,0,0.45)]">
          <div className="absolute right-5 top-4 h-24 w-1.5 origin-top rotate-[24deg] rounded-full bg-gradient-to-b from-white/14 via-white/7 to-transparent transition-all duration-1000 group-hover:rotate-[31deg]" />
          <div className="absolute right-[25px] top-[100px] h-3 w-6 rotate-[24deg] rounded-full border border-white/[0.06] bg-white/[0.03]" />

          <div className="record-spin relative h-[112px] w-[112px] rounded-full border border-white/[0.055] bg-[radial-gradient(circle,#111_0%,#090909_38%,#030303_100%)] shadow-[inset_0_0_35px_rgba(255,255,255,0.04),0_0_35px_rgba(0,0,0,0.7)] transition-all duration-1000">
            <div className="absolute inset-[8px] rounded-full border border-white/[0.035]" />
            <div className="absolute inset-[18px] rounded-full border border-white/[0.03]" />
            <div className="absolute inset-[30px] rounded-full border border-white/[0.025]" />
            <div className="absolute inset-[42px] rounded-full border border-white/[0.02]" />

            <div className="absolute left-1/2 top-1/2 h-[48px] w-[48px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.035]">
              {song.artwork ? (
                <img
                  src={song.artwork}
                  alt={song.title || "song artwork"}
                  className="h-full w-full object-cover grayscale opacity-70 transition-all duration-1000 group-hover:opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#666666]">
                  <Music size={14} strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#070707] ring-1 ring-white/12" />
          </div>

          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-700 group-hover:bg-black/25 group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white/75 backdrop-blur-md">
              <Play size={13} fill="currentColor" />
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between py-1 text-center sm:text-left">
          <div className="space-y-2.5">
            <p className="line-clamp-1 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
              {song.artist || "unknown artist"}
            </p>

            <h3 className="line-clamp-2 text-[17px] font-light leading-snug tracking-[-0.03em] text-white/90 sm:text-[18px]">
              {song.title || "untitled"}
            </h3>

            <div className="flex gap-2 text-[#888888] transition-colors duration-700 group-hover:text-[#d7d7d7]">
              <Quote size={13} className="mt-1 shrink-0 text-[#666666]" />
              <p className="line-clamp-3 whitespace-pre-line text-[12px] leading-relaxed">
                {song.reason
                  ? `“${song.reason}”`
                  : song.lyric_preview
                  ? `“${song.lyric_preview}...”`
                  : "no lyric saved yet."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.045] pt-3 text-[8px] uppercase tracking-[0.18em] text-[#666666]">
            <span className="line-clamp-1 max-w-[70%]">
              {song.reminds ? `echoes: ${song.reminds}` : "no echo"}
            </span>
            <span className="shrink-0">
              {song.is_anonymous ? "anonymous" : song.username || "someone"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );

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
              quiet music
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="group col-start-2 row-start-1 flex items-center justify-self-end gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-1.5 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:py-2 sm:text-[8.5px] md:col-start-3"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            <span className="hidden sm:inline">add song</span>
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
            some low sounds to play while looking out at the foggy yard.
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Radio size={12} strokeWidth={1.5} />
              <span>no one is around anymore.</span>
            </div>
          </div>
        </header>

        <section>
          <ShelfHeader
            title="SONGS SHELF"
            count={`${filteredSongs.length} shown · ${songs.length} saved`}
          />

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search
                size={12}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]"
              />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetViewLimit();
                }}
                placeholder="type a word to find something..."
                className="w-full rounded-full border border-white/[0.045] bg-white/[0.016] py-3 pl-10 pr-4 text-[11px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
              />
            </div>

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
                sortMode === "az"
                  ? "a-z"
                  : sortMode === "za"
                  ? "z-a"
                  : "by title"
              }
              onClick={cycleAlphabetSort}
            />

            <ControlButton
              active={groupBySinger}
              icon={
                groupBySinger ? <Users size={11} /> : <ListMusic size={11} />
              }
              label={groupBySinger ? "singer" : "list"}
              onClick={() => {
                setGroupBySinger((prev) => !prev);
                resetViewLimit();
              }}
            />
          </div>

          {filteredSongs.length === 0 ? (
            <EmptyMusic />
          ) : groupBySinger ? (
            <div className="space-y-8">
              {Object.entries(groupedVisibleSongs).map(
                ([artist, artistSongs]) => (
                  <div key={artist}>
                    <div className="mb-4 flex items-center justify-between border-b border-white/[0.045] pb-2">
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-[#777777]" />
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/85">
                          {artist}
                        </h3>
                      </div>
                      <p className="text-[7px] uppercase tracking-[0.18em] text-[#666666]">
                        {artistSongs.length} shown
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
                      {artistSongs.map((song) => (
                        <SongCard key={song.id} song={song} />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
              {visibleSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}

          {visibleCount < filteredSongs.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#777777] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:text-white/75"
              >
                show more
              </button>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-fadeIn fixed inset-0 z-[400] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3">
                  <Music
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                add song
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
                  className="absolute left-0 top-3 text-[#666666]"
                />

                <input
                  value={query}
                  onChange={(e) => searchSong(e.target.value)}
                  placeholder="search song title or artist..."
                  className="w-full border-b border-white/[0.07] bg-transparent py-2.5 pl-5 text-[12px] text-white/85 outline-none transition-colors placeholder:text-[#666666] focus:border-white/20"
                />
              </div>

              {results.length > 0 && (
                <div className="scrollbar-hide max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-white/[0.045] bg-black/20 p-2">
                  {results.map((song) => (
                    <button
                      key={song.trackId}
                      onClick={() => selectSong(song)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.045] bg-white/[0.02] p-2.5 text-left transition-all duration-700 hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <img
                        src={song.artworkUrl100}
                        alt={song.trackName}
                        className="h-10 w-10 rounded-full object-cover grayscale opacity-75"
                      />

                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0]">
                          {song.trackName}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[8px] text-[#777777]">
                          {song.artistName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {form.title && (
                <div className="rounded-3xl border border-white/[0.055] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={form.artwork}
                      alt={form.title}
                      className="h-16 w-16 rounded-2xl object-cover grayscale opacity-80"
                    />

                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[8px] uppercase tracking-[0.18em] text-[#777777]">
                        selected song
                      </p>
                      <p className="mt-1 line-clamp-2 text-[14px] font-light leading-snug text-white/90">
                        {form.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-[#8d8d8d]">
                        {form.artist}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {form.title && (
                <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                      choose favorite lyric
                    </p>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#666666]">
                      {form.favorite_lyrics.length}/3 selected
                    </p>
                  </div>

                  {lyricsLoading ? (
                    <div className="flex items-center gap-2 text-[10px] text-[#777777]">
                      <Loader2 size={12} className="animate-spin" />
                      finding lyric lines...
                    </div>
                  ) : lyricOptions.length > 0 ? (
                    <div className="scrollbar-hide max-h-40 space-y-2 overflow-y-auto">
                      {lyricOptions.map((line, index) => {
                        const selected = form.favorite_lyrics.includes(index);
                        const canSelect =
                          form.favorite_lyrics.length === 0 ||
                          form.favorite_lyrics.includes(index) ||
                          form.favorite_lyrics.includes(index - 1) ||
                          form.favorite_lyrics.includes(index + 1);

                        return (
                          <button
                            key={`${line}-${index}`}
                            type="button"
                            onClick={() => toggleFavoriteLyric(index)}
                            disabled={
                              !selected &&
                              (!canSelect || form.favorite_lyrics.length >= 3)
                            }
                            className={`w-full rounded-xl border p-3 text-left text-[11px] leading-relaxed transition-all duration-500 ${
                              selected
                                ? "border-white/25 bg-white/[0.08] text-white"
                                : canSelect && form.favorite_lyrics.length < 3
                                ? "border-white/[0.055] bg-black/20 text-[#9a9a9a] hover:border-white/15 hover:text-white"
                                : "cursor-not-allowed border-white/[0.035] bg-black/10 text-[#444444]"
                            }`}
                          >
                            <span className="mb-1 block text-[7px] uppercase tracking-[0.18em] text-[#666666]">
                              line {String(index + 1).padStart(2, "0")}
                            </span>
                            “{line}”
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#777777]">
                      lyrics not found. you can still save the song.
                    </p>
                  )}
                </div>
              )}

              <input
                value={form.reminds}
                onChange={(e) => setForm({ ...form, reminds: e.target.value })}
                placeholder="what does it remind you of?"
                className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[12px] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
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
                    placeholder="your name"
                    className="w-28 border-b border-b-white/[0.08] bg-transparent py-1 text-right text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#666666] focus:border-white/20"
                  />
                )}
              </div>

              {status === "error" && (
                <p className="text-[10px] text-[#b7b7b7]">
                  something failed. try again softly.
                </p>
              )}

              <button
                onClick={submitSong}
                disabled={status === "submitting" || !form.title}
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

      {selectedSong && (
        <div
          onClick={() => setSelectedSong(null)}
          className="animate-fadeIn fixed inset-0 z-[420] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-hide relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <button
              onClick={() => setSelectedSong(null)}
              className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="grid gap-6 md:grid-cols-[210px_1fr]">
              <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                {selectedSong.artwork ? (
                  <img
                    src={selectedSong.artwork}
                    alt={selectedSong.title || "song artwork"}
                    className="h-full w-full object-cover grayscale opacity-82"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#666666]">
                    <Music size={26} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-center text-center md:text-left">
                <p className="text-[8px] uppercase tracking-[0.24em] text-[#777777]">
                  saved song
                </p>

                <h2 className="mt-3 text-[26px] font-light leading-tight tracking-[-0.05em] text-white/90">
                  {selectedSong.title || "untitled"}
                </h2>

                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#8d8d8d]">
                  {selectedSong.artist || "unknown artist"}
                </p>

                {selectedSong.album && (
                  <p className="mt-1 text-[11px] text-[#666666]">
                    {selectedSong.album}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  {selectedSong.preview_url && (
                    <a
                      href={selectedSong.preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#a1a1a1] transition-all duration-700 hover:border-white/15 hover:text-white"
                    >
                      <Play size={10} fill="currentColor" />
                      preview
                    </a>
                  )}

                  {selectedSong.song_url && (
                    <a
                      href={selectedSong.song_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#a1a1a1] transition-all duration-700 hover:border-white/15 hover:text-white"
                    >
                      <ExternalLink size={10} />
                      open song
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-4 border-t border-white/[0.055] pt-5">
              <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                  <Quote size={12} />
                  favorite lyric
                </div>

                <p className="whitespace-pre-line text-[14px] font-light leading-relaxed text-white/90">
                  {selectedSong.reason
                    ? `“${selectedSong.reason}”`
                    : selectedSong.lyric_preview
                    ? `“${selectedSong.lyric_preview}...”`
                    : "no lyric saved yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                  <Radio size={12} />
                  echoes
                </div>

                <p className="text-[12px] leading-relaxed text-[#cfcfcf]">
                  {selectedSong.reminds || "no echo was written for this song."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                <span className="flex items-center gap-2">
                  <User size={11} />
                  saved by
                </span>
                <span>
                  {selectedSong.is_anonymous
                    ? "anonymous"
                    : selectedSong.username || "someone"}
                </span>
              </div>
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
        }

        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
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

        @keyframes vinylSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .group:hover .record-spin {
          animation: vinylSlow 7s linear infinite;
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
    className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-[8px] uppercase tracking-[0.18em] transition-all duration-500 ${
      active
        ? "border-white/15 bg-white/[0.07] text-white"
        : "border-white/[0.045] bg-white/[0.016] text-[#777777] hover:border-white/10 hover:text-white/75"
    }`}
  >
    {icon}
    {label}
  </button>
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

const EmptyMusic = () => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.055] bg-white/[0.012] py-20 text-[#666666]">
    <Music size={16} strokeWidth={1.5} className="mb-3 opacity-60" />
    <p className="text-[8px] uppercase tracking-[0.22em]">
      nothing is here right now
    </p>
  </div>
);