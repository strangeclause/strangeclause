"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Music,
  ExternalLink,
  ArrowLeft,
  Rainbow,
  MessageCircle,
  WandSparkles,
  Loader2,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type StayedProfile = {
  id: number;
  page_label: string | null;
  site_title: string | null;
  nav_label: string | null;
  badge_label: string | null;
  person_name: string | null;
  second_name: string | null;
  hero_subtitle: string | null;
  footer_text: string | null;
  profile_label: string | null;
  profile_title: string | null;
  quote: string | null;
  spotify_title: string | null;
  spotify_caption: string | null;
  spotify_embed_url: string | null;
  youtube_embed_url: string | null;
  youtube_badge: string | null;
  note_title: string | null;
  note_body: string | null;
  tags_title: string | null;
  tags_subtitle: string | null;
  gallery_title: string | null;
  socials_title: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type StayedStat = {
  id: number;
  label: string;
  value: string;
  sort_order: number | null;
};

type StayedImage = {
  id: number;
  image_url: string;
  label: string | null;
  sort_order: number | null;
};

type StayedLink = {
  id: number;
  label: string;
  href: string;
  sort_order: number | null;
};

type StayedTag = {
  id: number;
  label: string;
  sort_order: number | null;
};

type StayedChat = {
  id: number;
  side: "left" | "right";
  text: string;
  sort_order: number | null;
};

const fallbackProfile: StayedProfile = {
  id: 1,
  page_label: "rainbow after rain",
  site_title: "strange clause",
  nav_label: "the one who stayed",
  badge_label: "someone",
  person_name: "Someone",
  second_name: "",
  hero_subtitle:
    "someone left their coat on the chair a few minutes ago. the rain already stopped, but a soft color still stayed in the sky.",
  footer_text:
    "some colors only appear after the rain, and somehow you became one of them.",
  profile_label: "stayed profile",
  profile_title: "quiet profile",
  quote: "they talk quietly, like they don't want the rain to end too fast.",
  spotify_title: "after-rain playlist",
  spotify_caption: "songs that stayed after the rain",
  spotify_embed_url: "",
  youtube_embed_url: "",
  youtube_badge: "rainy night",
  note_title: "note",
  note_body:
    "i think some people feel like rainy days — quiet at first, but somehow comforting when you stay a little longer. thank you for becoming one of the soft colors that stayed in my life.",
  tags_title: "things that stayed",
  tags_subtitle: "small traces",
  gallery_title: "gallery",
  socials_title: "social links",
};

const fallbackImages: StayedImage[] = [
  { id: 1, image_url: "/images/junhan1.jpg", label: "", sort_order: 1 },
  { id: 2, image_url: "/images/junhan2.jpg", label: "", sort_order: 2 },
];

const fallbackLinks: StayedLink[] = [
  { id: 1, label: "youtube", href: "#", sort_order: 1 },
  { id: 2, label: "spotify", href: "#", sort_order: 2 },
];

const fallbackStats: StayedStat[] = [
  { id: 1, label: "name", value: "someone", sort_order: 1 },
  { id: 2, label: "sound", value: "quiet", sort_order: 2 },
];

const fallbackTags: StayedTag[] = [
  "quiet",
  "soft-spoken",
  "after rain",
  "warm color",
].map((label, index) => ({ id: index + 1, label, sort_order: index + 1 }));

const fallbackChats: StayedChat[] = [
  { id: 1, side: "right", text: "what do you usually listen to when it rains?", sort_order: 1 },
  { id: 2, side: "left", text: "mostly quiet songs.", sort_order: 2 },
];

const sortByOrder = <T extends { sort_order: number | null; id: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id));

export default function TheOneWhoStayedPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<StayedProfile>(fallbackProfile);
  const [stats, setStats] = useState<StayedStat[]>(fallbackStats);
  const [images, setImages] = useState<StayedImage[]>(fallbackImages);
  const [links, setLinks] = useState<StayedLink[]>(fallbackLinks);
  const [tags, setTags] = useState<StayedTag[]>(fallbackTags);
  const [chats, setChats] = useState<StayedChat[]>(fallbackChats);
  const [loading, setLoading] = useState(true);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        left: `${(index * 37) % 100}%`,
        top: `${(index * 53) % 100}%`,
        size: `${2 + (index % 3)}px`,
        delay: `${(index % 8) * 0.45}s`,
        duration: `${6 + (index % 6)}s`,
       })),
    []
  );

  const fetchPage = useCallback(async () => {
    setLoading(true);

    const [
      profileResult,
      statsResult,
      imagesResult,
      linksResult,
      tagsResult,
      chatsResult,
    ] = await Promise.all([
      supabase.from("the_one_who_stayed_profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("the_one_who_stayed_stats").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_images").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_links").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_tags").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_chat").select("*").order("sort_order", { ascending: true }),
    ]);

    if (profileResult.data) setProfile({ ...fallbackProfile, ...profileResult.data });
    if (statsResult.data?.length) setStats(sortByOrder(statsResult.data));
    if (imagesResult.data?.length) setImages(sortByOrder(imagesResult.data));
    if (linksResult.data?.length) setLinks(sortByOrder(linksResult.data));
    if (tagsResult.data?.length) setTags(sortByOrder(tagsResult.data));
    if (chatsResult.data?.length) setChats(sortByOrder(chatsResult.data));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#080914] text-[#c8cde7] font-light text-[12.5px] antialiased selection:bg-[#ff79b4]/30 selection:text-white`}
    >
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,63,94,0.13),transparent_34%),radial-gradient(circle_at_42%_12%,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_70%_18%,rgba(52,211,153,0.11),transparent_34%),radial-gradient(circle_at_85%_65%,rgba(96,165,250,0.15),transparent_42%),linear-gradient(180deg,#080914_0%,#111323_52%,#07080f_100%)]" />
      <div className="rainbow-aurora pointer-events-none fixed inset-0 z-[1]" />
      <div className="rainbow-arc pointer-events-none fixed left-1/2 top-[-150px] z-[2] h-[300px] w-[700px] -translate-x-1/2 rounded-b-full opacity-35 blur-[1px]" />

      {/* Floating Sparkles Effect */}
      <div className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
        {sparkles.map((sparkle, index) => (
          <span
            key={index}
            className="floating-spark absolute rounded-full bg-white/40 shadow-[0_0_18px_rgba(255,255,255,0.45)]"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
            }}
          />
        ))}
      </div>

      {/* Global Loading Indicator */}
      {loading && (
        <div className="fixed right-4 top-20 z-[80] flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl animate-fade-in">
          <Loader2 size={10} className="animate-spin" />
          loading
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#080914]/72 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group hidden shrink-0 items-center gap-2 justify-self-start text-[8.5px] uppercase tracking-[0.22em] text-[#8b90aa] transition-colors duration-700 hover:text-white/85 md:flex md:text-[9px]"
          >
            <ArrowLeft size={11} strokeWidth={1.5} className="transition-transform duration-700 group-hover:-translate-x-1" />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group col-start-1 row-start-1 flex min-w-0 flex-col items-start justify-self-start text-left md:col-start-2 md:items-center md:justify-self-center md:text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 sm:text-[11px]">
              {profile.site_title || "strange clause"}
            </span>
            <span className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#8b90aa] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[320px] sm:text-[8px]">
              {profile.nav_label}
            </span>
          </button>

          <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-1.5 rounded-full border border-white/[0.055] bg-white/[0.022] px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-[#c7cef5] shadow-[0_10px_35px_rgba(0,0,0,0.35)] md:col-start-3 sm:text-[8.5px]">
            <Rainbow size={10} strokeWidth={1.5} />
            {profile.badge_label}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-5 pb-20 pt-28 sm:px-8 sm:pt-36 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        {/* Main Hero Card */}
        <section className="animate-fade-in mb-5 overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-white/[0.015] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left Column (Info & Title) */}
            <div className="rounded-[1.4rem] border border-white/[0.055] bg-[#080914]/55 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[7px] uppercase tracking-[0.2em] text-[#d7dcff]/80">
                  {profile.page_label}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-black/30 px-3 py-1 text-[7px] uppercase tracking-[0.2em] text-[#8b90aa]">
                  {profile.badge_label}
                </span>
              </div>

              <h1 className="max-w-xl text-[36px] font-light leading-[1] tracking-[-0.05em] text-white sm:text-[48px]">
                {profile.person_name}
                {profile.second_name && (
                  <span className="mt-1 block bg-gradient-to-r from-[#fb7185] via-[#fbbf24] to-[#60a5fa] bg-clip-text text-transparent">
                    {profile.second_name}
                  </span>
                )}
              </h1>

              <p className="mt-3 text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                {profile.profile_label || "stayed profile"}
              </p>

              <p className="mt-4 max-w-xl text-[12.5px] leading-relaxed text-[#b3b9d4]/85">
                {profile.hero_subtitle}
              </p>

              <section className="mt-6 rounded-[1.4rem] border border-white/[0.06] bg-white/[0.015] p-4">
                <div className="mb-2.5 flex items-center justify-between border-b border-white/[0.045] pb-2">
                  <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                    under dim lights
                  </p>
                  <Music size={11} className="text-[#fbbf24]" />
                </div>
                <p className="text-[11.5px] leading-relaxed text-[#cfd6f4]/82 italic">
                  "{profile.quote}"
                </p>
              </section>
            </div>

            {/* Right Column (Gallery & Quote) */}
            <div className="flex flex-col gap-4 justify-between">
              <section className="overflow-hidden rounded-[1.4rem] border border-white/[0.06] bg-white/[0.015] p-3.5">
                <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-2">
                  <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                    {profile.gallery_title}
                  </p>
                  <p className="text-[7px] uppercase tracking-[0.16em] text-[#777777]">
                    {images.length} frames
                  </p>
                </div>

                <div className="custom-horizontal-scroll overflow-x-auto overflow-y-hidden">
                  <div className="flex w-max gap-2.5 pb-1">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative h-44 w-32 shrink-0 overflow-hidden rounded-[1.1rem] border border-white/[0.055] bg-black/30"
                      >
                        <img
                          src={image.image_url}
                          alt={image.label || "gallery image"}
                          className="h-full w-full object-cover grayscale-[18%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                        {image.label && (
                          <div className="absolute inset-x-0 bottom-0 p-2">
                            <p className="truncate text-[7px] uppercase tracking-[0.14em] text-white/75">
                              {image.label}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {stats.slice(0, 4).map((stat) => (
                  <MiniStat key={stat.id} label={stat.label} value={stat.value} />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Secondary Widgets Row */}
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          
          {/* Left Column (Spotify & Note) */}
          <div className="space-y-5">
            <section className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.015] p-4 shadow-sm backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-2">
                <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                  {profile.spotify_title}
                </p>
                <Music size={11} className="text-[#34d399]" />
              </div>

              {profile.spotify_embed_url ? (
                <div className="overflow-hidden rounded-[1.1rem] border border-white/[0.055] bg-black/30 p-1">
                  <iframe
                    title="spotify embed"
                    src={profile.spotify_embed_url}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-[0.9rem] border-0 grayscale opacity-70 transition-all duration-500 hover:opacity-100"
                  />
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-[1.1rem] border border-dashed border-white/[0.05] bg-black/25 text-[7.5px] uppercase tracking-[0.18em] text-[#666666]">
                  no music left here
                </div>
              )}

              <p className="mt-2 text-center text-[7px] uppercase tracking-[0.16em] text-[#777777]">
                {profile.spotify_caption}
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-1.5 border-b border-white/[0.045] pb-2">
                <WandSparkles size={11} className="text-[#fb7185]" />
                <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                  letter
                </p>
              </div>
              <p className="whitespace-pre-line text-[11px] leading-[1.7] text-[#cfd6f4]/82">
                {profile.note_body}
              </p>
            </section>

            {profile.youtube_embed_url && (
              <iframe
                title="youtube embed"
                src={profile.youtube_embed_url}
                width="100%"
                height="220"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="aspect-video h-auto w-full rounded-[1.2rem] border-0 opacity-80 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0"
              />
            )}
          </div>

          {/* Right Column (Chats, Tags & Socials) */}
          <div className="space-y-5">
            <section className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-1.5 border-b border-white/[0.045] pb-2">
                <MessageCircle size={11} className="text-[#60a5fa]" />
                <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                  {profile.person_name || "someone"}
                </p>
              </div>

              <div className="space-y-2">
                {chats.map((chat) => (
                  <CuteMessage key={chat.id} side={chat.side} text={chat.text} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-xl">
              <SectionHeader
                title={profile.tags_title || "things that stayed"}
                subtitle={profile.tags_subtitle || "small traces"}
              />
              <div className="flex flex-wrap gap-1.5 pt-3">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-white/[0.055] bg-white/[0.03] px-2.5 py-1 text-[7px] uppercase tracking-[0.14em] text-[#d6dcff]/85"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-1.5 border-b border-white/[0.045] pb-2">
                <ExternalLink size={11} className="text-[#fbbf24]" />
                <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
                  {profile.socials_title}
                </p>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2 text-[7.5px] uppercase tracking-[0.14em] text-[#d6dcff]/85 transition-all duration-500 hover:border-white/12 hover:bg-white/[0.04]"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={8} className="opacity-60" />
                  </a>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Footer Area */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#07080c]/80 px-4 py-8 text-center backdrop-blur-md">
        <p className="mx-auto max-w-xl whitespace-pre-line text-[9.5px] leading-relaxed tracking-[0.12em] text-[#8b90aa]/80">
          {profile.footer_text}
        </p>
      </footer>

      {/* Embedded Optimization Styles */}
      <style jsx global>{`
        html,
        body {
          scroll-behavior: smooth;
          background: #080914;
          scrollbar-width: thin;
          scrollbar-color: rgba(180, 196, 255, 0.16) rgba(255, 255, 255, 0.025);
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background: #080914;
        }

        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
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
          animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes auroraMove {
          0%, 100% {
            transform: translate3d(-1%, -1%, 0) scale(1);
            filter: blur(55px);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(1%, 1%, 0) scale(1.02);
            filter: blur(65px);
            opacity: 0.45;
          }
        }

        .rainbow-aurora {
          background:
            radial-gradient(circle at 15% 20%, rgba(251, 113, 133, 0.14), transparent 40%),
            radial-gradient(circle at 45% 15%, rgba(251, 191, 36, 0.1), transparent 35%),
            radial-gradient(circle at 75% 25%, rgba(52, 211, 153, 0.1), transparent 40%);
          animation: auroraMove 16s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .rainbow-arc {
          background:
            radial-gradient(
              ellipse at center,
              transparent 38%,
              rgba(251, 113, 133, 0.13) 40%,
              rgba(251, 191, 36, 0.11) 44%,
              rgba(52, 211, 153, 0.09) 48%,
              transparent 54%
            );
        }

        @keyframes floatingSpark {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          15% { opacity: 0.4; }
          85% { opacity: 0.15; }
          100% {
            transform: translateY(-30px) scale(1.1);
            opacity: 0;
          }
        }

        .floating-spark {
          animation: floatingSpark linear infinite;
          will-change: transform, opacity;
        }

        .custom-horizontal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 3%,
            black 97%,
            transparent 100%
          );
        }

        .custom-horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-end justify-between gap-4 border-b border-white/[0.05] pb-2">
    <div className="flex items-center gap-1.5">
      <Sparkles size={11} className="text-[#34d399]" />
      <h3 className="text-[7.5px] uppercase tracking-[0.2em] text-[#d7dcff]/75">
        {title}
      </h3>
    </div>
    <p className="text-[7px] uppercase tracking-[0.2em] text-[#8b90aa]/70">
      {subtitle}
    </p>
  </div>
);

const CuteMessage = ({
  text,
  side,
}: {
  text: string;
  side: "left" | "right";
}) => (
  <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[10px] leading-relaxed shadow-sm ${
        side === "right"
          ? "bg-[#fb7185]/10 text-[#ffd5df] border border-[#fb7185]/05"
          : "bg-[#60a5fa]/10 text-[#d6e7ff] border border-[#60a5fa]/05"
      }`}
    >
      {text}
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-h-[42px] w-full items-center gap-3 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2.5 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]">
    <span className="shrink-0 text-[6.5px] uppercase tracking-[0.18em] text-[#8b90aa]/72">
      {label}
    </span>

    <span className="min-w-0 flex-1 break-words text-[10.5px] leading-relaxed text-[#edf2ff]/92">
      {value}
    </span>
  </div>
);