"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Loader2,
  Plus,
  Send,
  Trash2,
  Music,
  CloudRain,
  Ghost,
  Sparkles,
  Disc3,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type LowEchoTrack = {
  id: string;
  title: string | null;
  artist: string | null;
  spotify_track_id: string;
  sort_order: number | null;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const ALLOWED_EMAIL = "strangeclause@gmail.com";
const COLLAPSE_SIZE = 6;

export default function LowEchoesAdminPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tracks, setTracks] = useState<LowEchoTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    spotify_track_id: "",
    sort_order: 0,
  });

  const visibleTracks = tracks.slice(0, visibleCount);
  const hasMore = visibleCount < tracks.length;
  const expanded = tracks.length > 0 && visibleCount >= tracks.length;
  const isAllowed = userEmail === ALLOWED_EMAIL;

  const footerLines = useMemo(
    () => [
      "some songs stay quieter after midnight.",
      "echoes sound warmer in empty rooms.",
      "certain frequencies never fully leave.",
      "music remembers the silence too.",
      "not every melody wants to be loud.",
    ],
    []
  );

  const footerText = useMemo(
    () => footerLines[Math.floor(Math.random() * footerLines.length)],
    [footerLines]
  );

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }));

    setRainDrops(drops);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email || null;

      if (!email) {
        router.replace("/admin");
        setAuthLoading(false);
        return;
      }

      setUserEmail(email);
      setAuthLoading(false);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const email = session?.user?.email || null;
        setUserEmail(email);

        if (!email) {
          router.replace("/admin");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const fetchTracks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("low_echoes")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setTracks((data || []) as LowEchoTrack[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAllowed) fetchTracks();
  }, [isAllowed]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  const resetForm = () => {
    setForm({
      title: "",
      artist: "",
      spotify_track_id: "",
      sort_order: 0,
    });

    setEditingId(null);
  };

  const addTrack = async () => {
    if (!form.spotify_track_id.trim()) return;

    const payload = {
      title: form.title,
      artist: form.artist,
      spotify_track_id: form.spotify_track_id.trim(),
      sort_order: form.sort_order,
    };

    let error = null;

    if (editingId) {
      const response = await supabase
        .from("low_echoes")
        .update(payload)
        .eq("id", editingId);

      error = response.error;
    } else {
      const response = await supabase.from("low_echoes").insert(payload);
      error = response.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    setOpen(false);
    fetchTracks();
  };

  const deleteTrack = async (id: string) => {
    if (!confirm("Delete this track?")) return;

    const { error } = await supabase.from("low_echoes").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTracks();
  };

  const editTrack = (track: LowEchoTrack) => {
    setEditingId(track.id);

    setForm({
      title: track.title || "",
      artist: track.artist || "",
      spotify_track_id: track.spotify_track_id || "",
      sort_order: track.sort_order || 0,
    });

    setOpen(true);
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, tracks.length));
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("echo-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020202] text-white">
        <Loader2 size={18} className="animate-spin" />
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020202] text-white">
        <Loader2 size={18} className="animate-spin" />
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <AccessScreen
        title="not allowed"
        subtitle={`signed in as ${userEmail}`}
        button="sign out"
        onClick={signOut}
      />
    );
  }

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.back()}
            className="group hidden shrink-0 items-center gap-2 justify-self-start text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 md:flex md:text-[9px]"
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
            className="group col-start-1 row-start-1 flex min-w-0 flex-col items-start justify-self-start text-left md:col-start-2 md:items-center md:justify-self-center md:text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>

            <span className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[320px] sm:text-[8px]">
              low echoes
            </span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="group col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px] md:col-start-3"
          >
            <Plus
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-700 group-hover:rotate-90"
            />
            <span className="hidden sm:inline">add</span>
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / low echoes
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              songs that stayed
              <br />
              after the noise left.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some songs only sound alive at night.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                shelf status
              </p>

              <Music size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {tracks.length} echoes saved
            </p>
          </aside>
        </header>

        <section id="echo-section" className="scroll-mt-36">
          <ShelfHeader
            title="SAVED LINKS"
            count={`${visibleTracks.length} shown · ${tracks.length} saved`}
          />

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={18} className="animate-spin text-[#777777]" />
            </div>
          ) : tracks.length === 0 ? (
            <EmptyEchoes />
          ) : (
            <>
              <div className="space-y-2.5">
                {visibleTracks.map((track, index) => (
                  <div
                    key={track.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group animate-fade-in relative overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.014] shadow-[0_10px_30px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.028]"
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="flex items-center gap-3 p-3 sm:p-3.5">
                      <div className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.05] bg-black/50 sm:h-[72px] sm:w-[72px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_60%)]" />

                        <Disc3
                          size={34}
                          strokeWidth={1}
                          className="text-white/12 transition-all duration-1000 group-hover:rotate-[160deg] group-hover:text-white/20"
                        />

                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/70 px-2 py-1 text-[6px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
                          <Music size={8} strokeWidth={1.5} />
                          spotify
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="mb-1 truncate text-[6.5px] uppercase tracking-[0.18em] text-[#777777]">
                              {track.artist || "unknown artist"}
                            </p>

                            <h3 className="line-clamp-1 text-[13px] font-light tracking-[-0.03em] text-white sm:text-[14px]">
                              {track.title || "untitled frequency"}
                            </h3>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              onClick={() => editTrack(track)}
                              className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                            >
                              <Edit size={10} />
                            </button>

                            <button
                              onClick={() => deleteTrack(track.id)}
                              className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 overflow-hidden rounded-full border border-white/[0.05] bg-black/30">
                          <div className="h-[3px] w-[38%] rounded-full bg-white/30 transition-all duration-1000 group-hover:w-[72%]" />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="line-clamp-1 break-all text-[9px] leading-relaxed text-[#666666]">
                            {track.spotify_track_id}
                          </p>

                          <div className="hidden shrink-0 items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[6px] uppercase tracking-[0.16em] text-[#777777] sm:flex">
                            low echo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tracks.length > COLLAPSE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMore && (
                    <button
                      type="button"
                      onClick={showMore}
                      className="CollapseBtn"
                    >
                      show more
                      <ChevronDown size={11} strokeWidth={1.5} />
                    </button>
                  )}

                  {expanded && (
                    <button
                      type="button"
                      onClick={collapse}
                      className="CollapseBtn"
                    >
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
          onClick={() => setOpen(false)}
          className="animate-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="modal-scroll relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-[#666666] transition-colors duration-700 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="mb-7 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3 shadow-[0_0_24px_rgba(255,255,255,0.035)]">
                  <Music
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#d0d0d0]"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
                {editingId ? "edit echo" : "add echo"}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-[#777777]">
                put down one quiet echo so it stays here after you close the tab.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
              />

              <Input
                label="Artist"
                value={form.artist}
                onChange={(value) => setForm({ ...form, artist: value })}
              />

              <Input
                label="Spotify Track ID"
                value={form.spotify_track_id}
                onChange={(value) =>
                  setForm({ ...form, spotify_track_id: value })
                }
              />

              <Input
                label="Sort Order"
                value={String(form.sort_order)}
                onChange={(value) =>
                  setForm({ ...form, sort_order: Number(value) })
                }
              />

              <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3">
                <p className="text-[9px] leading-relaxed text-[#666666]">
                  Example: open.spotify.com/track/2tUP3mqIeDe6puSEm0D9t3
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                  locked room
                </p>

                <button
                  onClick={addTrack}
                  disabled={!form.spotify_track_id.trim()}
                  className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <Send size={10} strokeWidth={1.5} className="transition-transform duration-700 group-hover:translate-x-0.5" />
                  {editingId ? "update" : "release"}
                </button>
              </div>
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

function AccessScreen({
  title,
  subtitle,
  button,
  onClick,
}: {
  title: string;
  subtitle: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#020202] px-6 text-white">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="mb-5 flex items-center gap-2 text-white/70">
          <Lock size={14} />
          <p className="text-xs uppercase tracking-[0.25em]">{title}</p>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-white/45">
          {subtitle}
        </p>

        <button
          onClick={onClick}
          className="w-full rounded-full border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/75 transition-all duration-700 hover:border-white/20 hover:bg-white/[0.1]"
        >
          {button}
        </button>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[12px] text-[#d0d0d0] outline-none transition-all duration-500 placeholder:text-[#666666] focus:border-white/15"
      />
    </label>
  );
}

function ShelfHeader({
  title,
  count,
}: {
  title: string;
  count: string;
}) {
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

function EmptyEchoes() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <Music size={16} strokeWidth={1.5} className="mb-3 opacity-60" />

      <p className="text-[8px] uppercase tracking-[0.22em]">
        no echoes recovered
      </p>
    </div>
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

function GlobalStyles() {
  return (
    <style jsx global>{`
      html,
      body {
        scroll-behavior: smooth;
        background: #020202;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.14) rgba(255,255,255,0.025);
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track {
        background:
          linear-gradient(
            180deg,
            rgba(7,7,7,0.96),
            rgba(2,2,2,1)
          );
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background:
          linear-gradient(
            180deg,
            rgba(255,255,255,0.16),
            rgba(255,255,255,0.07)
          );
        border: 2px solid #020202;
        box-shadow:
          0 0 12px rgba(255,255,255,0.045),
          inset 0 0 8px rgba(255,255,255,0.03);
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover {
        background:
          linear-gradient(
            180deg,
            rgba(255,255,255,0.26),
            rgba(255,255,255,0.12)
          );
        box-shadow:
          0 0 16px rgba(255,255,255,0.07),
          inset 0 0 10px rgba(255,255,255,0.05);
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

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        -webkit-line-clamp: 1;
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

      .modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.12) transparent;
      }

      .modal-scroll::-webkit-scrollbar {
        width: 5px;
      }

      .modal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .modal-scroll::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
      }

      .modal-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.2);
      }


      .modal-scroll::-webkit-scrollbar {
        display: none;
      }

      .modal-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
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
}