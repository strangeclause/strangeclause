"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import {
  Lock,
  EyeOff,
  LogOut,
  ChevronRight,
  ShieldQuestion,
  Sparkles,
  CloudRain,
} from "lucide-react";
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

type AdminRoom = {
  label: string;
  route: string;
  sub: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const ADMIN_EMAIL = "strangeclause@gmail.com";

  const footerLines = useMemo(
    () => [
      "the archive only opens for the one who made it.",
      "some rooms should stay locked.",
      "the void has keys, and you are holding one.",
      "fragments behave better under supervision.",
      "nothing disappears here, it only changes shelves.",
    ],
    []
  );

  const footerText = useMemo(
    () => footerLines[Math.floor(Math.random() * footerLines.length)],
    [footerLines]
  );

  const rooms: AdminRoom[] = useMemo(
    () => [
      {
        label: "memories",
        route: "/admin/memories",
        sub: "manage saved visual traces",
      },
      {
        label: "late night cinema",
        route: "/admin/late-night-cinema",
        sub: "edit the silver screens",
      },
      {
        label: "unsent notes",
        route: "/admin/unsent-notes",
        sub: "words for the night",
      },
      {
        label: "roblox memories",
        route: "/admin/roblox-memories",
        sub: "raw file archive",
      },
      {
        label: "lonely corners",
        route: "/admin/lonely-corners",
        sub: "manage quiet corners",
      },
      {
        label: "quiet music",
        route: "/admin/quiet-music",
        sub: "songs that still echo",
      },
      {
        label: "saved pages",
        route: "/admin/saved-pages",
        sub: "pages still carried",
      },
      {
        label: "low echoes",
        route: "/admin/low-echoes",
        sub: "spotify tracks for the main page",
      },
      {
        label: "game archives",
        route: "/admin/game-archives",
        sub: "roblox game shelves and grind logs",
      },
      {
        label: "the one who stayed",
        route: "/admin/the-one-who-stayed",
        sub: "keep a person inside one quiet little page.",
      },
      {
        label: "the room owner",
        route: "/admin/the-room-owner",
        sub: "keep a person inside one quiet little page.",
      },
    ],
    []
  );

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return;

    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user) {
    return (
      <main
        id="main-content"
        className={`${inter.className} relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020202] px-6 text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
      >
        <Background rainDrops={rainDrops} />

        <div className="animate-fade-in relative z-20 w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.045] bg-white/[0.012] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="space-y-7">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.055] bg-white/[0.025] shadow-[0_0_24px_rgba(255,255,255,0.035)]">
                <Lock size={16} strokeWidth={1.5} className="text-[#d0d0d0]" />
              </div>

              <h1 className="text-[26px] font-light leading-tight tracking-[-0.05em] text-white/90">
                inner sanctum
              </h1>

              <p className="mx-auto max-w-xs text-[11px] leading-relaxed text-[#777777]">
                Only the maker can open this room. Enter quietly.
              </p>
            </div>

            <div className="space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity"
                className="w-full border-b border-white/[0.08] bg-transparent py-2.5 text-[12px] text-white outline-none transition-colors placeholder:text-[#666666] focus:border-white/30"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="keyphrase"
                className="w-full border-b border-white/[0.08] bg-transparent py-2.5 text-[12px] text-white outline-none transition-colors placeholder:text-[#666666] focus:border-white/30"
              />
            </div>

            <button
              onClick={login}
              disabled={!email.trim() || !password.trim()}
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
            >
              verify existence
            </button>
          </div>
        </div>

        <GlobalStyles />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main
        id="main-content"
        className={`${inter.className} relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020202] px-6 text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
      >
        <Background rainDrops={rainDrops} />

        <div className="relative z-20 flex flex-col items-center">
          <EyeOff size={20} strokeWidth={1.5} className="mb-6 text-[#777777]" />

          <p className="text-[9px] uppercase tracking-[0.22em] text-[#777777]">
            stranger detected
          </p>

          <button
            onClick={logout}
            className="mt-8 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045] hover:text-white"
          >
            leave at once
          </button>
        </div>

        <GlobalStyles />
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 sm:px-12 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/")}
            className="group flex min-w-0 flex-col items-start"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </p>
            <p className="hidden max-w-[260px] truncate text-[8px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:block">
              admin rooms kept behind rainy glass
            </p>
          </button>

          <button
            onClick={logout}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <LogOut
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:translate-x-0.5"
            />
            vanish
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                private collection
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              tending to
              <br />
              the fragments.
            </h1>

            <p className="max-w-lg text-[12.5px] leading-relaxed text-[#8f8f8f]">
              This is where the quiet things are edited, erased, archived, and
              kept breathing.
            </p>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <ShieldQuestion size={12} strokeWidth={1.5} />
              <span>some ghosts need maintenance.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                logged as
              </p>
              <Lock size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="truncate text-[13px] text-white/80">{user.email}</p>
            <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              The archive is open. Keep every shelf small, clean, and easy to
              find again.
            </p>
          </aside>
        </header>

        <section>
          <ShelfHeader title="archive rooms" count={`${rooms.length} rooms`} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rooms.map((item) => (
              <button
                key={item.route}
                onClick={() => router.push(item.route)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.012] p-4 text-left shadow-[0_12px_36px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.026]"
              >
                <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/82 sm:text-[9px]">
                      {item.label}
                    </span>

                    <ChevronRight
                      size={13}
                      strokeWidth={1.5}
                      className="translate-x-[-5px] text-[#666666] opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:text-white/80 group-hover:opacity-100"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.045] pt-3">
                    <span className="text-[7px] uppercase tracking-[0.18em] text-[#555555]">
                      open
                    </span>

                    <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-700 group-hover:bg-white/55" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

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

const GlobalStyles = () => (
  <style jsx global>{`
    html,
    body {
      scroll-behavior: smooth;
      background: #020202;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.14) rgba(255, 255, 255, 0.025);
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }

    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: linear-gradient(
        180deg,
        rgba(7, 7, 7, 0.96),
        rgba(2, 2, 2, 1)
      );
    }

    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
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

    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
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

const ShelfHeader = ({
  title,
  count,
}: {
  title: string;
  count: string;
}) => (
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