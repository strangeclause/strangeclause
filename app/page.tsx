"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDiscord,
  FaSpotify,
} from "react-icons/fa";
import {
  Mail,
  ShieldQuestion,
  Ghost,
  Mic2,
  Gamepad2,
  UserCircle2,
  EyeOff,
  Lock,
  Unlock,
  ArrowUpRight,
  CloudRain,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type MemoryImage = {
  id: number;
  imageUrl: string;
};

type VoidMessage = {
  id: number;
  message: string;
};

type LowEchoTrack = {
  id: string;
  title: string | null;
  artist: string | null;
  spotify_track_id: string;
  sort_order: number | null;
};

type MenuItem = {
  title: string;
  content: string;
  href: string;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

export default function StrangeClausePage() {
  const router = useRouter();

  const [images, setImages] = useState<MemoryImage[]>([]);
  const [messages, setMessages] = useState<VoidMessage[]>([]);
  const [tracks, setTracks] = useState<LowEchoTrack[]>([]);
  const [activeSection, setActiveSection] = useState("dim");
  const [currentTrack, setCurrentTrack] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHoveredFortress, setIsHoveredFortress] = useState(false);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  const navItems = useMemo(
    () => [
      "dim",
      "shelves",
      "playgrounds",
      "frequencies",
      "whispers",
      "signals",
    ],
    []
  );

  const archiveItems: MenuItem[] = useMemo(
    () => [
      {
        title: "late night cinema",
        content: "just some old tapes i left on the table that i do not watch anymore.",
        href: "/late-night-cinema",
      },
      {
        title: "unsent notes",
        content: "small things i thought about saying but forgot to write down.",
        href: "/unsent-notes",
      },
      {
        title: "lonely corners",
        content: "places where the streetlights stay on even when nobody walks by.",
        href: "/lonely-corners",
      },
      {
        title: "quiet music",
        content: "some low sounds to play while looking out at the foggy yard.",
        href: "/quiet-music",
      },
      {
        title: "saved pages",
        content: "i kept these books open but i never turned to the next side.",
        href: "/saved-pages",
      },
      {
        title: "the one who stayed",
        content: "someone was sitting here a few minutes ago but they left their coat.",
        href: "/the-one-who-stayed",
      },
    ],
    []
  );

  const robloxItems: MenuItem[] = useMemo(
    () => [
      {
        title: "shared worlds",
        content: "an empty server where we stood still until the screen went dark.",
        href: "/shared-worlds",
      },
      {
        title: "old profiles",
        content: "descriptions i wrote years ago when the weather was different.",
        href: "/old-profiles",
      },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const [imageResponse, messageResponse, trackResponse] =
        await Promise.all([
          supabase.from("memories").select("id, image_url"),
          supabase.from("void_messages").select("id, message"),
          supabase
            .from("low_echoes")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
        ]);

      const formattedImages =
        imageResponse.data?.map((item: { id: number; image_url: string }) => ({
          id: item.id,
          imageUrl: item.image_url,
        })) || [];

      setImages(formattedImages);
      setMessages((messageResponse.data || []) as VoidMessage[]);
      setTracks((trackResponse.data || []) as LowEchoTrack[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentTrack >= tracks.length) setCurrentTrack(0);
  }, [tracks.length, currentTrack]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.24, rootMargin: "-12% 0px -70% 0px" }
    );

    navItems.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [loading, navItems]);

  const scrollToSection = (
    id: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const activeTrack = tracks[currentTrack];

  if (loading) return <LoadingState />;

  return (
    <main
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

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/78 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-6 py-4 sm:px-12 md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.1fr)] md:px-20 md:py-5 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex min-w-0 flex-col items-start gap-1 text-left"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>

            <span className="max-w-[185px] truncate text-[8px] lowercase tracking-[0.12em] text-[#6a6a6a] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[330px] sm:text-[8.5px] md:max-w-[390px]">
              the cold air is coming through the floor. close the door behind you.
            </span>
          </button>

          <div className="hidden min-w-0 items-center justify-end gap-4 sm:flex md:gap-5 lg:gap-7">
            {navItems.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => scrollToSection(id, event)}
                className={`relative whitespace-nowrap py-1 text-[8px] uppercase tracking-[0.18em] transition-all duration-500 md:text-[8.5px] lg:text-[9px] ${
                  activeSection === id
                    ? "text-white/90"
                    : "text-[#555555] hover:text-white/75"
                }`}
              >
                {id.replace("-", " ")}
              </a>
            ))}
          </div>

          <div className="flex justify-end sm:hidden">
            <span className="rounded-full border border-white/[0.045] bg-white/[0.014] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#555555]">
              menu
            </span>
          </div>
        </div>

        <div className="soft-scrollbar flex gap-5 overflow-x-auto border-t border-white/[0.035] px-6 py-3 sm:hidden">
          {navItems.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(event) => scrollToSection(id, event)}
              className={`shrink-0 text-[8.5px] uppercase tracking-[0.2em] transition-colors duration-500 ${
                activeSection === id ? "text-white/90" : "text-[#555555]"
              }`}
            >
              {id.replace("-", " ")}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative z-20 mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:grid-cols-12 lg:gap-16 lg:px-28 xl:gap-24 xl:px-36">
        <aside className="h-fit w-full rounded-3xl border border-white/[0.045] bg-white/[0.012] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-8 lg:sticky lg:top-44 lg:col-span-4">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.35)]" />
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-[#6a6a6a]">
              box number four
            </p>
          </div>

          <h2 className="text-[15px] font-light leading-relaxed tracking-wide text-white/82 sm:text-[16px]">
            i left the light on so i could see if anyone walked past the window.
          </h2>

          <p className="mt-5 text-[12px] leading-relaxed text-[#777777]">
            a place to look at old polaroids, listen to background noise, and find lines that were never finished.
          </p>

          <div className="mt-6 flex items-center gap-2 border-t border-white/[0.045] pt-5 text-[8.5px] uppercase tracking-[0.17em] text-[#555555]">
            {isHoveredFortress ? (
              <Lock size={11} className="text-white/40" />
            ) : (
              <Unlock size={11} className="text-[#444444]" />
            )}
            <span>quiet room</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/the-room-owner")}
            className="group mt-5 w-full overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.014] p-4 text-left shadow-[0_14px_38px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[8px] uppercase tracking-[0.22em] text-[#666666]">
                  the room owner
                </p>

                <p className="max-w-[95%] text-[11.5px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-[#b8b8b8]">
                  a small page for the person who keeps this strange house open.
                </p>
              </div>

              <ArrowUpRight
                size={12}
                className="mt-0.5 shrink-0 text-[#444444] transition-all duration-700 group-hover:text-white/75"
              />
            </div>
          </button>
        </aside>

        <div
          className="space-y-16 sm:space-y-24 lg:col-span-8"
          onMouseEnter={() => setIsHoveredFortress(true)}
          onMouseLeave={() => setIsHoveredFortress(false)}
        >
          <section
            id="dim"
            className="scroll-mt-44 space-y-8 animate-fade-in"
          >
            <div className="space-y-5">
              <p className="flex items-center gap-2 text-[8.5px] uppercase tracking-[0.28em] text-[#555555]">
                <CloudRain size={12} className="stroke-[1.4px]" />
                outside it is raining
              </p>

              <h1 className="text-[24px] font-light leading-[1.2] tracking-wide text-white/90 sm:text-[30px] md:text-[34px] xl:text-[38px]">
                the clock keeps clicking,
                <br />
                but nobody is talking in here.
              </h1>

              <p className="max-w-xl text-[12.5px] leading-relaxed text-[#888888]">
                everything is put away in small drawers so the floor stays clean while it pours all night.
              </p>
            </div>

            <div className="group inline-flex max-w-full items-start gap-3 rounded-2xl border border-white/[0.045] bg-white/[0.016] px-4 py-3.5 shadow-[0_12px_42px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.028]">
              <ShieldQuestion
                size={13}
                className="mt-0.5 shrink-0 text-[#666666] stroke-[1.5px]"
              />
              <p className="text-[11.5px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-white/78">
                did you leave your keys on the counter before you walked out?
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] p-1.5 shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="scrollbar-hide flex h-20 items-center gap-2 overflow-x-auto">
                  {images.length > 0 ? (
                    images.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="old film strip"
                        className="h-full w-16 shrink-0 rounded-xl object-cover grayscale-[85%] opacity-40 transition-all duration-700 hover:scale-[1.02] hover:grayscale hover:opacity-75"
                      />
                    ))
                  ) : (
                    <div className="flex h-full w-full items-center justify-center gap-2 text-[#444444]">
                      <EyeOff size={12} className="stroke-[1.5px]" />
                      <span className="text-[8.5px] uppercase tracking-[0.22em]">
                        the screen is blank
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="shelves" className="scroll-mt-44">
            <SectionHeader title="THE BACK SHELF" subtitle="old boxes" />

            <div className="grid gap-4 sm:grid-cols-2">
              {archiveItems.map((item) => (
                <MenuCard
                  key={item.href}
                  item={item}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          </section>

          <section id="playgrounds" className="scroll-mt-44">
            <SectionHeader title="EMPTY MAPS" subtitle="places to sit" />

            <div className="grid gap-4 sm:grid-cols-2">
              {robloxItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="group relative min-h-[122px] w-full overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] p-5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.045] pb-3">
                      <div className="flex min-w-0 items-center gap-2 text-[#666666] transition-colors duration-700 group-hover:text-white/75">
                        {index === 0 ? (
                          <Gamepad2
                            size={13}
                            className="shrink-0 stroke-[1.5px]"
                          />
                        ) : (
                          <UserCircle2
                            size={13}
                            className="shrink-0 stroke-[1.5px]"
                          />
                        )}

                        <p className="truncate text-[9px] uppercase tracking-[0.2em]">
                          {item.title}
                        </p>
                      </div>

                      <span className="shrink-0 text-[8px] uppercase tracking-[0.2em] text-[#444444]">
                        put away
                      </span>
                    </div>

                    <p className="text-[11.8px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-[#b8b8b8]">
                      {item.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section id="frequencies" className="scroll-mt-44">
            <SectionHeader title="THE RADIO STATION" subtitle="background hum" />

            <div className="rounded-2xl border border-white/[0.045] bg-white/[0.012] px-5 py-6 shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.022] sm:px-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Mic2 size={13} className="text-[#666666] stroke-[1.5px]" />
                  <h3 className="text-[12px] font-light text-[#888888]">
                    {activeTrack?.title || "some small noise from the radio"}
                  </h3>
                </div>

                <p className="text-[8px] uppercase tracking-[0.2em] text-[#444444]">
                  {activeTrack?.artist || "static"}
                </p>
              </div>

              {activeTrack ? (
                <>
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.045] bg-black p-1">
                    <iframe
                      key={activeTrack.spotify_track_id}
                      src={`https://open.spotify.com/embed/track/${activeTrack.spotify_track_id}?utm_source=generator&theme=0`}
                      width="100%"
                      height="88"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      className="block border-0 grayscale opacity-45 transition-all duration-700 hover:opacity-78"
                    />
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <TrackButton
                      icon={<FaChevronLeft size={8} />}
                      onClick={() =>
                        setCurrentTrack(
                          (current) =>
                            (current - 1 + tracks.length) % tracks.length
                        )
                      }
                    />

                    <TrackButton
                      icon={<FaChevronRight size={8} />}
                      onClick={() =>
                        setCurrentTrack(
                          (current) => (current + 1) % tracks.length
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-white/[0.045] bg-black/40 text-[8px] uppercase tracking-[0.2em] text-[#444444]">
                  nothing is coming out of the speakers
                </div>
              )}
            </div>
          </section>

          <section id="whispers" className="scroll-mt-44">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.045] pb-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Ghost size={13} className="text-[#666666] stroke-[1.5px]" />
                  <h2 className="text-[12px] font-light tracking-wide text-white/80">
                    SREEDS OF PAPER
                  </h2>
                </div>

                <p className="max-w-sm text-[11px] leading-relaxed text-[#666666]">
                  words i wrote down on napkins while waiting for the bus.
                </p>
              </div>
            </div>

            <div className="relative h-[230px] w-full overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:h-[220px]">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {messages.length > 0 ? (
                messages.map((item, index) => {
                  const spread = [
                    { left: "4%", start: "-52px", drift: "14px" },
                    { left: "17%", start: "-92px", drift: "-10px" },
                    { left: "31%", start: "-66px", drift: "16px" },
                    { left: "45%", start: "-108px", drift: "-14px" },
                    { left: "59%", start: "-58px", drift: "12px" },
                    { left: "73%", start: "-100px", drift: "-13px" },
                    { left: "86%", start: "-72px", drift: "11px" },
                  ];

                  const pos = spread[index % spread.length];

                  return (
                    <div
                      key={item.id}
                      className="absolute animate-float-up-spread"
                      style={
                        {
                          left: pos.left,
                          bottom: pos.start,
                          "--drift": pos.drift,
                          animationDelay: `${(index % 9) * 2.7}s`,
                          animationDuration: `${31 + (index % 8) * 2.8}s`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="max-w-[112px] rounded-2xl border border-white/[0.045] bg-white/[0.022] px-3 py-2 text-[9.5px] font-light leading-relaxed text-[#888888] shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.04] hover:text-white/78 sm:max-w-[130px] sm:text-[10px]">
                        <p className="break-words whitespace-pre-wrap">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center text-[11px] text-[#444444]">
                  there is no writing on the pad tonight.
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => router.push("/say-something")}
                className="rounded-full border border-white/[0.045] bg-white/[0.016] px-5 py-2 text-[8.5px] uppercase tracking-[0.22em] text-[#666666] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/70"
              >
                leave a short line
              </button>
            </div>
          </section>

          <section
            id="signals"
            className="flex flex-wrap justify-start gap-3 scroll-mt-44 opacity-42 transition-opacity duration-700 hover:opacity-80"
          >
            <SocialLink
              href="https://discord.com/users/strangeclause"
              icon={<FaDiscord size={13} />}
            />
            <SocialLink
              href="mailto:strangeclause@gmail.com"
              icon={<Mail size={13} />}
            />
            <SocialLink
              href="https://open.spotify.com/user/nxfqpp2uao8p0ldxtmlm0qkw3?si=b3d42b8ffa2e4b40"
              icon={<FaSpotify size={13} />}
            />
          </section>
        </div>
      </div>

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          everyone went home early because of the dark sky. i am still sitting here by myself.
        </p>
      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          background: #020202;
          scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
          scrollbar-width: thin;
        }

        body {
          scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
          scrollbar-width: thin;
        }

        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        body::-webkit-scrollbar-track,
        html::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
        }

        body::-webkit-scrollbar-thumb,
        html::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #020202;
        }

        body::-webkit-scrollbar-thumb:hover,
        html::-webkit-scrollbar-thumb:hover {
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

        @keyframes floatUpSpread {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }

          14% {
            opacity: 0.38;
          }

          58% {
            transform: translateY(-112px) translateX(var(--drift));
            opacity: 0.34;
          }

          100% {
            transform: translateY(-255px)
              translateX(calc(var(--drift) * -0.65));
            opacity: 0;
          }
        }

        .animate-float-up-spread {
          animation-name: floatUpSpread;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
            filter: blur(2px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .soft-scrollbar {
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
          scrollbar-width: thin;
        }

        .soft-scrollbar::-webkit-scrollbar {
          height: 4px;
        }

        .soft-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .soft-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        .soft-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
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

const MenuCard = ({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group relative min-h-[116px] w-full overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] p-5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
  >
    <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[9.5px] font-medium uppercase tracking-[0.19em] text-white/80">
          {item.title}
        </h3>

        <ArrowUpRight
          size={12}
          className="shrink-0 text-[#444444] transition-all duration-700 group-hover:text-white/75"
        />
      </div>

      <p className="max-w-[94%] text-[11.8px] leading-relaxed text-[#777777] transition-colors duration-700 group-hover:text-[#b8b8b8]">
        {item.content}
      </p>
    </div>
  </button>
);

const LoadingState = () => (
  <main
    className={`${inter.className} flex min-h-screen flex-col items-center justify-center bg-[#020202]`}
  >
    <div className="h-px w-6 bg-white/20" />
    <p className="mt-4 text-[9px] lowercase tracking-[0.26em] text-[#555555]">
      loading...
    </p>
  </main>
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

const TrackButton = ({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="rounded-full border border-white/[0.045] bg-white/[0.016] p-2.5 text-[#555555] shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/70"
  >
    {icon}
  </button>
);

const SocialLink = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="rounded-full border border-white/[0.045] bg-white/[0.016] p-2.5 text-[#555555] shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-all duration-700 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/70"
  >
    {icon}
  </a>
);