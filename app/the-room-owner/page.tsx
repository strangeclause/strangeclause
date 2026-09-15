"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CloudRain,
  Image as ImageIcon,
  Music2,
  Pause,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { FaDiscord, FaSpotify } from "react-icons/fa";
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
};

type SelfVideo = {
  title: string;
  url: string;
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
  self_videos?: SelfVideo[] | null;
  video_password?: string | null;
  note_title: string | null;
  note_text: string | null;
  favorite_colors:
    | {
        name: string;
        color: string;
      }[]
    | null;
  facts:
    | {
        label: string;
        value: string;
      }[]
    | null;
  iconic_things:
    | {
        title: string;
        line: string;
      }[]
    | null;
  floating_notes: string[] | null;
  bubble_chats:
    | {
        side: "left" | "right";
        text: string;
      }[]
    | null;
  usually_called: string[] | null;
  favorite_music: FavoriteItem[] | null;
  favorite_movies: FavoriteItem[] | null;
  favorite_series: FavoriteItem[] | null;
  favorite_anime: FavoriteItem[] | null;
};

const fallbackProfile: AboutProfile = {
  id: 1,
  page_badge: "a little room",
  title: "mostly quiet, but not empty.",
  description:
    "a small page for the person who keeps this strange house open.",
  footer_text:
    "nothing too private, just the little things that keep showing up.",
  spotify_url: "https://open.spotify.com/",
  discord_url: "https://discord.com/",
  self_image_url: "",
  self_video_url: "",
  self_videos: [],
  video_password: "",
  note_title: "not a biography",
  note_text:
    "i like pages that feel quiet, little flowers by the window, and music that sounds like someone stayed in the room a little longer.",
  favorite_colors: [
    {
      name: "dusty rose",
      color: "#d7a8b8",
    },
  ],
  facts: [
    {
      label: "favorite mood",
      value: "quiet rainy night",
    },
    {
      label: "favorite color",
      value: "soft pink",
    },
    {
      label: "favorite sound",
      value: "soft music",
    },
    {
      label: "comfort thing",
      value: "ice americano",
    },
  ],
  iconic_things: [
    {
      title: "glasses almost every time",
      line: "the small thing people notice first when i go outside.",
    },
    {
      title: "soft pink things",
      line: "colors i keep choosing because they make everything feel a little gentler.",
    },
    {
      title: "quiet but still present",
      line: "i can stay soft in the room, but i still notice tiny things around me.",
    },
    {
      title: "messy thoughts, pretty spaces",
      line: "my mind can be hard to sort, so i make the page feel neat instead.",
    },
  ],
  floating_notes: [
    "not everything needs to be loud.",
    "some things are kept because they feel warm.",
    "flowers make ordinary corners feel less empty.",
    "this page only tells the soft parts.",
  ],
  bubble_chats: [
    {
      side: "right",
      text: "how do i usually call you?",
    },
    {
      side: "left",
      text: "probably the same name i always use.",
    },
  ],
  usually_called: ["elsa", "kak", "room owner"],
  favorite_music: [
    {
      title: "late night songs",
      image_url: "",
      link: "https://open.spotify.com/",
    },
  ],
  favorite_movies: [
    {
      title: "quiet cinema",
      image_url: "",
      link: "",
    },
  ],
  favorite_series: [
    {
      title: "rainy series",
      image_url: "",
      link: "",
    },
  ],
  favorite_anime: [
    {
      title: "soft anime",
      image_url: "",
      link: "",
    },
  ],
};

export default function TheRoomOwnerPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<AboutProfile>(fallbackProfile);

  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [videoPasswordInput, setVideoPasswordInput] =
    useState("");

  const [videosUnlocked, setVideosUnlocked] =
    useState(false);

  const [videoError, setVideoError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nowPlayingAudio = profile.audio_url ?? null;

  const usuallyCalled = profile.usually_called || [];
  const facts = profile.facts || [];
  const iconicThings = profile.iconic_things || [];
  const floatingNotes = profile.floating_notes || [];

  const favoriteMusic = profile.favorite_music || [];
  const favoriteMovies = profile.favorite_movies || [];
  const favoriteSeries = profile.favorite_series || [];
  const favoriteAnime = profile.favorite_anime || [];

  const selfVideos =
    profile.self_videos && profile.self_videos.length > 0
      ? profile.self_videos
      : profile.self_video_url
        ? [
            {
              title: "small video",
              url: profile.self_video_url,
            },
          ]
        : [];

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(
      () => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${1.4 + Math.random() * 1.8}s`,
      }),
    );

    setRainDrops(drops);
  }, []);

  useEffect(() => {
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
          favorite_colors:
            data.favorite_colors ||
            fallbackProfile.favorite_colors,
          facts: data.facts || fallbackProfile.facts,
          iconic_things:
            data.iconic_things ||
            fallbackProfile.iconic_things,
          floating_notes:
            data.floating_notes ||
            fallbackProfile.floating_notes,
          bubble_chats:
            data.bubble_chats ||
            fallbackProfile.bubble_chats,
          usually_called:
            data.usually_called ||
            fallbackProfile.usually_called,
          favorite_music:
            data.favorite_music ||
            fallbackProfile.favorite_music,
          favorite_movies:
            data.favorite_movies ||
            fallbackProfile.favorite_movies,
          favorite_series:
            data.favorite_series ||
            fallbackProfile.favorite_series,
          favorite_anime:
            data.favorite_anime ||
            fallbackProfile.favorite_anime,
          self_videos:
            data.self_videos ||
            fallbackProfile.self_videos,
          video_password:
            data.video_password ||
            fallbackProfile.video_password,
        });
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!audioRef.current || !nowPlayingAudio) {
      return;
    }

    audioRef.current.load();
  }, [nowPlayingAudio]);

  const handleEnterPage = async () => {
    setHasInteracted(true);

    if (!audioRef.current || !nowPlayingAudio) {
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !nowPlayingAudio) {
      return;
    }

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const unlockVideos = () => {
    if (
      !profile.video_password ||
      videoPasswordInput === profile.video_password
    ) {
      setVideosUnlocked(true);
      setVideoError("");
      return;
    }

    setVideoError("wrong key");
  };

  return (
    <main
      className={`${inter.className} min-h-screen overflow-x-hidden bg-[#fff3f6] text-[#4b3d43] font-light text-[13px] antialiased selection:bg-[#d9aebd]/30 selection:text-[#49363e]`}
    >
      <Background rainDrops={rainDrops} />

      {/* soft decorative flowers */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[18%] rotate-[-15deg] text-[19px] text-[#c995aa]/45">
          ୨୧
        </div>

        <div className="absolute right-[10%] top-[30%] rotate-[12deg] text-[15px] text-[#c995aa]/35">
          ୨୧
        </div>

        <div className="absolute left-[45%] top-[10%] text-[13px] text-[#b9879d]/30">
          ❀
        </div>

        <div className="absolute right-[25%] bottom-[20%] rotate-[-10deg] text-[17px] text-[#c995aa]/30">
          ❁
        </div>

        <div className="absolute left-[5%] bottom-[12%] text-[14px] text-[#bd91a3]/30">
          ✿
        </div>
      </div>

      {nowPlayingAudio && (
        <audio
          ref={audioRef}
          src={nowPlayingAudio}
          loop
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {!hasInteracted && nowPlayingAudio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fff3f6]/90 px-5 backdrop-blur-2xl">
          <div className="relative w-[320px] overflow-hidden border border-white/80 bg-white/65 p-7 text-center shadow-[0_30px_90px_rgba(174,112,137,0.18)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute -right-5 -top-5 text-[42px] text-[#d9aabc]/25">
              ❀
            </div>

            <div className="pointer-events-none absolute -bottom-5 -left-4 rotate-[-20deg] text-[34px] text-[#d6a5b6]/20">
              ୨୧
            </div>

            <CloudRain
              size={20}
              strokeWidth={1.3}
              className="mx-auto mb-5 text-[#9b7181]"
            />

            <p className="mb-1 text-[8px] uppercase tracking-[0.28em] text-[#a1848e]">
              welcome to
            </p>

            <h2 className="text-[19px] font-medium tracking-[-0.03em] text-[#4d3b43]">
              a strange house.
            </h2>

            <p className="mt-3 text-[10px] leading-relaxed text-[#967c85]">
              this space carries sound. step inside to hear the room.
            </p>

            <button
              type="button"
              onClick={handleEnterPage}
              className="mt-6 border border-[#b8899b]/25 bg-white/60 px-6 py-2.5 text-[8px] uppercase tracking-[0.2em] text-[#775a65] transition hover:bg-white/90"
            >
              enter softly
            </button>
          </div>
        </div>
      )}

      <nav className="fixed left-0 right-0 top-0 z-[60] h-[58px] border-b border-[#b8869a]/10 bg-white/75 backdrop-blur-2xl">
        <div className="flex h-full items-center justify-between px-5 md:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#957d86] transition hover:text-[#4b3d43]"
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            leave
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#59464e]">
              strange clause
            </p>

            <p className="mt-0.5 text-[7px] tracking-[0.16em] text-[#ae929d]">
              the room owner
            </p>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-white bg-[#e4b9c7]" />
            <span className="h-2.5 w-2.5 rounded-full border border-white bg-[#cdb9d9]" />
            <span className="h-2.5 w-2.5 rounded-full border border-white bg-[#b9cdd0]" />
          </div>
        </div>
      </nav>

      <div className="relative z-20 mx-auto min-h-screen max-w-[1450px] px-3 pb-12 pt-[74px] md:px-8">
        <div className="grid min-h-[calc(100vh-100px)] overflow-hidden border border-white/80 bg-white/55 shadow-[0_35px_100px_rgba(168,111,133,0.18)] backdrop-blur-2xl lg:grid-cols-[390px_1fr]">
          <aside className="relative border-b border-[#b8869a]/10 bg-[#fff0f3]/70 lg:border-b-0 lg:border-r">
            <div className="relative h-[185px] overflow-hidden bg-[#edcdd7]">
              {profile.self_image_url ? (
                <img
                  src={profile.self_image_url}
                  alt=""
                  className="h-full w-full object-cover opacity-80"
                />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_72%_20%,rgba(255,255,255,.9),transparent_28%),radial-gradient(circle_at_20%_75%,rgba(255,218,228,.8),transparent_30%),linear-gradient(135deg,#e8c6d1,#f4dfe5_55%,#d9c9df)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[#fff0f3]" />

              <div className="absolute left-[15%] top-[22%] rotate-[-12deg] text-[19px] text-white/65">
                ❀
              </div>

              <div className="absolute right-[18%] top-[35%] rotate-[12deg] text-[15px] text-white/60">
                ୨୧
              </div>

              <div className="absolute bottom-[15%] left-[55%] text-[20px] text-white/55">
                ✿
              </div>
            </div>

            <div className="relative px-6">
              <div className="absolute -top-[62px] left-6">
                <div className="h-[108px] w-[108px] rounded-full border-[6px] border-[#fff0f3] bg-[#ead8dd] shadow-[0_8px_30px_rgba(130,88,103,.15)]">
                  {profile.self_image_url ? (
                    <img
                      src={profile.self_image_url}
                      alt="profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#b28b99]">
                      <Sparkles size={24} strokeWidth={1.3} />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-[2px] right-[3px] flex h-6 w-6 items-center justify-center rounded-full border-[4px] border-[#fff0f3] bg-[#8daa98]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="pt-[65px]">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h1 className="text-[22px] font-semibold tracking-[-0.045em] text-[#493b42]">
                      404Candle
                    </h1>

                    <p className="mt-0.5 text-[11px] text-[#967e87]">
                      strangeclause
                      <span className="mx-1.5 text-[#c5a9b2]">
                        •
                      </span>
                      donotexist
                    </p>
                  </div>

                  <span className="border border-[#b8869a]/15 bg-white/55 px-2 py-1 text-[7px] uppercase tracking-[0.15em] text-[#a0838d]">
                    {profile.page_badge}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.discord_url) {
                        window.open(
                          profile.discord_url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    className="flex-1 bg-[#ad7d8e] px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white shadow-sm transition hover:bg-[#9d6e80]"
                  >
                    message
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (profile.spotify_url) {
                        window.open(
                          profile.spotify_url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center border border-[#b8869a]/15 bg-white/55 text-[#8c6876] transition hover:bg-white/85"
                    aria-label="spotify"
                  >
                    <FaSpotify size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (profile.discord_url) {
                        window.open(
                          profile.discord_url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center border border-[#b8869a]/15 bg-white/55 text-[#8c6876] transition hover:bg-white/85"
                    aria-label="discord"
                  >
                    <FaDiscord size={14} />
                  </button>
                </div>

                <div className="mt-6 border-t border-[#b8869a]/10 pt-5">
                  <p className="whitespace-pre-line text-[11px] leading-[1.75] text-[#715d65]">
                    {profile.description}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-[#b8869a]/10 pt-5">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#ae929d]">
                      member since
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#67545d]">
                      Jan 12, 2022
                    </p>
                  </div>

                  <div>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#ae929d]">
                      currently
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#67545d]">
                      {isPlaying
                        ? "listening quietly"
                        : "somewhere quiet"}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#b8869a]/10 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                      connections
                    </p>

                    <ArrowUpRight
                      size={11}
                      strokeWidth={1.4}
                      className="text-[#b69ca5]"
                    />
                  </div>

                  <div className="space-y-2">
                    <a
                      href={profile.discord_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 border border-[#b8869a]/10 bg-white/40 px-3 py-2.5 transition hover:bg-white/70"
                    >
                      <div className="flex h-7 w-7 items-center justify-center bg-[#ead7dd] text-[#916d7b]">
                        <FaDiscord size={13} />
                      </div>

                      <div>
                        <p className="text-[9px] font-medium text-[#5f4d55]">
                          discord
                        </p>

                        <p className="text-[7px] text-[#aa929b]">
                          ohmycouffee
                        </p>
                      </div>

                      <ArrowUpRight
                        size={10}
                        className="ml-auto text-[#bba4ad]"
                      />
                    </a>

                    <a
                      href={profile.spotify_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 border border-[#b8869a]/10 bg-white/40 px-3 py-2.5 transition hover:bg-white/70"
                    >
                      <div className="flex h-7 w-7 items-center justify-center bg-[#ead7dd] text-[#916d7b]">
                        <FaSpotify size={13} />
                      </div>

                      <div>
                        <p className="text-[9px] font-medium text-[#5f4d55]">
                          spotify
                        </p>

                        <p className="text-[7px] text-[#aa929b]">
                          404Candle
                        </p>
                      </div>

                      <ArrowUpRight
                        size={10}
                        className="ml-auto text-[#bba4ad]"
                      />
                    </a>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#b8869a]/10 pt-5">
                  <p className="mb-3 text-[8px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                    usually called
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {usuallyCalled.map((name) => (
                      <span
                        key={name}
                        className="border border-[#b8869a]/10 bg-white/40 px-2.5 py-1.5 text-[8px] text-[#856d77]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 mb-6 border border-[#b8869a]/10 bg-white/40 p-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ad7d8e] text-white transition hover:bg-[#9d6e80]"
                      aria-label={
                        isPlaying ? "pause music" : "play music"
                      }
                    >
                      {isPlaying ? (
                        <Pause
                          size={10}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={10}
                          fill="currentColor"
                          className="translate-x-[1px]"
                        />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="truncate text-[8px] uppercase tracking-[0.13em] text-[#6d5962]">
                        background melody
                      </p>

                      <p className="mt-1 truncate text-[7px] text-[#ac949d]">
                        {isPlaying
                          ? "playing softly"
                          : "paused in the room"}
                      </p>
                    </div>

                    {isPlaying && (
                      <Music2
                        size={13}
                        className="ml-auto animate-pulse text-[#a77d8c]"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 bg-white/45">
            <div className="sticky top-0 z-20 border-b border-[#b8869a]/10 bg-white/80 px-6 backdrop-blur-2xl md:px-8">
              <div className="flex h-[66px] items-end gap-7">
                <button
                  type="button"
                  className="relative h-full pt-2 text-[10px] font-medium text-[#59464e]"
                >
                  board

                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ad7d8e]" />
                </button>

                <button
                  type="button"
                  className="h-full pb-[21px] text-[10px] text-[#ae999f] transition hover:text-[#755d66]"
                >
                  activity
                </button>

                <button
                  type="button"
                  className="h-full pb-[21px] text-[10px] text-[#ae999f] transition hover:text-[#755d66]"
                >
                  wishlist
                </button>
              </div>
            </div>

            <div className="space-y-7 p-6 md:p-8">
              <section>
                <div className="flex items-end justify-between border-b border-[#b8869a]/10 pb-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#b0969e]">
                      your board
                    </p>

                    <h2 className="mt-1 text-[18px] font-medium tracking-[-0.035em] text-[#5a484f]">
                      little things staying here.
                    </h2>
                  </div>

                  <Sparkles
                    size={14}
                    strokeWidth={1.3}
                    className="text-[#c09eaa]"
                  />
                </div>
              </section>

              <section className="border border-white/70 bg-white/45 p-5 shadow-[0_15px_45px_rgba(168,111,133,0.055)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-[#67535b]">
                      games i like
                    </p>

                    <p className="mt-1 text-[8px] text-[#ad979f]">
                      things i keep coming back to
                    </p>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center border border-[#b8869a]/10 bg-white/55 text-[#977986]">
                    +
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      title: "fisch",
                      image:
                        favoriteGamesImage(
                          favoriteMusic,
                          0,
                        ),
                    },
                    {
                      title: "valorant",
                      image:
                        favoriteGamesImage(
                          favoriteMovies,
                          0,
                        ),
                    },
                    {
                      title: "mobile legends",
                      image:
                        favoriteGamesImage(
                          favoriteSeries,
                          0,
                        ),
                    },
                    {
                      title: "roblox",
                      image:
                        favoriteGamesImage(
                          favoriteAnime,
                          0,
                        ),
                    },
                  ].map((game, index) => (
                    <div
                      key={`${game.title}-${index}`}
                      className="group relative aspect-[1.15] overflow-hidden border border-white/70 bg-[#efdce2]"
                    >
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.title}
                          className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#c09eaa]">
                          <Sparkles
                            size={18}
                            strokeWidth={1.3}
                          />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#553f48]/60 to-transparent p-3 pt-8">
                        <p className="text-[8px] uppercase tracking-[0.12em] text-white/95">
                          {game.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                    small details
                  </p>

                  <p className="text-[7px] uppercase tracking-[0.15em] text-[#b39da5]">
                    about the room owner
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {facts.slice(0, 4).map((fact) => (
                    <div
                      key={fact.label}
                      className="border border-white/65 bg-white/35 p-4 transition hover:bg-white/55"
                    >
                      <p className="text-[7px] uppercase tracking-[0.18em] text-[#b39da5]">
                        {fact.label}
                      </p>

                      <p className="mt-2 text-[11px] leading-relaxed text-[#705c64]">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                  <p className="text-[11px] font-medium text-[#69555d]">
                    how people remember me
                  </p>

                  <p className="mt-1 text-[8px] text-[#ad979f]">
                    small signs
                  </p>
                </div>

                <div className="border border-white/65 bg-white/30">
                  {iconicThings.map((item, index) => (
                    <div
                      key={item.title}
                      className="group grid gap-3 border-b border-[#b8869a]/[0.07] px-4 py-4 last:border-b-0 sm:grid-cols-[45px_1fr_auto] sm:items-center"
                    >
                      <span className="text-[8px] tracking-[0.12em] text-[#b59da6]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#806872]">
                          {item.title}
                        </p>

                        <p className="mt-1.5 max-w-2xl text-[10.5px] leading-relaxed text-[#9b858d] transition group-hover:text-[#745d66]">
                          {item.line}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={12}
                        className="hidden text-[#c0a8b0] sm:block"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                  <p className="text-[11px] font-medium text-[#69555d]">
                    soft media
                  </p>

                  <p className="mt-1 text-[8px] text-[#ad979f]">
                    things kept a little private
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-white/65 bg-white/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon
                          size={12}
                          strokeWidth={1.4}
                          className="text-[#9d7d89]"
                        />

                        <p className="text-[8px] uppercase tracking-[0.17em] text-[#957983]">
                          locked portrait
                        </p>
                      </div>

                      <span className="text-[7px] uppercase tracking-[0.15em] text-[#b49da5]">
                        {videosUnlocked ? "open" : "private"}
                      </span>
                    </div>

                    {!videosUnlocked ? (
                      <div className="flex min-h-[270px] flex-col items-center justify-center border border-dashed border-[#bd9ba8]/20 bg-[#f4e4e8]/40 text-center">
                        <ImageIcon
                          size={18}
                          strokeWidth={1.3}
                          className="text-[#c09eaa]"
                        />

                        <p className="mt-4 text-[10px] text-[#987e87]">
                          this item is hidden away.
                        </p>

                        <p className="mt-1 text-[7px] uppercase tracking-[0.15em] text-[#b9a1a9]">
                          enter the security key to see
                        </p>
                      </div>
                    ) : profile.self_image_url ? (
                      <img
                        src={profile.self_image_url}
                        alt="quiet portrait"
                        className="max-h-[370px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex min-h-[270px] items-center justify-center border border-dashed border-[#bd9ba8]/20 text-[#c09eaa]">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="border border-white/65 bg-white/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video
                          size={12}
                          strokeWidth={1.4}
                          className="text-[#9d7d89]"
                        />

                        <p className="text-[8px] uppercase tracking-[0.17em] text-[#957983]">
                          locked tape
                        </p>
                      </div>

                      <span className="text-[7px] uppercase tracking-[0.15em] text-[#b49da5]">
                        {videosUnlocked ? "open" : "private"}
                      </span>
                    </div>

                    {!videosUnlocked ? (
                      <div className="flex min-h-[270px] flex-col justify-center border border-dashed border-[#bd9ba8]/20 bg-[#f4e4e8]/40 p-5">
                        <p className="text-[11px] text-[#987e87]">
                          this fragment requires a passcode.
                        </p>

                        <div className="mt-5 flex border border-[#bd9ba8]/15 bg-white/55">
                          <input
                            type="password"
                            value={videoPasswordInput}
                            onChange={(e) =>
                              setVideoPasswordInput(
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                unlockVideos();
                              }
                            }}
                            placeholder="passcode"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[8px] uppercase tracking-[0.16em] text-[#67545d] outline-none placeholder:text-[#bea6ae]"
                          />

                          <button
                            type="button"
                            onClick={unlockVideos}
                            className="border-l border-[#bd9ba8]/15 px-4 text-[7px] uppercase tracking-[0.15em] text-[#91737f] transition hover:bg-white/70"
                          >
                            unlock
                          </button>
                        </div>

                        {videoError && (
                          <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#b16e7d]">
                            {videoError}
                          </p>
                        )}
                      </div>
                    ) : selfVideos.length > 0 ? (
                      <div className="space-y-3">
                        {selfVideos.map((video) => (
                          <div
                            key={video.url}
                            className="border border-[#bd9ba8]/10 bg-[#f3e4e8]/45 p-2"
                          >
                            <video
                              src={video.url}
                              controls
                              playsInline
                              className="max-h-[340px] w-full object-cover"
                            />

                            <p className="mt-2 px-1 text-[8px] uppercase tracking-[0.16em] text-[#957983]">
                              {video.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-[270px] items-center justify-center border border-dashed border-[#bd9ba8]/20 text-[8px] uppercase tracking-[0.15em] text-[#b9a1a9]">
                        no videos available
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                  <p className="text-[11px] font-medium text-[#69555d]">
                    {profile.note_title || "not a biography"}
                  </p>

                  <p className="mt-1 text-[8px] text-[#ad979f]">
                    just traces
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
                  <div className="border border-white/65 bg-white/35 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <BookOpen
                        size={13}
                        strokeWidth={1.4}
                        className="text-[#9d7d89]"
                      />

                      <p className="text-[8px] uppercase tracking-[0.18em] text-[#957983]">
                        short note
                      </p>
                    </div>

                    <p className="whitespace-pre-line text-[11.5px] leading-[1.8] text-[#7c6870]">
                      {profile.note_text}
                    </p>
                  </div>

                  <div className="space-y-2 border border-white/65 bg-white/30 p-4">
                    {floatingNotes.map((note) => (
                      <div
                        key={note}
                        className="border border-[#bd9ba8]/10 bg-white/35 px-3 py-3 text-[10px] leading-relaxed text-[#927b84]"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                  <p className="text-[11px] font-medium text-[#69555d]">
                    favorite shelves
                  </p>

                  <p className="mt-1 text-[8px] text-[#ad979f]">
                    things staying here
                  </p>
                </div>

                <div className="border border-white/65 bg-white/30 p-5">
                  <div className="grid gap-7 xl:grid-cols-2">
                    <FavoriteShelf
                      title="music"
                      items={favoriteMusic}
                    />

                    <FavoriteShelf
                      title="movies"
                      items={favoriteMovies}
                    />

                    <FavoriteShelf
                      title="series"
                      items={favoriteSeries}
                    />

                    <FavoriteShelf
                      title="anime"
                      items={favoriteAnime}
                    />
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>

      <footer className="relative z-20 border-t border-[#b8869a]/10 bg-[#fff3f6]/85 px-6 py-12 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl whitespace-pre-line text-[9px] leading-relaxed tracking-[0.12em] text-[#ad979f]">
          {profile.footer_text}
        </p>

        <div className="mt-5 flex justify-center gap-3 text-[13px] text-[#c092a3]/50">
          <span>✿</span>
          <span>୨୧</span>
          <span>❀</span>
          <span>୨୧</span>
          <span>✿</span>
        </div>
      </footer>

      <GlobalStyles />
    </main>
  );
}

function favoriteGamesImage(
  items: FavoriteItem[],
  index: number,
) {
  return items[index]?.image_url || "";
}

function FavoriteShelf({
  title,
  items,
}: {
  title: string;
  items: FavoriteItem[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles
          size={11}
          strokeWidth={1.5}
          className="text-[#b38b9a]"
        />

        <p className="text-[8px] uppercase tracking-[0.22em] text-[#806b74]">
          {title}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden border border-white/70 bg-[#f3dfe5] shadow-[0_18px_50px_rgba(168,111,133,0.10)] transition-all duration-700 hover:-translate-y-1 hover:border-white"
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#c09eaa]">
                <Sparkles size={18} />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#654d57]/65 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 right-3">
              <p className="line-clamp-2 text-[8px] uppercase tracking-[0.16em] text-white/90">
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Background({
  rainDrops,
}: {
  rainDrops: RainDrop[];
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.8),transparent_42%),radial-gradient(circle_at_8%_42%,rgba(255,224,234,0.7),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(224,211,236,0.6),transparent_32%),linear-gradient(180deg,#fff5f7_0%,#fbecef_50%,#fff6f8_100%)]" />

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.18)_100%)]" />

      <div className="rain-container pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-[0.12]">
        {rainDrops.map((drop, index) => (
          <div
            key={index}
            className="drop absolute bg-gradient-to-b from-transparent to-[#b78d9c]/30"
            style={{
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none fixed left-[10%] top-0 z-[2] h-px w-[28%] bg-gradient-to-r from-transparent via-[#d6a8b7]/20 to-transparent" />

      <div className="pointer-events-none fixed bottom-0 right-[12%] z-[2] h-px w-[24%] bg-gradient-to-r from-transparent via-[#d6a8b7]/15 to-transparent" />
    </>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      html,
      body {
        scroll-behavior: smooth;
        background: #fff3f6;
        scrollbar-width: thin;
        scrollbar-color: rgba(173, 125, 142, 0.35)
          rgba(255, 255, 255, 0.4);
      }

      body {
        -ms-overflow-style: auto;
      }

      body::-webkit-scrollbar,
      html::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }

      body::-webkit-scrollbar-track,
      html::-webkit-scrollbar-track {
        background: #fff1f4;
      }

      body::-webkit-scrollbar-thumb,
      html::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: linear-gradient(
          180deg,
          rgba(173, 125, 142, 0.45),
          rgba(173, 125, 142, 0.2)
        );
        border: 2px solid #fff3f6;
      }

      body::-webkit-scrollbar-thumb:hover,
      html::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(157, 110, 128, 0.6),
          rgba(173, 125, 142, 0.3)
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

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    `}</style>
  );
}
