"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Loader2,
  Image,
  Gamepad2,
  Lock,
  X,
  Layers,
  ScrollText,
  Upload,
  CloudRain,
  Ghost,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ALLOWED_EMAIL = "strangeclause@gmail.com";
const STORAGE_BUCKET = "stranger-uploads";
const COLLAPSE_SIZE = 4;

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

type GameArchive = {
  id: string;
  name: string;
  mood: string | null;
  status: string | null;
  banner: string | null;
  game_url: string | null;
  short_line: string | null;
  sort_order: number | null;
  inventory?: InventorySection[];
  grind_logs?: GrindLog[];
};

type InventorySection = {
  id: string;
  game_id: string;
  title: string;
  type: string | null;
  height: string | null;
  sort_order: number | null;
  images?: InventoryImage[];
};

type InventoryImage = {
  id: string;
  section_id: string;
  image_url: string;
  sort_order: number | null;
};

type GrindLog = {
  id: string;
  game_id: string;
  title: string;
  detail: string | null;
  sort_order: number | null;
};

type DraftShelf = {
  id?: string;
  title: string;
  type: string;
  height: string;
  sort_order: number;
  images: {
    id?: string;
    image_url: string;
    sort_order: number;
  }[];
};

type DraftLog = {
  id?: string;
  title: string;
  detail: string;
  sort_order: number;
};

export default function AdminGameArchivePage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [games, setGames] = useState<GameArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [visibleCount, setVisibleCount] = useState(COLLAPSE_SIZE);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState("");
  const [expandedShelves, setExpandedShelves] = useState<Record<number, boolean>>({});

  const [gameForm, setGameForm] = useState({
    name: "",
    mood: "",
    status: "",
    banner: "",
    game_url: "",
    short_line: "",
    sort_order: 0,
  });

  const [draftShelves, setDraftShelves] = useState<DraftShelf[]>([
    {
      title: "",
      type: "",
      height: "h-60",
      sort_order: 0,
      images: [],
    },
  ]);

  const [draftLogs, setDraftLogs] = useState<DraftLog[]>([
    {
      title: "",
      detail: "",
      sort_order: 0,
    },
  ]);

  const visibleGames = games.slice(0, visibleCount);
  const hasMore = visibleCount < games.length;
  const expanded = games.length > 0 && visibleCount >= games.length;
  const isAllowed = userEmail === ALLOWED_EMAIL;

  const normalizeDraftLogs = (logs: DraftLog[]) =>
    logs.map((log, index) => ({
      ...log,
      sort_order: index,
    }));

  const addLogAtTop = () => {
    setDraftLogs((prev) =>
      normalizeDraftLogs([
        {
          title: "",
          detail: "",
          sort_order: 0,
        },
        ...prev,
      ])
    );
  };

  const removeDraftLog = (logIndex: number) => {
    setDraftLogs((prev) =>
      normalizeDraftLogs(prev.filter((_, index) => index !== logIndex))
    );
  };

  const footerText = useMemo(() => {
    const lines = [
      "some games stayed longer than the people inside them.",
      "certain inventories feel strangely alive at night.",
      "the archive remembers every unfinished grind.",
      "some worlds still exist after logout.",
      "not every memory wants to leave the server.",
    ];

    return lines[Math.floor(Math.random() * lines.length)];
  }, []);

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
      setUserEmail(data.user?.email || null);
      setAuthLoading(false);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchGames = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("roblox_game_archives")
      .select(`
        *,
        inventory:roblox_game_inventory_sections(
          *,
          images:roblox_game_inventory_images(*)
        ),
        grind_logs:roblox_game_grind_logs(*)
      `)
      .order("sort_order", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const sorted = (data || []).map((game: GameArchive) => ({
      ...game,
      inventory: [...(game.inventory || [])]
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((section) => ({
          ...section,
          images: [...(section.images || [])].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          ),
        })),
      grind_logs: [...(game.grind_logs || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }));

    setGames(sorted);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !userEmail) {
      router.replace("/admin");
      return;
    }

    if (isAllowed) fetchGames();
  }, [authLoading, userEmail, isAllowed, router]);

  const uploadImage = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `game-archive/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const resetGameModal = () => {
    setEditingGameId(null);
    setGameForm({
      name: "",
      mood: "",
      status: "",
      banner: "",
      game_url: "",
      short_line: "",
      sort_order: 0,
    });
    setDraftShelves([
      {
        title: "",
        type: "",
        height: "h-60",
        sort_order: 0,
        images: [],
      },
    ]);
    setDraftLogs([
      {
        title: "",
        detail: "",
        sort_order: 0,
      },
    ]);
    setExpandedShelves({});
  };

  const openAddModal = () => {
    resetGameModal();
    setExpandedShelves({});
    setGameModalOpen(true);
  };

  const openEditModal = (game: GameArchive) => {
    setEditingGameId(game.id);
    setGameForm({
      name: game.name || "",
      mood: game.mood || "",
      status: game.status || "",
      banner: game.banner || "",
      game_url: game.game_url || "",
      short_line: game.short_line || "",
      sort_order: game.sort_order || 0,
    });

    setDraftShelves(
      game.inventory?.length
        ? game.inventory.map((section, sectionIndex) => ({
            id: section.id,
            title: section.title || "",
            type: section.type || "",
            height: section.height || "h-60",
            sort_order: section.sort_order ?? sectionIndex,
            images:
              section.images?.map((img, imageIndex) => ({
                id: img.id,
                image_url: img.image_url,
                sort_order: img.sort_order ?? imageIndex,
              })) || [],
          }))
        : [
            {
              title: "",
              type: "",
              height: "h-60",
              sort_order: 0,
              images: [],
            },
          ]
    );

    setDraftLogs(
      game.grind_logs?.length
        ? game.grind_logs.map((log, logIndex) => ({
            id: log.id,
            title: log.title || "",
            detail: log.detail || "",
            sort_order: log.sort_order ?? logIndex,
          }))
        : [
            {
              title: "",
              detail: "",
              sort_order: 0,
            },
          ]
    );

    setExpandedShelves({});
    setGameModalOpen(true);
  };

  const handleBannerUpload = async (file?: File) => {
    if (!file) return;

    setUploadingKey("banner");

    try {
      const url = await uploadImage(file, "banners");
      setGameForm((prev) => ({ ...prev, banner: url }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingKey("");
    }
  };

  const handleShelfImageUpload = async (shelfIndex: number, files?: FileList | null) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    setUploadingKey(`shelf-${shelfIndex}`);

    try {
      const uploadedImages = await Promise.all(
        selectedFiles.map(async (file, fileIndex) => {
          const url = await uploadImage(file, "inventory");

          return {
            image_url: url,
            sort_order: fileIndex,
          };
        })
      );

      setDraftShelves((prev) =>
        prev.map((shelf, index) =>
          index === shelfIndex
            ? {
                ...shelf,
                images: [
                  ...shelf.images,
                  ...uploadedImages.map((image, imageIndex) => ({
                    ...image,
                    sort_order: shelf.images.length + imageIndex,
                  })),
                ],
              }
            : shelf
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingKey("");
    }
  };

  const saveGame = async () => {
    if (!gameForm.name.trim() || saving) return;

    setSaving(true);

    try {
      const gamePayload = {
        name: gameForm.name,
        mood: gameForm.mood,
        status: gameForm.status,
        banner: gameForm.banner,
        game_url: gameForm.game_url,
        short_line: gameForm.short_line,
        sort_order: gameForm.sort_order,
      };

      let gameId = editingGameId;

      if (editingGameId) {
        const { error } = await supabase
          .from("roblox_game_archives")
          .update(gamePayload)
          .eq("id", editingGameId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("roblox_game_archives")
          .insert(gamePayload)
          .select()
          .single();

        if (error || !data) throw error || new Error("Failed to add game");
        gameId = data.id;
      }

      if (!gameId) return;

      for (const shelf of draftShelves) {
        if (!shelf.title.trim()) continue;

        let sectionId = shelf.id;

        if (sectionId) {
          const { error } = await supabase
            .from("roblox_game_inventory_sections")
            .update({
              title: shelf.title,
              type: shelf.type,
              height: shelf.height,
              sort_order: shelf.sort_order,
            })
            .eq("id", sectionId);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("roblox_game_inventory_sections")
            .insert({
              game_id: gameId,
              title: shelf.title,
              type: shelf.type,
              height: shelf.height,
              sort_order: shelf.sort_order,
            })
            .select()
            .single();

          if (error || !data) throw error || new Error("Failed to add shelf");
          sectionId = data.id;
        }

        for (const [imageIndex, image] of shelf.images.entries()) {
          if (!image.image_url.trim() || !sectionId) continue;

          if (image.id) {
            const { error } = await supabase
              .from("roblox_game_inventory_images")
              .update({
                image_url: image.image_url,
                sort_order: image.sort_order ?? imageIndex,
              })
              .eq("id", image.id);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("roblox_game_inventory_images")
              .insert({
                section_id: sectionId,
                image_url: image.image_url,
                sort_order: image.sort_order ?? imageIndex,
              });

            if (error) throw error;
          }
        }
      }

      const orderedLogs = normalizeDraftLogs(draftLogs);

      for (const [logIndex, log] of orderedLogs.entries()) {
        if (!log.title.trim()) continue;

        if (log.id) {
          const { error } = await supabase
            .from("roblox_game_grind_logs")
            .update({
              title: log.title,
              detail: log.detail,
              sort_order: log.sort_order ?? logIndex,
            })
            .eq("id", log.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("roblox_game_grind_logs").insert({
            game_id: gameId,
            title: log.title,
            detail: log.detail,
            sort_order: log.sort_order ?? logIndex,
          });

          if (error) throw error;
        }
      }

      resetGameModal();
      setGameModalOpen(false);
      fetchGames();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save archive");
    } finally {
      setSaving(false);
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game archive?")) return;

    const { error } = await supabase
      .from("roblox_game_archives")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchGames();
  };

  const deleteExistingRow = async (table: string, id?: string) => {
    if (!id) return;
    if (!confirm("Delete this item?")) return;

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchGames();
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + COLLAPSE_SIZE, games.length));
  };

  const collapse = () => {
    setVisibleCount(COLLAPSE_SIZE);

    document
      .getElementById("archive-section")
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
        button="back"
        onClick={() => router.push("/")}
      />
    );
  }

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.back()}
            className="group hidden shrink-0 items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-[#666666] transition-colors duration-700 hover:text-white/80 md:flex md:text-[9px]"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            leave
          </button>

          <button
            onClick={() => router.push("/")}
            className="group mr-auto flex min-w-0 flex-col items-start text-left md:mr-0 md:items-center md:text-center"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80 sm:text-[11px]">
              strange clause
            </span>
            <span className="block max-w-[220px] truncate text-[7px] lowercase tracking-[0.12em] text-[#666666] transition-colors duration-500 group-hover:text-white/60 sm:max-w-[320px] sm:text-[8px]">
              game archives
            </span>
          </button>

          <button
            onClick={openAddModal}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/75 sm:px-4 sm:text-[8.5px]"
          >
            <Plus size={11} strokeWidth={1.5} />
            <span className="hidden sm:inline">add</span>
          </button>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-[1500px] px-5 pb-20 pt-28 sm:px-8 sm:pt-36 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-10 grid grid-cols-1 items-end gap-5 sm:mb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / game archives
              </p>
            </div>

            <h1 className="max-w-2xl text-[26px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 sm:text-[32px] md:text-[42px]">
              worlds that stayed
              <br />
              after logout.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>some servers never fully close.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                archive status
              </p>
              <Gamepad2 size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">{games.length} worlds saved</p>
          </aside>
        </header>

        <section id="archive-section" className="scroll-mt-36">
          <ShelfHeader
            title="SAVED GAMES"
            count={`${visibleGames.length} shown · ${games.length} saved`}
          />

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={18} className="animate-spin text-[#777777]" />
            </div>
          ) : visibleGames.length === 0 ? (
            <EmptyArchives />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleGames.map((game, index) => (
                  <div
                    key={game.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="group animate-fade-in overflow-hidden rounded-2xl border border-white/[0.045] bg-white/[0.014] shadow-[0_12px_36px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.03]"
                  >
                    <div className="relative aspect-[16/7] overflow-hidden">
                      {game.banner ? (
                        <img
                          src={game.banner}
                          alt={game.name}
                          className="h-full w-full object-cover opacity-70 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-90"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-black/60 text-[#666666]">
                          <Gamepad2 size={26} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition-all duration-700 sm:opacity-0 sm:group-hover:opacity-100">
                        {game.game_url && (
                          <a
                            href={game.game_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}

                        <button
                          onClick={() => openEditModal(game)}
                          className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-white"
                        >
                          <Edit size={11} />
                        </button>

                        <button
                          onClick={() => deleteGame(game.id)}
                          className="rounded-full border border-white/[0.08] bg-black/70 p-2 text-[#777777] transition-colors duration-500 hover:text-red-200"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/[0.08] bg-black/70 px-2.5 py-1 text-[6.5px] uppercase tracking-[0.16em] text-[#d0d0d0] backdrop-blur-md">
                            {game.status || "release"}
                          </span>

                          {game.mood && (
                            <span className="rounded-full border border-white/[0.08] bg-black/70 px-2.5 py-1 text-[6.5px] uppercase tracking-[0.16em] text-[#888888] backdrop-blur-md">
                              {game.mood}
                            </span>
                          )}
                        </div>

                        <h3 className="line-clamp-1 text-[18px] font-light tracking-[-0.05em] text-white">
                          {game.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      {game.short_line && (
                        <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#777777]">
                          {game.short_line}
                        </p>
                      )}

                      <MiniBlock
                        icon={<Layers size={11} />}
                        title="shelves"
                        text={`${game.inventory?.length || 0} shelves · ${
                          game.inventory?.reduce(
                            (acc, section) => acc + (section.images?.length || 0),
                            0
                          ) || 0
                        } images`}
                      />

                      <div className="grid grid-cols-4 gap-2">
                        {game.inventory
                          ?.flatMap((section) => section.images || [])
                          .slice(0, 4)
                          .map((image) => (
                            <div
                              key={image.id}
                              className="aspect-square overflow-hidden rounded-xl border border-white/[0.05]"
                            >
                              <img
                                src={image.image_url}
                                alt="inventory"
                                className="h-full w-full object-cover opacity-75"
                              />
                            </div>
                          ))}
                      </div>

                      <MiniBlock
                        icon={<ScrollText size={11} />}
                        title="grind logs"
                        text={`${game.grind_logs?.length || 0} logs saved`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {games.length > COLLAPSE_SIZE && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {hasMore && (
                    <button type="button" onClick={showMore} className="CollapseBtn">
                      show more
                      <ChevronDown size={11} />
                    </button>
                  )}

                  {expanded && (
                    <button type="button" onClick={collapse} className="CollapseBtn">
                      collapse again
                      <ChevronUp size={11} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {gameModalOpen && (
        <Modal
          title={editingGameId ? "edit world" : "add world"}
          onClose={() => {
            setGameModalOpen(false);
            resetGameModal();
          }}
        >
          <div className="grid gap-4">
            <Input
              label="Game Title"
              value={gameForm.name}
              onChange={(value) => setGameForm({ ...gameForm, name: value })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Mood"
                value={gameForm.mood}
                onChange={(value) => setGameForm({ ...gameForm, mood: value })}
              />
              <Input
                label="Status"
                value={gameForm.status}
                onChange={(value) => setGameForm({ ...gameForm, status: value })}
              />
            </div>

            <Input
              label="Game Link"
              value={gameForm.game_url}
              onChange={(value) => setGameForm({ ...gameForm, game_url: value })}
            />

            <Input
              label="Short Line"
              value={gameForm.short_line}
              onChange={(value) =>
                setGameForm({ ...gameForm, short_line: value })
              }
            />

            <ImageUploadBox
              imageUrl={gameForm.banner}
              loading={uploadingKey === "banner"}
              onUpload={handleBannerUpload}
            />

            <ModalDivider
              title="inventory shelves"
              buttonLabel="add shelf"
              onAdd={() =>
                setDraftShelves((prev) => [
                  ...prev,
                  {
                    title: "",
                    type: "",
                    height: "h-60",
                    sort_order: prev.length,
                    images: [],
                  },
                ])
              }
            />

            <div className="space-y-3">
              {draftShelves.map((shelf, shelfIndex) => {
                const isShelfExpanded = Boolean(expandedShelves[shelfIndex]);
                const visibleShelfImages = isShelfExpanded
                  ? shelf.images
                  : shelf.images.slice(0, 8);
                const hiddenShelfImages = Math.max(
                  shelf.images.length - visibleShelfImages.length,
                  0
                );

                return (
                <div
                  key={`${shelf.id || "new"}-${shelfIndex}`}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#777777]">
                      shelf {shelfIndex + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (shelf.id) {
                          deleteExistingRow(
                            "roblox_game_inventory_sections",
                            shelf.id
                          );
                        }

                        setDraftShelves((prev) =>
                          prev.filter((_, index) => index !== shelfIndex)
                        );
                      }}
                      className="text-red-200/70 transition hover:text-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      label="Title"
                      value={shelf.title}
                      onChange={(value) =>
                        setDraftShelves((prev) =>
                          prev.map((item, index) =>
                            index === shelfIndex
                              ? { ...item, title: value }
                              : item
                          )
                        )
                      }
                    />

                    <Input
                      label="Type"
                      value={shelf.type}
                      onChange={(value) =>
                        setDraftShelves((prev) =>
                          prev.map((item, index) =>
                            index === shelfIndex
                              ? { ...item, type: value }
                              : item
                          )
                        )
                      }
                    />

                    <Input
                      label="Height"
                      value={shelf.height}
                      onChange={(value) =>
                        setDraftShelves((prev) =>
                          prev.map((item, index) =>
                            index === shelfIndex
                              ? { ...item, height: value }
                              : item
                          )
                        )
                      }
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {visibleShelfImages.map((img, visibleImageIndex) => {
                      const imageIndex = shelf.images.findIndex(
                        (image) => image === img
                      );

                      return (
                      <div
                        key={`${img.id || "draft"}-${imageIndex}-${visibleImageIndex}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.07] bg-black"
                      >
                        <img
                          src={img.image_url}
                          alt="shelf"
                          className="h-full w-full object-cover opacity-75"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (img.id) {
                              deleteExistingRow(
                                "roblox_game_inventory_images",
                                img.id
                              );
                            }

                            setDraftShelves((prev) =>
                              prev.map((item, index) =>
                                index === shelfIndex
                                  ? {
                                      ...item,
                                      images: item.images.filter(
                                        (_, i) => i !== imageIndex
                                      ),
                                    }
                                  : item
                              )
                            );
                          }}
                          className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-red-200 opacity-0 transition group-hover:opacity-100"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                    })}

                    {!isShelfExpanded && hiddenShelfImages > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedShelves((prev) => ({
                            ...prev,
                            [shelfIndex]: true,
                          }))
                        }
                        className="flex aspect-square items-center justify-center rounded-xl border border-white/[0.07] bg-black/45 text-[7px] uppercase tracking-[0.16em] text-[#777777] transition hover:border-white/15 hover:text-white"
                      >
                        +{hiddenShelfImages} more
                      </button>
                    )}

                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-white/45 transition hover:bg-white/[0.04]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(event) => {
                          handleShelfImageUpload(shelfIndex, event.target.files);
                          event.currentTarget.value = "";
                        }}
                      />

                      {uploadingKey === `shelf-${shelfIndex}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <Plus size={18} />
                          <span className="text-[6px] uppercase tracking-[0.16em]">
                            many
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {isShelfExpanded && shelf.images.length > 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedShelves((prev) => ({
                          ...prev,
                          [shelfIndex]: false,
                        }))
                      }
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
                    >
                      collapse images
                      <ChevronUp size={10} />
                    </button>
                  )}
                </div>
                );
              })}
            </div>

            <ModalDivider
              title="grind logs"
              buttonLabel="add log"
              onAdd={addLogAtTop}
            />

            <div className="space-y-3">
              {draftLogs.map((log, logIndex) => (
                <div
                  key={`${log.id || "new"}-${logIndex}`}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#777777]">
                      log {logIndex + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (log.id) {
                          deleteExistingRow("roblox_game_grind_logs", log.id);
                        }

                        removeDraftLog(logIndex);
                      }}
                      className="text-red-200/70 transition hover:text-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <Input
                    label="Title"
                    value={log.title}
                    onChange={(value) =>
                      setDraftLogs((prev) =>
                        prev.map((item, index) =>
                          index === logIndex ? { ...item, title: value } : item
                        )
                      )
                    }
                  />

                  <Textarea
                    label="Detail"
                    value={log.detail}
                    onChange={(value) =>
                      setDraftLogs((prev) =>
                        prev.map((item, index) =>
                          index === logIndex
                            ? { ...item, detail: value }
                            : item
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.055] pt-4">
              <p className="text-[8px] uppercase tracking-[0.18em] text-[#666666]">
                locked room
              </p>

              <button
                onClick={saveGame}
                disabled={saving || !gameForm.name.trim()}
                className="group flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-[#9a9a9a] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                {saving ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Send
                    size={10}
                    strokeWidth={1.5}
                    className="transition-transform duration-700 group-hover:translate-x-0.5"
                  />
                )}

                {editingGameId ? "update" : "release"}
              </button>
            </div>
          </div>
        </Modal>
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
        <div className="mb-5 flex items-center gap-2 text-white/70">
          <Lock size={14} />
          <p className="text-xs uppercase tracking-[0.25em]">{title}</p>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-white/45">{subtitle}</p>
        <button
          onClick={onClick}
          className="w-full rounded-full border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/75"
        >
          {button}
        </button>
      </div>
    </main>
  );
}

function MiniBlock({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/25 px-3 py-2">
      <div className="flex items-center gap-2 text-[#777777]">
        {icon}
        <p className="text-[7px] uppercase tracking-[0.18em]">{title}</p>
      </div>
      <p className="text-[10px] text-[#888888]">{text}</p>
    </div>
  );
}

function ModalDivider({
  title,
  buttonLabel,
  onAdd,
}: {
  title: string;
  buttonLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-white/[0.055] pt-4">
      <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
        {title}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-2 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
      >
        <Plus size={11} />
        {buttonLabel}
      </button>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="animate-modal fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="modal-scroll relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/[0.06] bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-6"
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 text-[#666666] transition-colors duration-700 hover:text-white"
        >
          <X size={14} />
        </button>

        <div className="mb-7 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full border border-white/[0.06] bg-white/[0.025] p-3 shadow-[0_0_24px_rgba(255,255,255,0.035)]">
              <Gamepad2
                size={14}
                strokeWidth={1.5}
                className="text-[#d0d0d0]"
              />
            </div>
          </div>

          <h2 className="text-[14px] font-light uppercase tracking-[0.22em] text-white/90">
            {title}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-[#777777]">
            put down one quiet scene so it stays here after you close the tab.
          </p>
        </div>

        {children}
      </div>
    </div>
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
        className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[12px] text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className="mb-2 block text-[8px] uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-24 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-[#d0d0d0] outline-none transition-colors placeholder:text-[#666666] focus:border-white/15"
      />
    </label>
  );
}

function ImageUploadBox({
  imageUrl,
  loading,
  onUpload,
}: {
  imageUrl: string;
  loading: boolean;
  onUpload: (file?: File) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] uppercase tracking-[0.18em] text-[#777777]">
        banner image
      </span>
      <div className="flex min-h-[190px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.055] bg-white/[0.025] text-[#777777] transition-all duration-700 hover:border-white/12 hover:bg-white/[0.04]">
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="banner" className="max-h-[340px] w-full object-cover grayscale opacity-80" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={18} />
            <span className="text-[8px] uppercase tracking-[0.22em]">
              upload banner
            </span>
          </div>
        )}
      </div>
    </label>
  );
}

function ShelfHeader({ title, count }: { title: string; count: string }) {
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

function EmptyArchives() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.045] bg-white/[0.012] py-20 text-[#666666]">
      <Gamepad2 size={16} strokeWidth={1.5} className="mb-3 opacity-60" />
      <p className="text-[8px] uppercase tracking-[0.22em]">
        no worlds recovered
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

      .line-clamp-1,
      .line-clamp-2 {
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