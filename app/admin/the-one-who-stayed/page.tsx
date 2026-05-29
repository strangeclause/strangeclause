"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Image,
  Link as LinkIcon,
  MessageCircle,
  Tags,
  Settings,
  CloudRain,
  Ghost,
  Sparkles,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const STORAGE_BUCKET = "stranger-uploads";

type ProfileForm = {
  id: number;
  page_label: string;
  site_title: string;
  nav_label: string;
  badge_label: string;
  person_name: string;
  second_name: string;
  hero_subtitle: string;
  footer_text: string;
  profile_label: string;
  profile_title: string;
  quote: string;
  spotify_title: string;
  spotify_caption: string;
  spotify_embed_url: string;
  youtube_embed_url: string;
  youtube_badge: string;
  note_title: string;
  note_body: string;
  tags_title: string;
  tags_subtitle: string;
  gallery_title: string;
  socials_title: string;
};

type StatItem = {
  id?: number;
  label: string;
  value: string;
  sort_order: number;
};

type ImageItem = {
  id?: number;
  image_url: string;
  label: string;
  sort_order: number;
};

type LinkItem = {
  id?: number;
  label: string;
  href: string;
  sort_order: number;
};

type TagItem = {
  id?: number;
  label: string;
  sort_order: number;
};

type ChatItem = {
  id?: number;
  side: "left" | "right";
  text: string;
  sort_order: number;
};

type RainDrop = {
  left: string;
  delay: string;
  duration: string;
};

const defaultProfile: ProfileForm = {
  id: 1,
  page_label: "rainbow after rain",
  site_title: "strange clause",
  nav_label: "the one who stayed",
  badge_label: "junhan",
  person_name: "Jun Han",
  second_name: "준한",
  hero_subtitle:
    "someone left their coat on the chair a few minutes ago. the rain already stopped, but a soft color still stayed in the sky.",
  footer_text:
    "some colors only appear after the rain, and somehow you became one of them.",
  profile_label: "stayed profile",
  profile_title: "Xdinary Heroes",
  quote: "he talks quietly, like he doesn't want the rain to end too fast.",
  spotify_title: "after-rain playlist",
  spotify_caption: "songs that stayed after the rain",
  spotify_embed_url:
    "https://open.spotify.com/embed/artist/6T5TFWQ65VOmI3Z9A7xuvu?utm_source=generator&theme=0",
  youtube_embed_url:
    "https://www.youtube.com/embed/xg8-tPiA8QA?si=8eYjM6mJ9n0x",
  youtube_badge: "rainy guitar night",
  note_title: "note",
  note_body:
    "junhan, i think some people feel like rainy days — quiet at first, but somehow comforting when you stay a little longer. thank you for becoming one of the soft colors that stayed in my life.",
  tags_title: "things that stayed",
  tags_subtitle: "small traces",
  gallery_title: "gallery",
  socials_title: "social links",
};

const starterStats: StatItem[] = [
  { label: "birth name", value: "Han Hyung Jun · 한형준", sort_order: 1 },
  { label: "company", value: "STUDIO J · JYP Entertainment", sort_order: 2 },
  { label: "birthday", value: "August 18, 2002", sort_order: 3 },
  { label: "sound", value: "lead guitar", sort_order: 4 },
];

const starterImages: ImageItem[] = [
  { image_url: "/images/junhan1.jpg", label: "after rain", sort_order: 1 },
  { image_url: "/images/junhan2.jpg", label: "after rain", sort_order: 2 },
  { image_url: "/images/junhan3.jpg", label: "after rain", sort_order: 3 },
  { image_url: "/images/junhan4.jpg", label: "after rain", sort_order: 4 },
];

const starterLinks: LinkItem[] = [
  { label: "youtube", href: "https://www.youtube.com/@XdinaryHeroes", sort_order: 1 },
  { label: "spotify", href: "https://open.spotify.com/artist/6T5TFWQ65VOmI3Z9A7xuvu", sort_order: 2 },
  { label: "instagram", href: "https://www.instagram.com/xdinaryheroes_official/", sort_order: 3 },
  { label: "twitter", href: "https://x.com/XH_official", sort_order: 4 },
];

const starterTags = [
  "Jun Han",
  "Han Hyung Jun",
  "Lead Guitar",
  "August 18, 2002",
  "Leo",
  "170 cm",
  "Blood Type O",
  "South Korea",
  "Ulsan",
  "INTJ",
  "Quiet",
  "Soft-spoken",
  "Shy",
  "No Spicy Food",
  "Jazz",
  "Main Guitar",
  "Electric Guitar",
  "Songwriting",
  "Billie Eilish",
  "Wolf Alice",
  "Bright Red",
  "Sushi",
].map((label, index) => ({ label, sort_order: index + 1 }));

const starterChat: ChatItem[] = [
  { side: "right", text: "what do you usually listen to when it rains?", sort_order: 1 },
  { side: "left", text: "mostly guitar songs... quiet ones.", sort_order: 2 },
  { side: "right", text: "you really like rainy days, huh?", sort_order: 3 },
  { side: "left", text: "only when the rainbow stays after.", sort_order: 4 },
  { side: "right", text: "then i think today fits you well.", sort_order: 5 },
  { side: "left", text: "maybe that's why i stayed a little longer.", sort_order: 6 },
];

const sortByOrder = <T extends { sort_order: number; id?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.sort_order ?? a.id ?? 0) - (b.sort_order ?? b.id ?? 0));

export default function TheOneWhoStayedAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [stats, setStats] = useState<StatItem[]>(starterStats);
  const [images, setImages] = useState<ImageItem[]>(starterImages);
  const [links, setLinks] = useState<LinkItem[]>(starterLinks);
  const [tags, setTags] = useState<TagItem[]>(starterTags);
  const [chat, setChat] = useState<ChatItem[]>(starterChat);
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success" | "error">(
    "loading"
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

  const fetchData = useCallback(async () => {
    setStatus("loading");

    const [
      profileResult,
      statsResult,
      imagesResult,
      linksResult,
      tagsResult,
      chatResult,
    ] = await Promise.all([
      supabase.from("the_one_who_stayed_profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("the_one_who_stayed_stats").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_images").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_links").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_tags").select("*").order("sort_order", { ascending: true }),
      supabase.from("the_one_who_stayed_chat").select("*").order("sort_order", { ascending: true }),
    ]);

    if (profileResult.data) setProfile({ ...defaultProfile, ...profileResult.data });
    if (statsResult.data?.length) setStats(sortByOrder(statsResult.data));
    if (imagesResult.data?.length) setImages(sortByOrder(imagesResult.data));
    if (linksResult.data?.length) setLinks(sortByOrder(linksResult.data));
    if (tagsResult.data?.length) setTags(sortByOrder(tagsResult.data));
    if (chatResult.data?.length) setChat(sortByOrder(chatResult.data));

    setStatus("idle");
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploadTarget === null) return;

    setStatus("saving");

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `the-one-who-stayed/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

      setImages((prev) =>
        prev.map((item, index) =>
          index === uploadTarget ? { ...item, image_url: data.publicUrl } : item
        )
      );

      setStatus("idle");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
    } finally {
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const replaceTable = async <T extends object>(
    table: string,
    rows: T[],
    cleanRow: (row: T, index: number) => object | null
  ) => {
    const { error: deleteError } = await supabase.from(table).delete().neq("id", -1);
    if (deleteError) throw deleteError;

    const cleaned = rows
      .map(cleanRow)
      .filter((row): row is object => Boolean(row));

    if (cleaned.length > 0) {
      const { error: insertError } = await supabase.from(table).insert(cleaned);
      if (insertError) throw insertError;
    }
  };

  const saveAll = async () => {
    setStatus("saving");

    try {
      const { error: profileError } = await supabase
        .from("the_one_who_stayed_profile")
        .upsert({ ...profile, id: 1, updated_at: new Date().toISOString() });

      if (profileError) throw profileError;

      await replaceTable("the_one_who_stayed_stats", stats, (item, index) =>
        item.label.trim() || item.value.trim()
          ? {
              label: item.label.trim(),
              value: item.value.trim(),
              sort_order: index + 1,
            }
          : null
      );

      await replaceTable("the_one_who_stayed_images", images, (item, index) =>
        item.image_url.trim()
          ? {
              image_url: item.image_url.trim(),
              label: item.label.trim(),
              sort_order: index + 1,
            }
          : null
      );

      await replaceTable("the_one_who_stayed_links", links, (item, index) =>
        item.label.trim() && item.href.trim()
          ? {
              label: item.label.trim(),
              href: item.href.trim(),
              sort_order: index + 1,
            }
          : null
      );

      await replaceTable("the_one_who_stayed_tags", tags, (item, index) =>
        item.label.trim()
          ? {
              label: item.label.trim(),
              sort_order: index + 1,
            }
          : null
      );

      await replaceTable("the_one_who_stayed_chat", chat, (item, index) =>
        item.text.trim()
          ? {
              side: item.side,
              text: item.text.trim(),
              sort_order: index + 1,
            }
          : null
      );

      setStatus("success");
      await fetchData();
      setTimeout(() => setStatus("idle"), 1200);
    } catch (error) {
      console.error("Save error:", error);
      setStatus("error");
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020202] text-white">
        <Loader2 size={18} className="animate-spin" />
      </main>
    );
  }

  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-[#020202] text-[#b7b7b7] font-light text-[13px] antialiased selection:bg-white/10 selection:text-white`}
    >
      <AdminBackground rainDrops={rainDrops} />

      <nav className="fixed left-0 right-0 top-0 z-[60] border-b border-white/[0.045] bg-[#020202]/72 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 sm:px-8 sm:py-5 md:grid-cols-[1fr_auto_1fr] md:px-20 lg:px-28 xl:px-36">
          <button
            onClick={() => router.push("/admin")}
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
              the one who stayed
            </span>
          </button>

          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </nav>

      <div className="relative z-20 mx-auto grid max-w-[1500px] gap-6 px-6 pb-24 pt-36 sm:px-12 md:px-20 md:pt-44 lg:px-28 xl:px-36">
        <header className="animate-fade-in mb-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <CloudRain size={12} className="text-[#666666] stroke-[1.4px]" />

              <p className="text-[9px] uppercase tracking-[0.24em] text-[#666666]">
                admin / the one who stayed
              </p>
            </div>

            <h1 className="max-w-2xl text-[30px] font-light leading-[1.08] tracking-[-0.06em] text-white/90 md:text-[42px]">
              keep a person inside
              <br />
              one quiet page.
            </h1>

            <div className="flex items-center gap-2 text-[11px] italic text-[#777777]">
              <Ghost size={12} strokeWidth={1.5} />
              <span>everything here becomes the page visitors will see.</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.045] pb-3">
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#777777]">
                current page
              </p>

              <Sparkles size={12} strokeWidth={1.5} className="text-[#666666]" />
            </div>

            <p className="text-[13px] text-white/80">
              {profile.person_name || "unnamed"}
            </p>

            <p className="mt-3 text-[11px] leading-relaxed text-[#777777]">
              {images.length} images · {links.length} links · {tags.length} tags · {chat.length} chats
            </p>
          </aside>
        </header>

        {status === "error" && (
          <div className="rounded-2xl border border-white/[0.045] bg-white/[0.016] p-4 text-[11px] text-[#ffd5df]">
            something failed. check console, supabase rls, or storage policy.
          </div>
        )}

        {status === "success" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4 text-[11px] text-white/75">
            saved.
          </div>
        )}

        <AdminSection icon={<Settings size={14} />} title="main page words">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="site title" value={profile.site_title} onChange={(value) => setProfile({ ...profile, site_title: value })} />
            <Input label="small label" value={profile.page_label} onChange={(value) => setProfile({ ...profile, page_label: value })} />
            <Input label="nav label" value={profile.nav_label} onChange={(value) => setProfile({ ...profile, nav_label: value })} />
            <Input label="badge label" value={profile.badge_label} onChange={(value) => setProfile({ ...profile, badge_label: value })} />
            <Input label="main name" value={profile.person_name} onChange={(value) => setProfile({ ...profile, person_name: value })} />
            <Input label="second name" value={profile.second_name} onChange={(value) => setProfile({ ...profile, second_name: value })} />
            <Input label="profile label" value={profile.profile_label} onChange={(value) => setProfile({ ...profile, profile_label: value })} />
            <Input label="profile title" value={profile.profile_title} onChange={(value) => setProfile({ ...profile, profile_title: value })} />
            <Input label="gallery title" value={profile.gallery_title} onChange={(value) => setProfile({ ...profile, gallery_title: value })} />
            <Input label="social links title" value={profile.socials_title} onChange={(value) => setProfile({ ...profile, socials_title: value })} />
            <Input label="spotify title" value={profile.spotify_title} onChange={(value) => setProfile({ ...profile, spotify_title: value })} />
            <Input label="spotify caption" value={profile.spotify_caption} onChange={(value) => setProfile({ ...profile, spotify_caption: value })} />
            <Input label="youtube badge" value={profile.youtube_badge} onChange={(value) => setProfile({ ...profile, youtube_badge: value })} />
            <Input label="note title" value={profile.note_title} onChange={(value) => setProfile({ ...profile, note_title: value })} />
            <Input label="tags title" value={profile.tags_title} onChange={(value) => setProfile({ ...profile, tags_title: value })} />
            <Input label="tags subtitle" value={profile.tags_subtitle} onChange={(value) => setProfile({ ...profile, tags_subtitle: value })} />
          </div>

          <Textarea label="opening text" value={profile.hero_subtitle} onChange={(value) => setProfile({ ...profile, hero_subtitle: value })} />
          <Textarea label="quiet quote" value={profile.quote} onChange={(value) => setProfile({ ...profile, quote: value })} />
          <Textarea label="footer text" value={profile.footer_text} onChange={(value) => setProfile({ ...profile, footer_text: value })} />
          <Textarea label="note letter" value={profile.note_body} onChange={(value) => setProfile({ ...profile, note_body: value })} />
          <Input label="spotify embed" value={profile.spotify_embed_url} onChange={(value) => setProfile({ ...profile, spotify_embed_url: value })} />
          <Input label="youtube embed" value={profile.youtube_embed_url} onChange={(value) => setProfile({ ...profile, youtube_embed_url: value })} />
        </AdminSection>

        <AdminSection icon={<Image size={14} />} title="gallery / images">
          <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={uploadImage} />

          <div className="grid gap-3 md:grid-cols-2">
            {images.map((item, index) => (
              <div key={index} className="rounded-3xl border border-white/[0.055] bg-white/[0.016] p-3 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-24 w-16 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.label} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadTarget(index);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-[#8f8f8f]"
                  >
                    <Upload size={10} />
                    upload
                  </button>
                  <RemoveButton onClick={() => setImages(images.filter((_, i) => i !== index))} />
                </div>
                <Input label="image url" value={item.image_url} onChange={(value) => updateArray(images, setImages, index, { image_url: value })} />
                <Input label="image caption" value={item.label} onChange={(value) => updateArray(images, setImages, index, { label: value })} />
              </div>
            ))}
          </div>

          <AddButton label="add image" onClick={() => setImages([...images, { image_url: "", label: "", sort_order: images.length + 1 }])} />
        </AdminSection>

        <AdminSection icon={<LinkIcon size={14} />} title="quiet links">
          <ListEditor
            items={links}
            setItems={setLinks}
            empty={{ label: "", href: "", sort_order: links.length + 1 }}
            render={(item, index) => (
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <Input label="link name" value={item.label} onChange={(value) => updateArray(links, setLinks, index, { label: value })} />
                <Input label="link address" value={item.href} onChange={(value) => updateArray(links, setLinks, index, { href: value })} />
                <RemoveButton onClick={() => setLinks(links.filter((_, i) => i !== index))} />
              </div>
            )}
          />
        </AdminSection>

        <AdminSection icon={<Tags size={14} />} title="small tags">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {tags.map((item, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 rounded-2xl border border-white/[0.045] bg-white/[0.012] px-3 py-2"
              >
                <input
                  value={item.label}
                  onChange={(event) =>
                    updateArray(tags, setTags, index, {
                      label: event.target.value,
                    })
                  }
                  placeholder="small tag..."
                  className="w-full bg-transparent text-[10px] tracking-[0.01em] text-[#d0d0d0] outline-none placeholder:text-[#666666]"
                />

                <button
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.045] bg-black/20 text-[#666666] transition-all duration-300 hover:border-white/[0.08] hover:text-white/80"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>

          <AddButton
            label="add tag"
            onClick={() =>
              setTags([
                ...tags,
                { label: "", sort_order: tags.length + 1 },
              ])
            }
          />
        </AdminSection>

        <AdminSection icon={<Settings size={14} />} title="profile details">
          <ListEditor
            items={stats}
            setItems={setStats}
            empty={{ label: "", value: "", sort_order: stats.length + 1 }}
            render={(item, index) => (
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <Input label="detail name" value={item.label} onChange={(value) => updateArray(stats, setStats, index, { label: value })} />
                <Input label="detail value" value={item.value} onChange={(value) => updateArray(stats, setStats, index, { value: value })} />
                <RemoveButton onClick={() => setStats(stats.filter((_, i) => i !== index))} />
              </div>
            )}
          />
        </AdminSection>

        <AdminSection icon={<MessageCircle size={14} />} title="chat lines">
          <div className="grid gap-3">
            {chat.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[140px_1fr_auto]">
                <select
                  value={item.side}
                  onChange={(event) => updateArray(chat, setChat, index, { side: event.target.value as "left" | "right" })}
                  className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[#d0d0d0] outline-none"
                >
                  <option value="left">left</option>
                  <option value="right">right</option>
                </select>
                <Input label="message" value={item.text} onChange={(value) => updateArray(chat, setChat, index, { text: value })} />
                <RemoveButton onClick={() => setChat(chat.filter((_, i) => i !== index))} />
              </div>
            ))}
          </div>
          <AddButton label="add chat" onClick={() => setChat([...chat, { side: "right", text: "", sort_order: chat.length + 1 }])} />
        </AdminSection>
      </div>

      <button
        onClick={saveAll}
        disabled={status === "saving" || status === "loading"}
        className="fixed bottom-7 right-7 z-[70] flex items-center gap-2 rounded-full border border-white/[0.055] bg-[#0a0a0a]/88 px-5 py-3 text-[8px] uppercase tracking-[0.22em] text-[#d0d0d0] shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
      >
        {status === "saving" ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Send size={11} strokeWidth={1.5} />
        )}

        {status === "saving" ? "sending..." : "release"}
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


const AdminBackground = ({ rainDrops }: { rainDrops: RainDrop[] }) => (
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


const updateArray = <T extends object>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  patch: Partial<T>
) => {
  setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
};

const AdminSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl border border-white/[0.045] bg-white/[0.012] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-700 hover:border-white/[0.08] hover:bg-white/[0.018] sm:p-6">
    <div className="mb-5 flex items-center gap-2 border-b border-white/[0.045] pb-3 text-[9px] uppercase tracking-[0.22em] text-white/80">
      {icon}
      {title}
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
  <label className="block">
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

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 rounded-full border border-white/[0.045] bg-white/[0.016] px-4 py-2 text-[8px] uppercase tracking-[0.2em] text-[#8f8f8f] transition-colors hover:bg-white/[0.07]"
  >
    <Plus size={11} />
    {label}
  </button>
);

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex items-end justify-end md:items-center">
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-white/[0.045] bg-black/20 text-[#666666] transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/80"
    >
      <Trash2 size={11} />
    </button>
  </div>
);

const ListEditor = <T extends object>({
  items,
  setItems,
  empty,
  render,
}: {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  empty: T;
  render: (item: T, index: number) => React.ReactNode;
}) => (
  <>
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-white/[0.045] bg-white/[0.012] p-3">
          {render(item, index)}
        </div>
      ))}
    </div>

    <AddButton label="add item" onClick={() => setItems([...items, empty])} />
  </>
);


const GlobalStyles = () => (
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
      animation: fadeIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

      100% {
        transform: translate3d(-42px, 115vh, 0) rotate(12deg);
      }
    }
  `}</style>
);

