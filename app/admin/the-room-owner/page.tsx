"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  CloudRain,
  Sparkles,
  MessageCircle,
  Send,
  Music2,
  Image as ImageIcon,
  Video,
  Upload,
  Search,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type FavoriteSource = "music" | "movie" | "series" | "anime";

type FavoriteItem = {
  title: string;
  image_url: string;
  link: string;
  subtitle?: string;
  year?: string;
  source?: string;
};

type FavoriteApiResult = FavoriteItem & {
  api_id?: string;
};


type AboutProfile = {
  id: number;
  page_badge: string;
  title: string;
  description: string;
  footer_text: string;
  spotify_url: string;
  discord_url: string;
  audio_url: string;
  self_image_url: string;
  self_videos: { title: string; url: string }[];
  video_password: string;
  note_title: string;
  note_text: string;
  favorite_colors: { name: string; color: string }[];
  facts: { label: string; value: string }[];
  iconic_things: { title: string; line: string }[];
  floating_notes: string[];
  bubble_chats: { side: "left" | "right"; text: string }[];
  usually_called: string[];
  favorite_music: FavoriteItem[];
  favorite_movies: FavoriteItem[];
  favorite_series: FavoriteItem[];
  favorite_anime: FavoriteItem[];
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const emptyProfile: AboutProfile = {
  id: 1,
  page_badge: "thunderstorm",
  title: "mostly quiet, but not empty.",
  description: "a small page for the person who keeps this strange house open.",
  footer_text: "nothing too private, just the little things that keep showing up.",
  spotify_url: "https://open.spotify.com/",
  discord_url: "https://discord.com/",
  audio_url: "",
  self_image_url: "",
  self_videos: [],
  video_password: "163479",
  note_title: "not a biography",
  note_text:
    "i like pages that feel quiet, colors that look warm in the dark, and music that sounds like someone stayed in the room a little longer.",
  favorite_colors: [{ name: "mahogany red", color: "#6f1d1b" }],
  facts: [
    { label: "favorite mood", value: "quiet rainy night" },
    { label: "favorite color", value: "mahogany" },
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
  ],
  floating_notes: [
    "not everything needs to be loud.",
    "some things are kept because they feel warm.",
  ],
  bubble_chats: [
    { side: "right", text: "how do i usually call you?" },
    { side: "left", text: "maybe the soft name you always use." },
  ],
  usually_called: ["elsa", "kak", "room owner"],
  favorite_music: [
    {
      title: "soft music",
      image_url: "",
      link: "https://open.spotify.com/",
    },
  ],
  favorite_movies: [
    {
      title: "late night cinema",
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
      title: "quiet anime",
      image_url: "",
      link: "",
    },
  ],
};

export default function AboutMeAdminPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AboutProfile>(emptyProfile);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email = session?.user?.email || null;

      if (!email) {
        router.replace("/admin");
        setAuthLoading(false);
        return;
      }

      setUserEmail(email);
      setAuthLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;

      setUserEmail(email);

      if (!email) {
        router.replace("/admin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchProfile = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("about_me")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("failed to fetch about_me:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile({
        ...emptyProfile,
        ...data,
        favorite_colors: data.favorite_colors || [],
        facts: data.facts || [],
        iconic_things: data.iconic_things || [],
        floating_notes: data.floating_notes || [],
        bubble_chats: data.bubble_chats || emptyProfile.bubble_chats,
        usually_called: data.usually_called || emptyProfile.usually_called,
        favorite_music: data.favorite_music || emptyProfile.favorite_music,
        favorite_movies: data.favorite_movies || emptyProfile.favorite_movies,
        favorite_series: data.favorite_series || emptyProfile.favorite_series,
        favorite_anime: data.favorite_anime || emptyProfile.favorite_anime,
        audio_url: data.audio_url || emptyProfile.audio_url,
        self_image_url: data.self_image_url || emptyProfile.self_image_url,
        self_videos: data.self_videos || emptyProfile.self_videos,
        video_password: data.video_password || emptyProfile.video_password,
      });
    }

    setLoading(false);
  };

  const updateField = <K extends keyof AboutProfile>(
    key: K,
    value: AboutProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const uploadToAboutMedia = async (file: File, folder: string) => {
    const fileExt = file.name.split(".").pop() || "file";
    const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("about-media")
      .upload(fileName, file, { upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("about-media").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleAudioUpload = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingKey("audio");
      const publicUrl = await uploadToAboutMedia(file, "audio");
      updateField("audio_url", publicUrl);
    } catch (error) {
      console.error("failed to upload audio:", error);
      alert("failed to upload audio");
    } finally {
      setUploadingKey("");
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingKey("image");
      const publicUrl = await uploadToAboutMedia(file, "images");
      updateField("self_image_url", publicUrl);
    } catch (error) {
      console.error("failed to upload image:", error);
      alert("failed to upload image");
    } finally {
      setUploadingKey("");
    }
  };

  const handleVideoUpload = async (file: File | undefined, index: number) => {
    if (!file) return;

    try {
      setUploadingKey(`video-${index}`);
      const publicUrl = await uploadToAboutMedia(file, "videos");
      const next = [...profile.self_videos];
      next[index] = { ...next[index], url: publicUrl };
      updateField("self_videos", next);
    } catch (error) {
      console.error("failed to upload video:", error);
      alert("failed to upload video");
    } finally {
      setUploadingKey("");
    }
  };

  const saveProfile = async () => {
    setSaving(true);

    const payload = {
      page_badge: profile.page_badge,
      title: profile.title,
      description: profile.description,
      footer_text: profile.footer_text,
      spotify_url: profile.spotify_url,
      discord_url: profile.discord_url,
      audio_url: profile.audio_url,
      self_image_url: profile.self_image_url,
      self_videos: profile.self_videos,
      video_password: profile.video_password,
      note_title: profile.note_title,
      note_text: profile.note_text,
      favorite_colors: profile.favorite_colors,
      facts: profile.facts,
      iconic_things: profile.iconic_things,
      floating_notes: profile.floating_notes,
      bubble_chats: profile.bubble_chats,
      usually_called: profile.usually_called,
      favorite_music: profile.favorite_music,
      favorite_movies: profile.favorite_movies,
      favorite_series: profile.favorite_series,
      favorite_anime: profile.favorite_anime,
    };

    const { error } = await supabase
      .from("about_me")
      .update(payload)
      .eq("id", profile.id);

    if (error) console.error("failed to save about_me:", error);

    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <main
        className={`${inter.className} flex min-h-screen items-center justify-center bg-[#020202] text-[#666666]`}
      >
        <Loader2 size={16} className="animate-spin" />
      </main>
    );
  }

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#aaaaaa] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <Background rainDrops={rainDrops} />

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
            onClick={() => router.push("/about-me")}
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

      <div className="relative z-20 mx-auto grid max-w-[1500px] gap-6 px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-4 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / the room owner
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              change the quiet
              <br />
              little profile.
            </h1>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:border-white/[0.08] hover:bg-white/[0.018]">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                status
              </p>

              <Sparkles size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {profile.title || "untitled"}
            </p>

            <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              {profile.facts.length} facts · {profile.iconic_things.length} iconic lines · {profile.usually_called.length} names · {profile.bubble_chats.length} chats
            </p>
          </aside>
        </header>

        <AdminSection title="main words">
          <Input label="page badge" value={profile.page_badge} onChange={(value) => updateField("page_badge", value)} />
          <Textarea label="title" value={profile.title} onChange={(value) => updateField("title", value)} />
          <Textarea label="description" value={profile.description} onChange={(value) => updateField("description", value)} />
          <Textarea label="footer text" value={profile.footer_text} onChange={(value) => updateField("footer_text", value)} />
        </AdminSection>

        <AdminSection title="links and media">
          <Input
            label="spotify url"
            value={profile.spotify_url}
            onChange={(value) => updateField("spotify_url", value)}
          />

          <Input
            label="discord url"
            value={profile.discord_url}
            onChange={(value) => updateField("discord_url", value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <UploadInputCard
              icon="music"
              title="page audio"
              subtitle="upload mp3 / wav / m4a for now playing"
              value={profile.audio_url}
              placeholder="audio url"
              accept="audio/*"
              uploading={uploadingKey === "audio"}
              onUpload={(file) => handleAudioUpload(file)}
              onChange={(value) => updateField("audio_url", value)}
            />

            <UploadInputCard
              icon="image"
              title="locked image"
              subtitle="upload image hidden behind password"
              value={profile.self_image_url}
              placeholder="image url"
              accept="image/*"
              uploading={uploadingKey === "image"}
              onUpload={(file) => handleImageUpload(file)}
              onChange={(value) => updateField("self_image_url", value)}
            />
          </div>

          <Input
            label="media password"
            value={profile.video_password}
            onChange={(value) => updateField("video_password", value)}
          />

          <div className="rounded-3xl border border-white/[0.045] bg-white/[0.01] p-4">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/[0.045] pb-3">
              <div className="flex items-center gap-2">
                <Video size={11} strokeWidth={1.5} className="text-[#777777]" />
                <p className="text-[8px] uppercase tracking-[0.22em] text-white/75">
                  locked videos
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField("self_videos", [
                    ...profile.self_videos,
                    { title: "", url: "" },
                  ])
                }
                className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
              >
                add
              </button>
            </div>

            <div className="grid gap-3">
              {profile.self_videos.map((video, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.016] p-3 md:grid-cols-[1fr_1.5fr_40px]"
                >
                  <Input
                    label="video title"
                    value={video.title}
                    onChange={(value) => {
                      const next = [...profile.self_videos];
                      next[index] = { ...next[index], title: value };
                      updateField("self_videos", next);
                    }}
                  />

                  <div className="space-y-3">
                    <Input
                      label="video url"
                      value={video.url}
                      onChange={(value) => {
                        const next = [...profile.self_videos];
                        next[index] = { ...next[index], url: value };
                        updateField("self_videos", next);
                      }}
                    />

                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/[0.055] bg-black/25 px-4 py-3 transition-all duration-700 hover:border-white/15 hover:bg-white/[0.035]">
                      <div>
                        <p className="text-[7px] uppercase tracking-[0.18em] text-[#777777]">
                          {uploadingKey === `video-${index}` ? "uploading" : "upload video"}
                        </p>
                        <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-[#555555]">
                          mp4 / mov / webm
                        </p>
                      </div>

                      {uploadingKey === `video-${index}` ? (
                        <Loader2 size={13} className="animate-spin text-[#777777]" />
                      ) : (
                        <Upload size={13} className="text-[#777777]" />
                      )}

                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={(event) =>
                          handleVideoUpload(event.target.files?.[0], index)
                        }
                      />
                    </label>

                    {video.url && (
                      <video
                        src={video.url}
                        controls
                        className="max-h-[180px] w-full rounded-2xl border border-white/[0.045] bg-black object-cover opacity-75 grayscale"
                      />
                    )}
                  </div>

                  <RemoveButton
                    onClick={() =>
                      updateField(
                        "self_videos",
                        profile.self_videos.filter((_, i) => i !== index)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </AdminSection>

        <AdminSection title="bubble chat">
          <div className="grid gap-3">
            {profile.bubble_chats.map((chat, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl md:grid-cols-[130px_1fr_40px]"
              >
                <label className="block">
                  <span className="mb-2 block text-[7px] uppercase tracking-[0.18em] text-[#666666]">
                    side
                  </span>

                  <select
                    value={chat.side}
                    onChange={(event) => {
                      const next = [...profile.bubble_chats];
                      next[index] = {
                        ...next[index],
                        side: event.target.value as "left" | "right",
                      };
                      updateField("bubble_chats", next);
                    }}
                    className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[#d0d0d0] outline-none transition-all duration-700 focus:border-white/15 focus:bg-white/[0.035]"
                  >
                    <option value="left" className="bg-[#070707]">
                      left
                    </option>
                    <option value="right" className="bg-[#070707]">
                      right
                    </option>
                  </select>
                </label>

                <Input
                  label="bubble text"
                  value={chat.text}
                  onChange={(value) => {
                    const next = [...profile.bubble_chats];
                    next[index] = { ...next[index], text: value };
                    updateField("bubble_chats", next);
                  }}
                />

                <RemoveButton
                  onClick={() =>
                    updateField(
                      "bubble_chats",
                      profile.bubble_chats.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))}
          </div>

          <AddButton
            label="add bubble"
            onClick={() =>
              updateField("bubble_chats", [
                ...profile.bubble_chats,
                { side: "right", text: "" },
              ])
            }
          />
        </AdminSection>

        <AdminSection title="how i am usually called">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {profile.usually_called.map((name, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-full border border-white/[0.055] bg-white/[0.018] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <input
                  value={name}
                  onChange={(event) => {
                    const next = [...profile.usually_called];
                    next[index] = event.target.value;
                    updateField("usually_called", next);
                  }}
                  placeholder="name..."
                  className="w-full bg-transparent text-[10px] uppercase tracking-[0.16em] text-[#d0d0d0] outline-none placeholder:text-[#666666]"
                />

                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "usually_called",
                      profile.usually_called.filter((_, i) => i !== index)
                    )
                  }
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.055] bg-black/20 text-[#666666] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>

          <AddButton
            label="add name"
            onClick={() =>
              updateField("usually_called", [...profile.usually_called, ""])
            }
          />
        </AdminSection>

        <AdminSection title="favorite shelves">
          <FavoriteShelf
            title="fav music"
            source="music"
            items={profile.favorite_music}
            onChange={(items) => updateField("favorite_music", items)}
          />

          <FavoriteShelf
            title="fav movie"
            source="movie"
            items={profile.favorite_movies}
            onChange={(items) => updateField("favorite_movies", items)}
          />

          <FavoriteShelf
            title="fav series"
            source="series"
            items={profile.favorite_series}
            onChange={(items) => updateField("favorite_series", items)}
          />

          <FavoriteShelf
            title="fav anime"
            source="anime"
            items={profile.favorite_anime}
            onChange={(items) => updateField("favorite_anime", items)}
          />
        </AdminSection>

        <AdminSection title="favorite colors">
          <div className="grid gap-3 md:grid-cols-2">
            {profile.favorite_colors.map((color, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl md:grid-cols-[1fr_130px_40px]"
              >
                <Input
                  label="name"
                  value={color.name}
                  onChange={(value) => {
                    const next = [...profile.favorite_colors];
                    next[index] = { ...next[index], name: value };
                    updateField("favorite_colors", next);
                  }}
                />

                <Input
                  label="color"
                  value={color.color}
                  onChange={(value) => {
                    const next = [...profile.favorite_colors];
                    next[index] = { ...next[index], color: value };
                    updateField("favorite_colors", next);
                  }}
                />

                <RemoveButton
                  onClick={() =>
                    updateField(
                      "favorite_colors",
                      profile.favorite_colors.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))}
          </div>

          <AddButton
            label="add color"
            onClick={() =>
              updateField("favorite_colors", [
                ...profile.favorite_colors,
                { name: "", color: "#6f1d1b" },
              ])
            }
          />
        </AdminSection>

        <AdminSection title="tiny facts">
          <div className="grid gap-3 md:grid-cols-2">
            {profile.facts.map((fact, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl md:grid-cols-[1fr_1fr_40px]"
              >
                <Input
                  label="label"
                  value={fact.label}
                  onChange={(value) => {
                    const next = [...profile.facts];
                    next[index] = { ...next[index], label: value };
                    updateField("facts", next);
                  }}
                />

                <Input
                  label="value"
                  value={fact.value}
                  onChange={(value) => {
                    const next = [...profile.facts];
                    next[index] = { ...next[index], value };
                    updateField("facts", next);
                  }}
                />

                <RemoveButton
                  onClick={() =>
                    updateField(
                      "facts",
                      profile.facts.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))}
          </div>

          <AddButton
            label="add fact"
            onClick={() =>
              updateField("facts", [
                ...profile.facts,
                { label: "", value: "" },
              ])
            }
          />
        </AdminSection>

        <AdminSection title="how people remember me">
          <div className="grid gap-3">
            {profile.iconic_things.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl md:grid-cols-[1fr_2fr_40px]"
              >
                <Input
                  label="title"
                  value={item.title}
                  onChange={(value) => {
                    const next = [...profile.iconic_things];
                    next[index] = { ...next[index], title: value };
                    updateField("iconic_things", next);
                  }}
                />

                <Input
                  label="line"
                  value={item.line}
                  onChange={(value) => {
                    const next = [...profile.iconic_things];
                    next[index] = { ...next[index], line: value };
                    updateField("iconic_things", next);
                  }}
                />

                <RemoveButton
                  onClick={() =>
                    updateField(
                      "iconic_things",
                      profile.iconic_things.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))}
          </div>

          <AddButton
            label="add iconic line"
            onClick={() =>
              updateField("iconic_things", [
                ...profile.iconic_things,
                { title: "", line: "" },
              ])
            }
          />
        </AdminSection>

        <AdminSection title="note">
          <Input label="note title" value={profile.note_title} onChange={(value) => updateField("note_title", value)} />
          <Textarea label="note text" value={profile.note_text} onChange={(value) => updateField("note_text", value)} />

          <div className="grid gap-3 md:grid-cols-2">
            {profile.floating_notes.map((note, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl"
              >
                <Input
                  label="small note"
                  value={note}
                  onChange={(value) => {
                    const next = [...profile.floating_notes];
                    next[index] = value;
                    updateField("floating_notes", next);
                  }}
                />

                <RemoveButton
                  onClick={() =>
                    updateField(
                      "floating_notes",
                      profile.floating_notes.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))}
          </div>

          <AddButton
            label="add note"
            onClick={() =>
              updateField("floating_notes", [...profile.floating_notes, ""])
            }
          />
        </AdminSection>
      </div>

      <button
        onClick={saveProfile}
        disabled={saving || !!uploadingKey}
        className="fixed bottom-7 right-7 z-[70] flex items-center gap-2 rounded-full border border-white/[0.055] bg-[#0a0a0a]/88 px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#d0d0d0] shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
      >
        {saving ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Send size={11} strokeWidth={1.5} />
        )}

        {saving ? "sending..." : "release"}
      </button>

      <footer className="relative z-20 border-t border-white/[0.045] bg-[#020202]/90 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
        <p className="mx-auto max-w-xl text-[10.5px] leading-relaxed tracking-[0.12em] text-[#555555]">
          {profile.footer_text}
        </p>
      </footer>

      <GlobalStyles />
    </main>
  );
}

const UploadInputCard = ({
  icon,
  title,
  subtitle,
  value,
  placeholder,
  accept,
  uploading,
  onUpload,
  onChange,
}: {
  icon: "music" | "image";
  title: string;
  subtitle: string;
  value: string;
  placeholder: string;
  accept: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onChange: (value: string) => void;
}) => (
  <div className="rounded-3xl border border-white/[0.045] bg-white/[0.01] p-4">
    <div className="mb-3 flex items-center gap-2 border-b border-white/[0.045] pb-3">
      {icon === "music" ? (
        <Music2 size={11} strokeWidth={1.5} className="text-[#777777]" />
      ) : (
        <ImageIcon size={11} strokeWidth={1.5} className="text-[#777777]" />
      )}

      <div>
        <p className="text-[8px] uppercase tracking-[0.22em] text-white/75">
          {title}
        </p>
        <p className="mt-1 text-[7px] uppercase tracking-[0.14em] text-[#555555]">
          {subtitle}
        </p>
      </div>
    </div>

    <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/[0.055] bg-black/25 px-4 py-3 transition-all duration-700 hover:border-white/15 hover:bg-white/[0.035]">
      <div>
        <p className="text-[7px] uppercase tracking-[0.18em] text-[#777777]">
          {uploading ? "uploading" : "upload file"}
        </p>
        <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-[#555555]">
          {accept.replace("/*", "")}
        </p>
      </div>

      {uploading ? (
        <Loader2 size={13} className="animate-spin text-[#777777]" />
      ) : (
        <Upload size={13} className="text-[#777777]" />
      )}

      <input
        type="file"
        hidden
        accept={accept}
        onChange={(event) => onUpload(event.target.files?.[0])}
      />
    </label>

    <input
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-white/[0.08] bg-transparent py-2 text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0] outline-none placeholder:text-[#555555] focus:border-white/20"
    />

    {value && icon === "image" && (
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.045] bg-black/25">
        <img
          src={value}
          alt={title}
          className="max-h-[180px] w-full object-cover grayscale opacity-75"
        />
      </div>
    )}

    {value && icon === "music" && (
      <audio src={value} controls className="mt-3 w-full opacity-70 grayscale" />
    )}
  </div>
);

const AdminSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:border-white/[0.08] hover:bg-white/[0.018] sm:p-6">
    <div className="mb-5 border-b border-white/[0.045] pb-3">
      <p className="text-[9px] uppercase tracking-[0.22em] text-white/80">
        {title}
      </p>
    </div>

    <div className="space-y-4">{children}</div>
  </section>
);

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block w-full">
    <span className="mb-2 block text-[7px] uppercase tracking-[0.18em] text-[#666666]">
      {label}
    </span>

    <input
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[11px] text-[#d0d0d0] outline-none transition-all duration-700 placeholder:text-[#666666] focus:border-white/15 focus:bg-white/[0.035]"
    />
  </label>
);

const Textarea = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-[7px] uppercase tracking-[0.18em] text-[#666666]">
      {label}
    </span>

    <textarea
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="h-28 w-full resize-none rounded-2xl border border-white/[0.055] bg-white/[0.025] px-4 py-3 text-[11px] leading-relaxed text-[#d0d0d0] outline-none transition-all duration-700 placeholder:text-[#666666] focus:border-white/15 focus:bg-white/[0.035]"
    />
  </label>
);

const AddButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-4 py-2 text-[8px] uppercase tracking-[0.2em] text-[#777777] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
  >
    <Plus size={11} />
    {label}
  </button>
);

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.055] bg-white/[0.025] text-[#666666] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-700 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
  >
    <Trash2 size={11} />
  </button>
);

const TMDB_API_KEY = "8d314751e43387fa2ea52b62958d2ef9";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";

const getCleanArtwork = (url?: string) => {
  if (!url) return "";
  return url
    .replace("100x100bb.jpg", "600x600bb.jpg")
    .replace("100x100bb.png", "600x600bb.png")
    .replace("100x100", "600x600");
};

const normalizeYear = (value?: string | null) => {
  if (!value) return "";
  return String(value).slice(0, 4);
};

const getTmdbImage = (path?: string | null) => {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}${path}`;
};

const getTmdbTitle = (item: any, source: FavoriteSource) => {
  if (source === "series") {
    return item.name || item.original_name || "untitled series";
  }

  return item.title || item.original_title || "untitled movie";
};

const getTmdbDate = (item: any, source: FavoriteSource) => {
  if (source === "series") {
    return item.first_air_date || "";
  }

  return item.release_date || "";
};

const searchTmdbItems = async (
  source: "movie" | "series",
  query: string
): Promise<FavoriteApiResult[]> => {
  const mediaType = source === "series" ? "tv" : "movie";
  const response = await fetch(
    `https://api.themoviedb.org/3/search/${mediaType}?query=${encodeURIComponent(
      query
    )}&api_key=${TMDB_API_KEY}&include_adult=false&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error("tmdb search failed");
  }

  const payload = await response.json();

  return (payload.results || []).slice(0, 12).map((item: any) => {
    const title = getTmdbTitle(item, source);
    const year = normalizeYear(getTmdbDate(item, source));
    const rating =
      typeof item.vote_average === "number" && item.vote_average > 0
        ? `tmdb ${item.vote_average.toFixed(1)}`
        : source === "series"
        ? "series / drama"
        : "movie";

    return {
      api_id: String(item.id || `${source}-${title}`),
      title,
      subtitle: rating,
      year,
      image_url: getTmdbImage(item.poster_path || item.backdrop_path),
      link: `https://www.themoviedb.org/${mediaType}/${item.id}`,
      source: source === "series" ? "tmdb tv" : "tmdb movie",
    };
  });
};

const searchFavoriteItems = async (
  source: FavoriteSource,
  query: string
): Promise<FavoriteApiResult[]> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (source === "movie" || source === "series") {
    return searchTmdbItems(source, cleanQuery);
  }

  if (source === "anime") {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanQuery)}&limit=8&sfw=true`
    );
    const payload = await response.json();

    return (payload.data || []).map((item: any) => ({
      api_id: String(item.mal_id || item.url || item.title),
      title: item.title_english || item.title || item.title_japanese || "untitled anime",
      subtitle: item.type || item.status || "anime",
      year: normalizeYear(item.aired?.from),
      image_url: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || "",
      link: item.url || "",
      source: "jikan",
    }));
  }

  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=8`
  );
  const payload = await response.json();

  return (payload.results || []).map((item: any) => ({
    api_id: String(item.trackId || item.collectionId || item.trackViewUrl || item.trackName),
    title: item.trackName || item.collectionName || "untitled",
    subtitle: item.artistName || "music",
    year: normalizeYear(item.releaseDate),
    image_url: getCleanArtwork(item.artworkUrl100 || item.artworkUrl600),
    link: item.trackViewUrl || item.collectionViewUrl || "",
    source: "itunes",
  }));
};

const FavoriteShelf = ({
  title,
  source,
  items,
  onChange,
}: {
  title: string;
  source: FavoriteSource;
  items: FavoriteItem[];
  onChange: (items: FavoriteItem[]) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FavoriteApiResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const runSearch = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError("");
      const nextResults = await searchFavoriteItems(source, query);
      setResults(nextResults);

      if (!nextResults.length) {
        setError("nothing found from the public shelf");
      }
    } catch (apiError) {
      console.error("failed to search favorite:", apiError);
      setError("failed to reach the public shelf");
    } finally {
      setSearching(false);
    }
  };

  const addFromApi = (item: FavoriteApiResult) => {
    const exists = items.some(
      (saved) => saved.title === item.title && saved.link === item.link
    );

    if (exists) return;

    onChange([
      ...items,
      {
        title: item.title,
        subtitle: item.subtitle || "",
        year: item.year || "",
        image_url: item.image_url || "",
        link: item.link || "",
        source: item.source || source,
      },
    ]);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/[0.045] bg-white/[0.01] p-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.045] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={11} strokeWidth={1.5} className="text-[#777777]" />
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/75">
              {title}
            </p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.14em] text-[#555555]">
              search from api, then save to supabase
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange([...items, { title: "", image_url: "", link: "", subtitle: "", year: "", source: "manual" }])
          }
          className="rounded-full border border-white/[0.055] bg-white/[0.025] px-3 py-1.5 text-[7px] uppercase tracking-[0.18em] text-[#777777] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
        >
          manual
        </button>
      </div>

      <div className="rounded-3xl border border-white/[0.045] bg-black/20 p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.018] px-4 py-3">
            <Search size={12} strokeWidth={1.5} className="shrink-0 text-[#666666]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch();
              }}
              placeholder={`search ${source}...`}
              className="min-w-0 flex-1 bg-transparent text-[9px] uppercase tracking-[0.16em] text-[#d0d0d0] outline-none placeholder:text-[#555555]"
            />
          </div>

          <button
            type="button"
            onClick={runSearch}
            disabled={searching || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.025] px-5 py-3 text-[8px] uppercase tracking-[0.2em] text-[#888888] transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
          >
            {searching ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
            find
          </button>
        </div>

        {error && (
          <p className="mt-3 text-[8px] uppercase tracking-[0.16em] text-[#777777]">
            {error}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {results.map((item) => (
              <button
                type="button"
                key={`${item.api_id}-${item.title}`}
                onClick={() => addFromApi(item)}
                className="group overflow-hidden rounded-3xl border border-white/[0.055] bg-white/[0.016] text-left shadow-[0_12px_34px_rgba(0,0,0,0.42)] transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.03]"
              >
                <div className="relative aspect-square bg-black/40">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover grayscale opacity-55 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#444444]">
                      <MessageCircle size={18} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-[8px] uppercase tracking-[0.14em] text-white/85">
                    {item.title}
                  </p>
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-1 text-[7px] uppercase tracking-[0.14em] text-[#777777]">
                    {item.subtitle || source}
                  </p>
                  {item.year && (
                    <p className="text-[7px] uppercase tracking-[0.14em] text-[#555555]">
                      {item.year}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.03]"
          >
            <div className="absolute inset-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover grayscale opacity-45 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#444444]">
                  <MessageCircle size={18} strokeWidth={1.5} />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
            </div>

            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-black/60 text-[#777777] opacity-100 transition-all duration-700 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={10} />
            </button>

            <div className="absolute bottom-3 left-3 right-3 z-20 space-y-2">
              <input
                value={item.title}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...next[index], title: event.target.value };
                  onChange(next);
                }}
                placeholder="title"
                className="w-full border-b border-white/[0.08] bg-transparent py-1 text-[8px] uppercase tracking-[0.16em] text-white outline-none placeholder:text-[#777777] focus:border-white/20"
              />

              <input
                value={item.subtitle || ""}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...next[index], subtitle: event.target.value };
                  onChange(next);
                }}
                placeholder="subtitle"
                className="w-full border-b border-white/[0.06] bg-transparent py-1 text-[7px] uppercase tracking-[0.14em] text-[#9a9a9a] outline-none placeholder:text-[#555555] focus:border-white/15"
              />

              <input
                value={item.image_url}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...next[index], image_url: event.target.value };
                  onChange(next);
                }}
                placeholder="image url"
                className="w-full border-b border-white/[0.06] bg-transparent py-1 text-[7px] uppercase tracking-[0.14em] text-[#9a9a9a] outline-none placeholder:text-[#555555] focus:border-white/15"
              />

              <input
                value={item.link}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...next[index], link: event.target.value };
                  onChange(next);
                }}
                placeholder="link"
                className="w-full border-b border-white/[0.06] bg-transparent py-1 text-[7px] uppercase tracking-[0.14em] text-[#9a9a9a] outline-none placeholder:text-[#555555] focus:border-white/15"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Background({ rainDrops }: { rainDrops: RainDrop[] }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.028),transparent_42%),radial-gradient(circle_at_8%_42%,rgba(127,29,29,0.06),transparent_34%),radial-gradient(circle_at_92%_70%,rgba(161,98,7,0.05),transparent_32%),linear-gradient(180deg,#020202_0%,#050505_46%,#020202_100%)]" />

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

      .rain-container {
        position: fixed;
        inset: 0;
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
