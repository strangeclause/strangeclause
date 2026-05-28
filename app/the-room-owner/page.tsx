"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CloudRain,
  Sparkles,
  BookOpen,
  ArrowUpRight,
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

type AboutProfile = {
  id: number;
  page_badge: string | null;
  title: string | null;
  description: string | null;
  footer_text: string | null;
  spotify_url: string | null;
  discord_url: string | null;
  note_title: string | null;
  note_text: string | null;
  favorite_colors: { name: string; color: string }[] | null;
  facts: { label: string; value: string }[] | null;
  iconic_things: { title: string; line: string }[] | null;
  floating_notes: string[] | null;

  bubble_chats:
    | {
        side: "left" | "right";
        text: string;
      }[]
    | null;

  usually_called: string[] | null;

  favorite_music:
    | {
        title: string;
        image_url: string;
        link: string;
      }[]
    | null;

  favorite_movies:
    | {
        title: string;
        image_url: string;
        link: string;
      }[]
    | null;

  favorite_series:
    | {
        title: string;
        image_url: string;
        link: string;
      }[]
    | null;

  favorite_anime:
    | {
        title: string;
        image_url: string;
        link: string;
      }[]
    | null;
};

const fallbackProfile: AboutProfile = {
  id: 1,
  page_badge: "thunderstorm",
  title: "mostly quiet, but not empty.",
  description: "a small page for the person who keeps this strange house open.",
  footer_text: "nothing too private, just the little things that keep showing up.",
  spotify_url: "https://open.spotify.com/",
  discord_url: "https://discord.com/",
  note_title: "not a biography",
  note_text:
    "i like pages that feel quiet, colors that look warm in the dark, and music that sounds like someone stayed in the room a little longer.",
  favorite_colors: [{ name: "soft grey", color: "#8a8a8a" }],
  facts: [
    { label: "favorite mood", value: "quiet rainy night" },
    { label: "favorite color", value: "soft grey" },
    { label: "favorite sound", value: "soft music" },
    { label: "comfort thing", value: "ice americano" },
  ],
  iconic_things: [
    {
      title: "glasses almost every time",
      line: "the small thing people notice first when i go outside.",
    },
    {
      title: "red and brown tones",
      line: "colors i keep choosing because they feel warm, calm, and a little old.",
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
    "red looks better when the sky is grey.",
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

export default function AboutMePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AboutProfile>(fallbackProfile);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
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

        bubble_chats:
          data.bubble_chats || fallbackProfile.bubble_chats,

        usually_called:
          data.usually_called || fallbackProfile.usually_called,

        favorite_music:
          data.favorite_music || fallbackProfile.favorite_music,

        favorite_movies:
          data.favorite_movies || fallbackProfile.favorite_movies,

        favorite_series:
          data.favorite_series || fallbackProfile.favorite_series,

        favorite_anime:
          data.favorite_anime || fallbackProfile.favorite_anime,
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

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
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
              about the person keeping the light on
            </span>
          </button>

          <div className="w-[48px]" />
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
                <SoftLink
                  href={profile.spotify_url || "#"}
                  icon={<FaSpotify size={12} />}
                  label="spotify"
                />

                <SoftLink
                  href={profile.discord_url || "#"}
                  icon={<FaDiscord size={12} />}
                  label="discord"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <SectionHeader title="favorite colors" subtitle="palette" />

              <div className="grid gap-2">
                {favoriteColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.045] bg-black/20 p-2.5"
                  >
                    <div
                      style={{ background: color.color }}
                      className="h-8 w-16 rounded-xl border border-white/[0.045]"
                    />

                    <p className="text-[8px] uppercase tracking-[0.18em] text-[#888888]">
                      {color.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <SectionHeader title="usually called" subtitle="names" />

              <div className="flex flex-wrap gap-2">
                {usuallyCalled.map((name) => (
                  <div
                    key={name}
                    className="rounded-full border border-white/[0.045] bg-white/[0.016] px-4 py-2 text-[8px] uppercase tracking-[0.18em] text-[#777777] shadow-[0_8px_24px_rgba(0,0,0,0.38)] backdrop-blur-xl"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="space-y-3">
                {bubbleChats.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      chat.side === "right" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl border border-white/[0.045] px-4 py-3 text-[11px] leading-relaxed text-[#8a8a8a] ${
                        chat.side === "right"
                          ? "rounded-br-sm bg-white/[0.025]"
                          : "rounded-bl-sm bg-black/30"
                      }`}
                    >
                      {chat.text}
                    </div>
                  </div>
                ))}
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
              <SectionHeader title={profile.note_title || "not a biography"} subtitle="just traces" />

              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-2 text-[#777777]">
                    <BookOpen size={13} strokeWidth={1.5} />
                    <p className="text-[8px] uppercase tracking-[0.22em]">
                      short note
                    </p>
                  </div>

                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#9a9a9a]">
                    {profile.note_text}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                  <div className="space-y-3">
                    {floatingNotes.map((note) => (
                      <div
                        key={note}
                        className="rounded-2xl border border-white/[0.045] bg-black/20 px-4 py-3 text-[11px] leading-relaxed text-[#777777]"
                      >
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

const TinyFactCard = ({
  fact,
}: {
  fact: { label: string; value: string };
}) => (
  <div className="rounded-2xl border border-white/[0.045] bg-black/20 p-3">
    <p className="text-[7px] uppercase tracking-[0.18em] text-[#666666]">
      {fact.label}
    </p>

    <p className="mt-1.5 text-[11px] leading-relaxed text-white/75">
      {fact.value}
    </p>
  </div>
);

const IconicRow = ({
  item,
  index,
}: {
  item: { title: string; line: string };
  index: number;
}) => (
  <div className="group grid gap-3 rounded-2xl border border-white/[0.045] bg-black/20 p-4 transition-all duration-700 hover:border-white/10 hover:bg-white/[0.026] sm:grid-cols-[52px_1fr_auto] sm:items-center">
    <div className="flex items-center gap-3 text-[#777777]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.045] bg-white/[0.014] text-[8px] uppercase tracking-[0.16em] text-[#666666]">
        {String(index).padStart(2, "0")}
      </span>
    </div>

    <div>
      <div className="mb-1 flex items-center gap-2 text-[#777777]">
        <p className="text-[8px] uppercase tracking-[0.2em]">
          {item.title}
        </p>
      </div>

      <p className="max-w-xl text-[11.5px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-[#b8b8b8]">
        {item.line}
      </p>
    </div>

    <ArrowUpRight
      size={12}
      className="hidden text-[#444444] transition-colors duration-700 group-hover:text-white/70 sm:block"
    />
  </div>
);

const SoftLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
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

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.045] pb-3">
    <h3 className="text-[11.5px] font-light tracking-wide text-white/70">
      {title}
    </h3>

    <p className="text-[8px] uppercase tracking-[0.2em] text-[#444444]">
      {subtitle}
    </p>
  </div>
);


const FavoriteShelf = ({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    image_url: string;
    link: string;
  }[];
}) => (
  <div>
    <div className="mb-3 flex items-center gap-2">
      <Sparkles
        size={11}
        strokeWidth={1.5}
        className="text-[#666666]"
      />

      <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
        {title}
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.title}
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="group relative aspect-square overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] shadow-[0_18px_50px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.026]"
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover grayscale opacity-45 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-82"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#444444]">
              <Sparkles size={18} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3">
            <p className="line-clamp-2 text-[8px] uppercase tracking-[0.16em] text-white/80">
              {item.title}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
);


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

function GlobalStyles() {
  return (
    <style jsx global>{`
      html,
      body {
        scroll-behavior: smooth;
        background: #020202;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
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
        background: linear-gradient(
          180deg,
          rgba(7, 7, 7, 0.96),
          rgba(2, 2, 2, 1)
        );
      }

      body::-webkit-scrollbar-thumb,
      html::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.16),
          rgba(255, 255, 255, 0.07)
        );
        border: 2px solid #020202;
        box-shadow:
          0 0 12px rgba(255, 255, 255, 0.045),
          inset 0 0 8px rgba(255, 255, 255, 0.03);
      }

      body::-webkit-scrollbar-thumb:hover,
      html::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.26),
          rgba(255, 255, 255, 0.12)
        );
        box-shadow:
          0 0 16px rgba(255, 255, 255, 0.07),
          inset 0 0 10px rgba(255, 255, 255, 0.05);
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
    `}</style>
  );
}
