"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CloudRain,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Send,
  Image as ImageIcon,
  Video,
  Music2,
  Play,
  Pause,
} from "lucide-react";
import { FaSpotify, FaDiscord } from "react-icons/fa";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};


type FavoriteItem = {
  title: string;
  image_url: string;
  link: string;
  subtitle?: string;
  year?: string;
  source?: string;
};

type AboutProfile = {
  id: number;
  page_badge: string | null;
  title: string | null;
  description: string | null;
  footer_text: string | null;
  spotify_url: string | null;
  discord_url: string | null;
  self_image_url?: string | null;
  self_video_url?: string | null;
  self_videos?: { title: string; url: string }[] | null;
  video_password?: string | null;
  audio_url?: string | null;
  daniel_caesar_url?: string | null;
  note_title: string | null;
  note_text: string | null;
  favorite_colors: { name: string; color: string }[] | null;
  facts: { label: string; value: string }[] | null;
  iconic_things: { title: string; line: string }[] | null;
  floating_notes: string[] | null;
  bubble_chats: { side: "left" | "right"; text: string }[] | null;
  usually_called: string[] | null;
  favorite_music: FavoriteItem[] | null;
  favorite_movies: FavoriteItem[] | null;
  favorite_series: FavoriteItem[] | null;
  favorite_anime: FavoriteItem[] | null;
};

const fallbackProfile: AboutProfile = {
  id: 1,
  page_badge: "thunderstorm",
  title: "mostly quiet, but not empty.",
  description: "a small page for the person who keeps this strange house open.",
  footer_text: "nothing too private, just the little things that keep showing up.",
  spotify_url: "https://open.spotify.com/",
  discord_url: "https://discord.com/",
  self_image_url: "",
  self_video_url: "",
  self_videos: [],
  video_password: "163479",
  audio_url: "",
  daniel_caesar_url: "https://open.spotify.com/embed/track/7zFXmv6vqI4qOt4yGf3jYZ?utm_source=generator&theme=0",
  note_title: "not a biography",
  note_text: "i like pages that feel quiet, colors that look warm in the dark, and music that sounds like someone stayed in the room a little longer.",
  favorite_colors: [{ name: "soft grey", color: "#8a8a8a" }],
  facts: [
    { label: "favorite mood", value: "quiet rainy night" },
    { label: "favorite color", value: "soft grey" },
    { label: "favorite sound", value: "soft music" },
    { label: "comfort thing", value: "ice americano" },
  ],
  iconic_things: [
    { title: "glasses almost every time", line: "the small thing people notice first when i go outside." },
    { title: "red and brown tones", line: "colors i keep choosing because they feel warm, calm, and a little old." },
    { title: "quiet but still present", line: "i can stay soft in the room, but i still notice tiny things around me." },
    { title: "messy thoughts, pretty spaces", line: "my mind can be hard to sort, so i make the page feel neat instead." },
  ],
  floating_notes: [
    "not everything needs to be loud.",
    "some things are kept because they feel warm.",
    "red looks better when the sky is grey.",
    "this page only tells the soft parts.",
  ],
  bubble_chats: [
    { side: "right", text: "how do i usually call you?" },
    { side: "left", text: "probably the same name i always use." },
  ],
  usually_called: ["elsa", "kak", "room owner"],
  favorite_music: [{ title: "late night songs", image_url: "", link: "https://open.spotify.com/" }],
  favorite_movies: [{ title: "quiet cinema", image_url: "", link: "" }],
  favorite_series: [{ title: "rainy series", image_url: "", link: "" }],
  favorite_anime: [{ title: "soft anime", image_url: "", link: "" }],
};

export default function AboutMePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [profile, setProfile] = useState<AboutProfile>(fallbackProfile);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [typingText, setTypingText] = useState("");
  const [videoPasswordInput, setVideoPasswordInput] = useState("");
  const [videosUnlocked, setVideosUnlocked] = useState(false);
  const [videoError, setVideoError] = useState("");
  
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));
    setRainDrops(drops);
  }, []);

  useEffect(() => {
    const phrases = [
      "i miss those late night songs",
      "lets play this again softly",
      "wait im still listening",
      "this sounds like staying",
      "i almost sent this to someone",
    ];
    let phraseIndex = 0;
    let letterIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runTyping = () => {
      const currentPhrase = phrases[phraseIndex];
      if (!deleting) {
        setTypingText(currentPhrase.slice(0, letterIndex + 1));
        letterIndex += 1;
        if (letterIndex === currentPhrase.length) {
          deleting = true;
          timeoutId = setTimeout(runTyping, 1100);
          return;
        }
      } else {
        setTypingText(currentPhrase.slice(0, letterIndex - 1));
        letterIndex -= 1;
        if (letterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      timeoutId = setTimeout(runTyping, deleting ? 36 : 72);
    };

    runTyping();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("about_me")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("failed to fetch about_me:", error);
      return;
    }

    if (data) {
      setProfile({
        ...fallbackProfile,
        ...data,
        favorite_colors: data.favorite_colors || fallbackProfile.favorite_colors,
        facts: data.facts || fallbackProfile.facts,
        iconic_things: data.iconic_things || fallbackProfile.iconic_things,
        floating_notes: data.floating_notes || fallbackProfile.floating_notes,
        bubble_chats: data.bubble_chats || fallbackProfile.bubble_chats,
        usually_called: data.usually_called || fallbackProfile.usually_called,
        favorite_music: data.favorite_music || fallbackProfile.favorite_music,
        favorite_movies: data.favorite_movies || fallbackProfile.favorite_movies,
        favorite_series: data.favorite_series || fallbackProfile.favorite_series,
        favorite_anime: data.favorite_anime || fallbackProfile.favorite_anime,
        self_videos: data.self_videos || fallbackProfile.self_videos,
        video_password: data.video_password || fallbackProfile.video_password,
        audio_url: data.audio_url || fallbackProfile.audio_url,
      });
    }
  };

  const favoriteColors = profile.favorite_colors || [];
  const facts = profile.facts || [];
  const iconicThings = profile.iconic_things || [];
  const floatingNotes = profile.floating_notes || [];
  const bubbleChats = profile.bubble_chats || [];
  const usuallyCalled = profile.usually_called || [];
  const favoriteMusic = profile.favorite_music || [];
  const favoriteMovies = profile.favorite_movies || [];
  const favoriteSeries = profile.favorite_series || [];
  const favoriteAnime = profile.favorite_anime || [];
  const selfVideos =
    profile.self_videos && profile.self_videos.length > 0
      ? profile.self_videos
      : profile.self_video_url
      ? [{ title: "small video", url: profile.self_video_url }]
      : [];

  const unlockVideos = () => {
    if (!profile.video_password || videoPasswordInput === profile.video_password) {
      setVideosUnlocked(true);
      setVideoError("");
      return;
    }
    setVideoError("wrong key");
  };

  const nowPlayingAudio = profile.audio_url || "";

  const handleEnterPage = () => {
    setHasInteracted(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.42;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Autoplay blocked or audio error:", err));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}>
      <Background rainDrops={rainDrops} />

      {nowPlayingAudio && (
        <audio
          ref={audioRef}
          src={nowPlayingAudio}
          loop
          preload="auto"
        />
      )}

      {!hasInteracted && nowPlayingAudio && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020202]/95 backdrop-blur-xl transition-all duration-1000 animate-fade-in">
          <div className="text-center space-y-6 max-w-sm px-6">
            <div className="flex justify-center">
              <CloudRain size={24} className="text-[#555555] animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#666666]">welcome to a</p>
              <h2 className="text-[20px] font-light tracking-tight text-white/80">strange house.</h2>
              <p className="text-[11px] text-[#555555] leading-relaxed lowercase">this space carries sound. please step inside to hear the background track.</p>
            </div>
            <button
              onClick={handleEnterPage}
              className="px-6 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[9px] uppercase tracking-[0.2em] text-white/70 transition-all duration-500 hover:bg-white/10 hover:text-white hover:scale-105"
            >
              enter softly
            </button>
          </div>
        </div>
      )}

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.back()}
            className="group hidden shrink-0 items-center gap-2 justify-self-start text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 md:flex md:text-[9px]"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group col-start-1 row-start-1 flex min-w-0 flex-col items-start justify-self-start text-left md:col-start-2 md:items-center md:justify-self-center md:text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>
            <span className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[320px] sm:text-[8px]">
              the room owner
            </span>
          </button>
          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-14 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                {profile.page_badge}
              </p>
            </div>
            <h1 className="max-w-3xl whitespace-pre-line text-[34px] font-light leading-[1.02] tracking-[-0.07em] text-white/90 sm:text-[48px] md:text-[60px]">
              {profile.title}
            </h1>
            <p className="max-w-xl whitespace-pre-line text-[12.5px] leading-relaxed text-[#888888]">
              {profile.description}
            </p>
          </div>

          <aside className="relative overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.56)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.035),transparent_34%),radial-gradient(circle_at_86%_72%,rgba(255,255,255,0.022),transparent_36%)]" />
            <div className="relative z-10 mb-4 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                tiny profile
              </p>
              <Sparkles size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-2">
              {facts.slice(0, 4).map((fact) => (
                <TinyFactCard key={fact.label} fact={fact} />
              ))}
            </div>
          </aside>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="h-fit space-y-5 lg:sticky lg:top-32 lg:col-span-4">
            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <SectionHeader title="soft links" subtitle="not much" />
              <div className="flex flex-wrap gap-2">
                <SoftLink href={profile.spotify_url || "#"} icon={<FaSpotify size={12} />} label="spotify" />
                <SoftLink href={profile.discord_url || "#"} icon={<FaDiscord size={12} />} label="discord" />
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="border-b border-white/[0.045] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">ambient player</p>
                    <p className="mt-1 text-[8px] lowercase tracking-[0.08em] text-[#555555]">
                      {nowPlayingAudio ? (isPlaying ? "playing soft echoes" : "paused in the dark") : "the room is silent"}
                    </p>
                  </div>
                  <Music2 size={13} strokeWidth={1.5} className={`${isPlaying ? "animate-spin [animation-duration:8s]" : ""} text-[#666666]`} />
                </div>
              </div>

              <div className="p-4">
                {nowPlayingAudio ? (
                  <div className="rounded-2xl border border-white/[0.045] bg-black/30 p-4 transition-all duration-500">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={togglePlayPause}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white"
                        >
                          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} className="translate-x-[1px]" fill="currentColor" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-[8.5px] uppercase tracking-[0.16em] text-white/80 truncate">Background Melody</p>
                          <p className="mt-0.5 text-[7.5px] lowercase tracking-[0.05em] text-[#555555] truncate">looping smoothly at 42% volume</p>
                        </div>
                      </div>

                      {isPlaying && (
                        <div className="flex items-end gap-[2px] h-3 px-1">
                          <div className="w-[1.5px] bg-white/40 rounded-full animate-[wave_0.6s_ease-in-out_infinite_alternate]" />
                          <div className="w-[1.5px] bg-white/60 rounded-full animate-[wave_0.4s_ease-in-out_infinite_alternate_0.15s]" />
                          <div className="w-[1.5px] bg-white/30 rounded-full animate-[wave_0.7s_ease-in-out_infinite_alternate_0.3s]" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.045] bg-black/25 px-4 py-8 text-center text-[8px] uppercase tracking-[0.2em] text-[#555555]">
                    no track is set up yet
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <SectionHeader title="favorite colors" subtitle="palette" />
              <div className="grid gap-2">
                {favoriteColors.map((color) => (
                  <div key={color.name} className="flex items-center justify-between rounded-2xl border border-white/[0.045] bg-black/20 p-2.5">
                    <div style={{ background: color.color }} className="h-8 w-16 rounded-xl border border-white/[0.045]" />
                    <p className="text-[8px] uppercase tracking-[0.18em] text-[#888888]">{color.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <SectionHeader title="usually called" subtitle="names" />
              <div className="flex flex-wrap gap-2">
                {usuallyCalled.map((name) => (
                  <div key={name} className="rounded-full border border-white/[0.045] bg-white/[0.016] px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] shadow-[0_8px_24px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                    {name}
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="border-b border-white/[0.045] bg-white/[0.018] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/[0.055] bg-black/40 text-[#777777]">
                    {profile.self_image_url ? (
                      <img src={profile.self_image_url} alt="profile" className="h-full w-full object-cover grayscale opacity-85" />
                    ) : (
                      <Sparkles size={13} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.22em] text-white/75">room owner</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {bubbleChats.map((chat, index) => (
                  <ChatBubble key={index} chat={chat} />
                ))}
                <div className="flex items-center gap-2 rounded-full border border-white/[0.045] bg-black/30 px-4 py-3 text-[#666666]">
                  <span className="min-h-[12px] flex-1 text-[8px] tracking-[0.08em]">
                    {typingText}
                    <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-white/35" />
                  </span>
                  <Send size={11} strokeWidth={1.5} className="text-[#888888]" />
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-8 lg:col-span-8">
            <section>
              <SectionHeader title="how people remember me" subtitle="small signs" />
              <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                <div className="grid gap-3">
                  {iconicThings.map((item, index) => (
                    <IconicRow key={item.title} item={item} index={index + 1} />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="soft media" subtitle="small pieces" />
              <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between border-b border-white/[0.045] pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={13} strokeWidth={1.5} className="text-[#777777]" />
                      <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">locked portrait</p>
                    </div>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#444444]">{videosUnlocked ? "open" : "private"}</p>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-[1.35rem] border border-dashed border-white/[0.045] bg-black/25 px-5 text-center">
                      <ImageIcon size={18} strokeWidth={1.5} className="text-[#555555]" />
                      <div>
                        <p className="text-[11px] leading-relaxed text-[#8a8a8a]">this item is hidden away.</p>
                        <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-[#555555]">enter the security key to see</p>
                      </div>
                    </div>
                  ) : profile.self_image_url ? (
                    <img src={profile.self_image_url} alt="quiet portrait" className="max-h-[360px] w-full rounded-[1.35rem] object-cover grayscale opacity-80" />
                  ) : (
                    <div className="flex min-h-[260px] items-center justify-center rounded-[1.35rem] border border-dashed border-white/[0.045] bg-black/25 text-[#555555]">
                      <ImageIcon size={18} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between border-b border-white/[0.045] pb-3">
                    <div className="flex items-center gap-2">
                      <Video size={13} strokeWidth={1.5} className="text-[#777777]" />
                      <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">locked tape</p>
                    </div>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#444444]">{videosUnlocked ? "open" : "private"}</p>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[260px] flex-col justify-center rounded-[1.35rem] border border-dashed border-white/[0.045] bg-black/25 p-5">
                      <p className="text-[12px] leading-relaxed text-[#8a8a8a]">this fragment requires a passcode.</p>
                      <div className="mt-5 flex items-center gap-3 rounded-full border border-white/[0.055] bg-black/35 px-4 py-3">
                        <input
                          type="password"
                          value={videoPasswordInput}
                          onChange={(e) => setVideoPasswordInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") unlockVideos(); }}
                          placeholder="passcode"
                          className="min-w-0 flex-1 bg-transparent text-[8px] uppercase tracking-[0.18em] text-[#d0d0d0] outline-none placeholder:text-[#555555]"
                        />
                        <button
                          type="button"
                          onClick={unlockVideos}
                          className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#888888] transition hover:text-white"
                        >
                          unlock
                        </button>
                      </div>
                      {videoError && <p className="mt-3 text-[8px] uppercase tracking-[0.18em] text-[#d9534f]">{videoError}</p>}
                    </div>
                  ) : selfVideos.length > 0 ? (
                    <div className="grid gap-3">
                      {selfVideos.map((video) => (
                        <div key={video.url} className="overflow-hidden rounded-2xl border border-white/[0.045] bg-black/30 p-2">
                          <video src={video.url} controls playsInline className="max-h-[340px] w-full rounded-xl bg-black object-cover grayscale opacity-80" />
                          <p className="mt-2 px-1 text-[8px] uppercase tracking-[0.18em] text-[#777777]">{video.title}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[1.35rem] border border-dashed border-white/[0.045] bg-black/25 text-[#555555]">
                      <Video size={18} strokeWidth={1.5} />
                      <p className="text-[8px] uppercase tracking-[0.2em]">no videos available</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title={profile.note_title || "not a biography"} subtitle="just traces" />
              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-2 text-[#777777]">
                    <BookOpen size={13} strokeWidth={1.5} />
                    <p className="text-[8px] uppercase tracking-[0.22em]">short note</p>
                  </div>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#9a9a9a]">{profile.note_text}</p>
                </div>

                <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="space-y-3">
                    {floatingNotes.map((note) => (
                      <div key={note} className="rounded-2xl border border-white/[0.045] bg-black/20 px-4 py-3 text-[11px] leading-relaxed text-[#777777]">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="favorite shelves" subtitle="things staying here" />
              <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                <div className="grid gap-8 xl:grid-cols-2">
                  <FavoriteShelf title="music" items={favoriteMusic} />
                  <FavoriteShelf title="movies" items={favoriteMovies} />
                  <FavoriteShelf title="series" items={favoriteSeries} />
                  <FavoriteShelf title="anime" items={favoriteAnime} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <p className="mx-auto max-w-xl whitespace-pre-line text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          {profile.footer_text}
        </p>
      </footer>

      <GlobalStyles />
    </main>
  );
}

const ChatBubble = ({ chat }: { chat: { side: "left" | "right"; text: string } }) => (
  <div className={`flex ${chat.side === "right" ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[86%] rounded-3xl border border-white/[0.045] px-4 py-3 text-[10.5px] leading-relaxed text-[#9a9a9a] shadow-[0_12px_30px_rgba(0,0,0,0.22)] ${
      chat.side === "right" ? "rounded-br-md bg-white/[0.055] text-[#d8d8d8]" : "rounded-bl-md bg-black/30"
    }`}>
      {chat.text}
    </div>
  </div>
);

const TinyFactCard = ({ fact }: { fact: { label: string; value: string } }) => (
  <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-3">
    <p className="text-[7px] uppercase tracking-[0.18em] text-[#666666]">{fact.label}</p>
    <p className="mt-1.5 text-[11px] leading-relaxed text-white/75">{fact.value}</p>
  </div>
);

const IconicRow = ({ item, index }: { item: { title: string; line: string }; index: number }) => (
  <div className="group grid gap-3 rounded-2xl border border-white/[0.045] bg-black/20 p-4 transition-all duration-700 hover:border-white/10 hover:bg-white/[0.026] sm:grid-cols-[52px_1fr_auto] sm:items-center">
    <div className="flex items-center gap-3 text-[#777777]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.045] bg-white/[0.014] text-[8px] uppercase tracking-[0.16em] text-[#666666]">
        {String(index).padStart(2, "0")}
      </span>
    </div>
    <div>
      <div className="mb-1 flex items-center gap-2 text-[#777777]">
        <p className="text-[8px] uppercase tracking-[0.2em]">{item.title}</p>
      </div>
      <p className="max-w-xl text-[11.5px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-[#b8b8b8]">
        {item.line}
      </p>
    </div>
    <ArrowUpRight size={12} className="hidden text-[#444444] transition-colors duration-700 group-hover:text-white/70 sm:block" />
  </div>
);

const SoftLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.18em] text-[#666666] shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/70"
  >
    {icon}
    {label}
  </a>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.045] pb-3">
    <h3 className="text-[11.5px] font-light tracking-wide text-white/70">{title}</h3>
    <p className="text-[8px] uppercase tracking-[0.2em] text-[#444444]">{subtitle}</p>
  </div>
);

const FavoriteShelf = ({ title, items }: { title: string; items: FavoriteItem[] }) => {
  const safeItems = items.filter((item) => item.title || item.image_url || item.link);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={11} strokeWidth={1.5} className="text-[#666666]" />
        <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">{title}</p>
      </div>

      {safeItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {safeItems.map((item, index) => {
            const card = (
              <>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover grayscale opacity-45 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-82" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#444444]">
                    <Sparkles size={18} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/48 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <p className="line-clamp-2 text-[8px] uppercase tracking-[0.16em] text-white/85">{item.title}</p>
                  {(item.subtitle || item.year) && (
                    <p className="line-clamp-1 text-[7px] uppercase tracking-[0.14em] text-[#777777]">
                      {[item.subtitle, item.year].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </>
            );

            const className = "group relative aspect-square overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] shadow-[0_18px_50px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.026]";

            if (!item.link) {
              return (
                <div key={`${item.title}-${index}`} className={className}>
                  {card}
                </div>
              );
            }

            return (
              <a
                key={`${item.title}-${index}`}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {card}
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[150px] items-center justify-center rounded-3xl border border-dashed border-white/[0.045] bg-black/25 text-[8px] uppercase tracking-[0.2em] text-[#555555]">
          nothing saved here yet
        </div>
      )}
    </div>
  );
};

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
            style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed left-[10%] top-0 z-[2] h-px w-[28%] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none fixed bottom-0 right-[12%] z-[2] h-px w-[24%] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      html, body {
        scroll-behavior: smooth;
        background: #020202;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
      }
      body::-webkit-scrollbar, html::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }
      body::-webkit-scrollbar-track, html::-webkit-scrollbar-track {
        background: linear-gradient(180deg, rgba(7, 7, 7, 0.96), rgba(2, 2, 2, 1));
      }
      body::-webkit-scrollbar-thumb, html::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.07));
        border: 2px solid #020202;
      }
      .rain-container { position: fixed; inset: 0; width: 100%; height: 100%; }
      .drop { width: 1px; height: 65px; animation: rain linear infinite; }
      @keyframes rain { 0% { transform: translateY(-100px); } 100% { transform: translateY(105vh); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      .animate-fade-in { animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      
      @keyframes wave {
        0% { height: 4px; }
        100% { height: 14px; }
      }
    `}</style>
  );
}
