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
  CloudSun,
  Heart,
  Guitar,
  Disc3,
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
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#080914] text-[#c8cde7] font-light text-[13px] antialiased selection:bg-[#ff79b4]/30 selection:text-white`}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,63,94,0.13),transparent_34%),radial-gradient(circle_at_42%_12%,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_70%_18%,rgba(52,211,153,0.11),transparent_34%),radial-gradient(circle_at_85%_65%,rgba(96,165,250,0.15),transparent_42%),linear-gradient(180deg,#080914_0%,#111323_52%,#07080f_100%)]" />
      <div className="rainbow-aurora pointer-events-none fixed inset-0 z-[1]" />
      <div className="rainbow-arc pointer-events-none fixed left-1/2 top-[-130px] z-[2] h-[360px] w-[760px] -translate-x-1/2 rounded-b-full opacity-35 blur-[1px]" />

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

      {loading && (
        <div className="fixed right-6 top-24 z-[80] flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 text-[8px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl">
          <Loader2 size={11} className="animate-spin" />
          loading
        </div>
      )}

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.07] bg-[#080914]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex shrink-0 items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-[#8b90aa] transition-colors duration-700 hover:text-white/85 sm:text-[9px]"
          >
            <ArrowLeft size={12} strokeWidth={1.5} className="transition-transform duration-700 group-hover:-translate-x-1" />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group flex min-w-0 flex-col items-center text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 sm:text-[11px]">
              {profile.site_title || "strange clause"}
            </span>
            <span className="hidden max-w-[330px] truncate text-[8px] lowercase tracking-[0.12em] text-[#8b90aa] transition-colors duration-500 group-hover:text-white/60 sm:block">
              {profile.nav_label}
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#c7cef5] shadow-[0_10px_35px_rgba(0,0,0,0.35)] sm:px-4 sm:text-[8.5px]">
            <Rainbow size={11} strokeWidth={1.5} />
            {profile.badge_label}
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-[1500px] px-6 pb-28 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-16 grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudSun size={13} className="text-[#fbbf24] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#8b90aa]">
                {profile.page_label}
              </p>
            </div>

            <h1 className="text-[34px] font-light leading-[1.02] tracking-[-0.07em] text-[#f4f7ff] sm:text-[48px] md:text-[64px]">
              {profile.person_name}
              {profile.second_name && (
                <>
                  <br />
                  <span className="bg-gradient-to-r from-[#fb7185] via-[#fbbf24] via-[#34d399] to-[#60a5fa] bg-clip-text font-normal text-transparent">
                    {profile.second_name}
                  </span>
                </>
              )}
            </h1>

            <p className="max-w-xl whitespace-pre-line text-[12.5px] leading-relaxed text-[#a4abc9]">
              {profile.hero_subtitle}
            </p>

            <div className="max-w-xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.035] shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-4 text-[8px] uppercase tracking-[0.2em] text-[#ffcf8c]">
                <Rainbow size={12} />
                {profile.gallery_title}
              </div>

              <div className="custom-horizontal-scroll overflow-x-auto overflow-y-hidden">
                <div className="flex w-max gap-3 px-4 pb-4 pt-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative h-52 w-36 shrink-0 overflow-hidden rounded-[1.7rem] border border-white/[0.08] bg-black/20 transition-all duration-700 hover:-translate-y-1 hover:border-white/15"
                    >
                      <img
                        src={image.image_url}
                        alt={image.label || "gallery image"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="text-[7px] uppercase tracking-[0.18em] text-white/70">
                          {image.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-xl rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[#ffcf8c]">
                <ExternalLink size={12} />
                {profile.socials_title}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 px-3.5 py-3 text-[8px] uppercase tracking-[0.16em] text-[#c9d4ff] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={10} className="transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <aside className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(251,113,133,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.16),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(96,165,250,0.16),transparent_35%)]" />

            <div className="relative z-10 border-b border-white/[0.07] pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.22em] text-[#9ea6c8]">
                    {profile.profile_label}
                  </p>
                  <p className="mt-2 text-[16px] font-light tracking-[-0.04em] text-white/90 sm:text-[20px]">
                    {profile.profile_title}
                  </p>
                </div>
                <Disc3 className="animate-spin-slow text-[#fbbf24]" size={22} />
              </div>
            </div>

            <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <MiniStat key={stat.id} label={stat.label} value={stat.value} />
              ))}
            </div>

            <div className="relative z-10 mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <p className="whitespace-pre-line text-[11px] italic leading-relaxed text-[#d6dcff]">
                "{profile.quote}"
              </p>
            </div>

            <div className="relative z-10 mt-4 rounded-[1.7rem] border border-white/[0.08] bg-white/[0.04] p-4">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <CuteMessage key={chat.id} side={chat.side} text={chat.text} />
                ))}
              </div>
            </div>
          </aside>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="h-fit space-y-5 lg:sticky lg:top-32 lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(251,113,133,0.055),rgba(251,191,36,0.04),rgba(52,211,153,0.045),rgba(96,165,250,0.06))] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(251,191,36,0.12),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(96,165,250,0.12),transparent_38%)]" />

              <div className="relative z-10 mb-4 flex items-center justify-between">
                <p className="text-[8px] uppercase tracking-[0.22em] text-[#c7cef5]">
                  {profile.spotify_title}
                </p>
                <Music size={14} className="text-[#34d399]" />
              </div>

              {profile.spotify_embed_url ? (
                <div className="relative z-10 overflow-hidden rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(251,113,133,0.08),rgba(251,191,36,0.06),rgba(52,211,153,0.06),rgba(96,165,250,0.08))] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_36%),linear-gradient(180deg,rgba(8,9,20,0.2),rgba(8,9,20,0.5))]" />

                  <iframe
                    title="Spotify embed"
                    src={profile.spotify_embed_url}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="relative z-10 rounded-[1.6rem] border-0 grayscale opacity-55 mix-blend-luminosity transition-all duration-700 hover:opacity-82"
                  />
                </div>
              ) : (
                <div className="relative z-10 flex min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#080914]/35 text-[8px] uppercase tracking-[0.2em] text-[#8b90aa]">
                  nothing is coming out of the speakers
                </div>
              )}

              <p className="relative z-10 mt-4 text-center text-[8px] uppercase tracking-[0.18em] text-[#8b90aa]">
                {profile.spotify_caption}
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[#ff9ebd]">
                <WandSparkles size={13} />
                {profile.note_title}
              </div>

              <div className="rounded-[1.8rem] border border-white/[0.08] bg-black/20 p-4">
                <p className="whitespace-pre-line text-[11px] leading-[1.9] text-[#cfd6f4]">
                  {profile.note_body}
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-12 lg:col-span-8">
            <section>
              <SectionHeader
                title={profile.tags_title || "things that stayed"}
                subtitle={profile.tags_subtitle || "small traces"}
              />

              <div className="rounded-[2.2rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[8px] uppercase tracking-[0.14em] text-[#d6dcff] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(251,113,133,0.06),rgba(251,191,36,0.045),rgba(52,211,153,0.05),rgba(96,165,250,0.06))] p-8 shadow-[0_20px_55px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                <div className="absolute inset-0 opacity-35 bg-gradient-to-r from-rose-500/35 via-yellow-400/25 via-emerald-400/25 to-blue-500/35 blur-2xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex justify-center gap-6">
                    <Heart size={15} className="text-[#fb7185] opacity-90 animate-float" />
                    <Guitar size={15} className="text-[#34d399] opacity-90 animate-float-delay" />
                    <Sparkles size={15} className="text-[#fbbf24] opacity-90 animate-float" />
                  </div>

                  {profile.youtube_embed_url ? (
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#080914]/45 p-1 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
                      <iframe
                        className="aspect-video h-full min-h-[170px] w-full rounded-[1.85rem] border-0 grayscale-[0.08] opacity-90 transition-all duration-700 hover:opacity-100"
                        src={profile.youtube_embed_url}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />

                      <div className="pointer-events-none absolute inset-1 rounded-[1.85rem] bg-[linear-gradient(to_top,rgba(8,9,20,0.88),transparent_46%)]" />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-5">
                        <span className="rounded-full border border-white/[0.08] bg-[#080914]/55 px-3 py-1 text-[7px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl">
                          {profile.youtube_badge}
                        </span>
                        <Music size={13} className="text-[#fbbf24]" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-60 items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-[#080914]/35 text-[9px] uppercase tracking-[0.2em] text-[#8b90aa]">
                      no youtube video
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[#07080c]/85 px-8 py-12 text-center backdrop-blur-xl">
        <p className="mx-auto max-w-xl whitespace-pre-line text-[11px] leading-relaxed tracking-[0.12em] text-[#8b90aa]">
          {profile.footer_text}
        </p>
      </footer>

      <style jsx global>{`
        html,
        body {
          scroll-behavior: smooth;
          background: #080914;

          scrollbar-width: thin;
          scrollbar-color: rgba(180, 196, 255, 0.16)
            rgba(255, 255, 255, 0.025);
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background:
            linear-gradient(
              180deg,
              rgba(17, 19, 35, 0.92),
              rgba(8, 9, 20, 0.96)
            );
        }

        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          border-radius: 999px;

          background:
            linear-gradient(
              180deg,
              rgba(255, 145, 179, 0.28),
              rgba(255, 214, 102, 0.24),
              rgba(120, 255, 206, 0.24),
              rgba(140, 184, 255, 0.28)
            );

          border: 2px solid #080914;

          box-shadow:
            0 0 12px rgba(255, 145, 179, 0.08),
            0 0 18px rgba(120, 255, 206, 0.05);

          transition:
            background 500ms ease,
            box-shadow 500ms ease,
            opacity 500ms ease;
        }

        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(
              180deg,
              rgba(255, 145, 179, 0.4),
              rgba(255, 214, 102, 0.34),
              rgba(120, 255, 206, 0.34),
              rgba(140, 184, 255, 0.4)
            );

          box-shadow:
            0 0 16px rgba(255, 145, 179, 0.12),
            0 0 22px rgba(120, 255, 206, 0.08);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(3px);
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
          0%,
          100% {
            transform: translate3d(-2%, -1%, 0) scale(1);
            filter: hue-rotate(0deg) blur(70px);
            opacity: 0.45;
          }

          50% {
            transform: translate3d(2%, 2%, 0) scale(1.08);
            filter: hue-rotate(55deg) blur(90px);
            opacity: 0.65;
          }
        }

        .rainbow-aurora {
          background:
            radial-gradient(circle at 18% 22%, rgba(251, 113, 133, 0.22), transparent 34%),
            radial-gradient(circle at 40% 16%, rgba(251, 191, 36, 0.18), transparent 30%),
            radial-gradient(circle at 66% 18%, rgba(52, 211, 153, 0.18), transparent 34%),
            radial-gradient(circle at 82% 58%, rgba(96, 165, 250, 0.2), transparent 38%);
          animation: auroraMove 12s ease-in-out infinite;
        }

        .rainbow-arc {
          background:
            radial-gradient(
              ellipse at center,
              transparent 34%,
              rgba(251, 113, 133, 0.22) 36%,
              rgba(251, 191, 36, 0.2) 42%,
              rgba(52, 211, 153, 0.18) 48%,
              rgba(96, 165, 250, 0.18) 54%,
              rgba(167, 139, 250, 0.16) 60%,
              transparent 66%
            );
        }

        @keyframes floatingSpark {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }

          20% {
            opacity: 0.6;
          }

          70% {
            opacity: 0.35;
          }

          100% {
            transform: translateY(-48px) scale(1.2);
            opacity: 0;
          }
        }

        .floating-spark {
          animation: floatingSpark linear infinite;
        }

        @keyframes floatSoft {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        .animate-float {
          animation: floatSoft 3s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: floatSoft 3.4s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .animate-spin-slow {
          animation: spin 9s linear infinite;
        }

        .custom-horizontal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;

          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 5%,
            black 95%,
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
  <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/[0.07] pb-3">
    <div className="flex items-center gap-2">
      <Sparkles size={12} className="text-[#34d399]" />
      <h3 className="text-[12px] font-light tracking-wide text-[#f4f7ff]">
        {title}
      </h3>
    </div>
    <p className="text-[8px] uppercase tracking-[0.2em] text-[#8b90aa]">
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
      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[10.5px] leading-relaxed ${
        side === "right"
          ? "rounded-br-sm bg-[#fb7185]/15 text-[#ffd5df]"
          : "rounded-bl-sm bg-[#60a5fa]/15 text-[#d6e7ff]"
      }`}
    >
      {text}
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3">
    <p className="mb-1 text-[7px] uppercase tracking-[0.18em] text-[#8b90aa]">
      {label}
    </p>
    <p className="text-[10.5px] leading-relaxed text-[#d6dcff]">{value}</p>
  </div>
);
