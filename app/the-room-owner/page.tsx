return (
  <main
    className={`${inter.className} min-h-screen overflow-x-hidden bg-[#d8d4d5] text-[#303035] font-light text-[13px] antialiased selection:bg-[#9aa8b8]/30 selection:text-[#202024]`}
  >
    <Background rainDrops={rainDrops} />

    {nowPlayingAudio && (
      <audio
        ref={audioRef}
        src={nowPlayingAudio}
        loop
        preload="auto"
      />
    )}

    {!hasInteracted && nowPlayingAudio && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#d8d4d5]/90 backdrop-blur-2xl">
        <div className="w-[320px] border border-white/60 bg-white/45 p-7 text-center shadow-[0_30px_80px_rgba(50,45,45,0.18)] backdrop-blur-xl">
          <CloudRain
            size={20}
            strokeWidth={1.4}
            className="mx-auto mb-5 text-[#68727d]"
          />

          <p className="mb-1 text-[8px] uppercase tracking-[0.28em] text-[#77777b]">
            welcome to
          </p>

          <h2 className="text-[18px] font-medium tracking-[-0.03em] text-[#35363b]">
            a strange house.
          </h2>

          <p className="mt-3 text-[10px] leading-relaxed text-[#77777b]">
            this space carries sound. step inside to hear the room.
          </p>

          <button
            onClick={handleEnterPage}
            className="mt-6 border border-[#7b8086]/20 bg-white/40 px-6 py-2.5 text-[8px] uppercase tracking-[0.2em] text-[#555960] transition hover:bg-white/70"
          >
            enter softly
          </button>
        </div>
      </div>
    )}

    {/* top window bar */}
    <nav className="fixed left-0 right-0 top-0 z-[60] h-[58px] border-b border-black/[0.06] bg-[#e8e3e4]/75 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#77777b] transition hover:text-[#303035]"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          leave
        </button>

        <button
          onClick={() => router.push("/")}
          className="absolute left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#44464b]">
            strange clause
          </p>
          <p className="mt-0.5 text-[7px] tracking-[0.16em] text-[#8a888b]">
            the room owner
          </p>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-black/10 bg-[#d6c2c4]" />
          <span className="h-2.5 w-2.5 rounded-full border border-black/10 bg-[#c4ccd3]" />
          <span className="h-2.5 w-2.5 rounded-full border border-black/10 bg-[#aaaeb3]" />
        </div>
      </div>
    </nav>

    {/* discord-like profile window */}
    <div className="relative z-20 mx-auto min-h-screen max-w-[1450px] px-3 pb-12 pt-[74px] md:px-8">
      <div className="grid min-h-[calc(100vh-100px)] overflow-hidden border border-black/[0.07] bg-[#e9e5e6]/75 shadow-[0_35px_100px_rgba(55,48,48,0.22)] backdrop-blur-2xl lg:grid-cols-[390px_1fr]">

        {/* ================================================= */}
        {/* LEFT PROFILE PANEL */}
        {/* ================================================= */}

        <aside className="relative border-b border-black/[0.06] bg-[#ddd9da]/70 lg:border-b-0 lg:border-r">

          {/* banner */}
          <div className="relative h-[185px] overflow-hidden bg-[#bfc7ca]">
            {profile.self_image_url ? (
              <img
                src={profile.self_image_url}
                alt=""
                className="h-full w-full object-cover opacity-75 blur-[0.2px]"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.55),transparent_30%),linear-gradient(135deg,#b9d1d7,#d9d0d0_55%,#bfcbd0)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#d8d4d5]" />

            {/* decorative stars */}
            <div className="absolute left-[18%] top-[25%] text-[22px] text-white/60">
              ✦
            </div>

            <div className="absolute right-[18%] top-[38%] text-[14px] text-white/50">
              ✧
            </div>

            <div className="absolute bottom-[14%] left-[55%] text-[25px] text-white/50">
              *
            </div>
          </div>

          {/* avatar */}
          <div className="relative px-6">
            <div className="absolute -top-[62px] left-6">
              <div className="h-[108px] w-[108px] rounded-full border-[6px] border-[#ddd9da] bg-[#c4c1c2] shadow-[0_8px_30px_rgba(40,35,35,.18)]">
                {profile.self_image_url ? (
                  <img
                    src={profile.self_image_url}
                    alt="profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#85858a]">
                    <Sparkles size={24} strokeWidth={1.3} />
                  </div>
                )}
              </div>

              <div className="absolute bottom-[2px] right-[3px] flex h-6 w-6 items-center justify-center rounded-full border-[4px] border-[#ddd9da] bg-[#7e9b8b]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* profile identity */}
            <div className="pt-[65px]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-[22px] font-semibold tracking-[-0.045em] text-[#303136]">
                    404Candle
                  </h1>

                  <p className="mt-0.5 text-[11px] text-[#77777b]">
                    strangeclause
                    <span className="mx-1.5 text-[#a1a0a2]">•</span>
                    donotexist
                  </p>
                </div>

                <span className="border border-black/[0.07] bg-white/35 px-2 py-1 text-[7px] uppercase tracking-[0.15em] text-[#85858a]">
                  {profile.page_badge}
                </span>
              </div>

              {/* action buttons */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    if (profile.discord_url) {
                      window.open(profile.discord_url, "_blank");
                    }
                  }}
                  className="flex-1 bg-[#666c75] px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white shadow-sm transition hover:bg-[#575c65]"
                >
                  message
                </button>

                <button
                  onClick={() => {
                    if (profile.spotify_url) {
                      window.open(profile.spotify_url, "_blank");
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center border border-black/[0.07] bg-white/40 text-[#62666c] transition hover:bg-white/70"
                >
                  <FaSpotify size={14} />
                </button>

                <button
                  onClick={() => {
                    if (profile.discord_url) {
                      window.open(profile.discord_url, "_blank");
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center border border-black/[0.07] bg-white/40 text-[#62666c] transition hover:bg-white/70"
                >
                  <FaDiscord size={14} />
                </button>
              </div>

              {/* bio */}
              <div className="mt-6 border-t border-black/[0.06] pt-5">
                <p className="whitespace-pre-line text-[11px] leading-[1.75] text-[#5f6065]">
                  {profile.description}
                </p>
              </div>

              {/* member info */}
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-black/[0.06] pt-5">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.18em] text-[#99979a]">
                    member since
                  </p>
                  <p className="mt-1.5 text-[10px] text-[#56575b]">
                    Jan 12, 2022
                  </p>
                </div>

                <div>
                  <p className="text-[7px] uppercase tracking-[0.18em] text-[#99979a]">
                    currently
                  </p>
                  <p className="mt-1.5 text-[10px] text-[#56575b]">
                    {isPlaying ? "listening quietly" : "somewhere quiet"}
                  </p>
                </div>
              </div>

              {/* connections */}
              <div className="mt-7 border-t border-black/[0.06] pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#747478]">
                    connections
                  </p>

                  <ArrowUpRight
                    size={11}
                    strokeWidth={1.4}
                    className="text-[#aaa8aa]"
                  />
                </div>

                <div className="space-y-2">
                  <a
                    href={profile.discord_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-black/[0.055] bg-white/25 px-3 py-2.5 transition hover:bg-white/50"
                  >
                    <div className="flex h-7 w-7 items-center justify-center bg-[#d7d3d4] text-[#66696e]">
                      <FaDiscord size={13} />
                    </div>

                    <div>
                      <p className="text-[9px] font-medium text-[#505156]">
                        discord
                      </p>
                      <p className="text-[7px] text-[#969498]">
                        ohmycouffee
                      </p>
                    </div>

                    <ArrowUpRight
                      size={10}
                      className="ml-auto text-[#aaa8aa]"
                    />
                  </a>

                  <a
                    href={profile.spotify_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-black/[0.055] bg-white/25 px-3 py-2.5 transition hover:bg-white/50"
                  >
                    <div className="flex h-7 w-7 items-center justify-center bg-[#d7d3d4] text-[#66696e]">
                      <FaSpotify size={13} />
                    </div>

                    <div>
                      <p className="text-[9px] font-medium text-[#505156]">
                        spotify
                      </p>
                      <p className="text-[7px] text-[#969498]">
                        404Candle
                      </p>
                    </div>

                    <ArrowUpRight
                      size={10}
                      className="ml-auto text-[#aaa8aa]"
                    />
                  </a>
                </div>
              </div>

              {/* usually called */}
              <div className="mt-7 border-t border-black/[0.06] pt-5">
                <p className="mb-3 text-[8px] font-medium uppercase tracking-[0.18em] text-[#747478]">
                  usually called
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {usuallyCalled.map((name) => (
                    <span
                      key={name}
                      className="border border-black/[0.055] bg-white/25 px-2.5 py-1.5 text-[8px] text-[#77767a]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* tiny player */}
              <div className="mt-7 mb-6 border border-black/[0.055] bg-white/25 p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#747981] text-white transition hover:bg-[#626870]"
                  >
                    {isPlaying ? (
                      <Pause size={10} fill="currentColor" />
                    ) : (
                      <Play
                        size={10}
                        fill="currentColor"
                        className="translate-x-[1px]"
                      />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-[8px] uppercase tracking-[0.13em] text-[#5c5d62]">
                      background melody
                    </p>
                    <p className="mt-1 truncate text-[7px] text-[#979599]">
                      {isPlaying
                        ? "playing softly"
                        : "paused in the room"}
                    </p>
                  </div>

                  {isPlaying && (
                    <Music2
                      size={13}
                      className="ml-auto animate-pulse text-[#85888d]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================= */}
        {/* RIGHT BOARD */}
        {/* ================================================= */}

        <section className="min-w-0 bg-[#eee9ea]/60">

          {/* tabs */}
          <div className="sticky top-0 z-20 border-b border-black/[0.055] bg-[#eee9ea]/85 px-6 backdrop-blur-xl md:px-8">
            <div className="flex h-[66px] items-end gap-7">
              <button className="relative h-full pt-2 text-[10px] font-medium text-[#3f4045]">
                board
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#555b63]" />
              </button>

              <button className="h-full pb-[21px] text-[10px] text-[#99979b] transition hover:text-[#5b5c61]">
                activity
              </button>

              <button className="h-full pb-[21px] text-[10px] text-[#99979b] transition hover:text-[#5b5c61]">
                wishlist
              </button>
            </div>
          </div>

          <div className="space-y-7 p-6 md:p-8">

            {/* page intro */}
            <section>
              <div className="flex items-end justify-between border-b border-black/[0.055] pb-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#9a979a]">
                    your board
                  </p>

                  <h2 className="mt-1 text-[18px] font-medium tracking-[-0.035em] text-[#414247]">
                    little things staying here.
                  </h2>
                </div>

                <Sparkles
                  size={14}
                  strokeWidth={1.3}
                  className="text-[#aaa6a8]"
                />
              </div>
            </section>

            {/* games / favorites */}
            <section className="border border-black/[0.055] bg-white/25 p-5 shadow-[0_15px_45px_rgba(55,50,50,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#515258]">
                    games i like
                  </p>

                  <p className="mt-1 text-[8px] text-[#99969a]">
                    things i keep coming back to
                  </p>
                </div>

                <button className="flex h-8 w-8 items-center justify-center border border-black/[0.06] bg-white/40 text-[#77777b] transition hover:bg-white/70">
                  +
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    title: "fisch",
                    image:
                      favoriteGames?.[0]?.image_url || "",
                  },
                  {
                    title: "valorant",
                    image:
                      favoriteGames?.[1]?.image_url || "",
                  },
                  {
                    title: "mobile legends",
                    image:
                      favoriteGames?.[2]?.image_url || "",
                  },
                  {
                    title: "roblox",
                    image:
                      favoriteGames?.[3]?.image_url || "",
                  },
                ].map((game, index) => (
                  <div
                    key={`${game.title}-${index}`}
                    className="group relative aspect-[1.15] overflow-hidden border border-black/[0.055] bg-[#d8d5d6]"
                  >
                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="h-full w-full object-cover opacity-80 grayscale-[15%] transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#99969a]">
                        <Sparkles size={18} strokeWidth={1.3} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-8">
                      <p className="text-[8px] uppercase tracking-[0.12em] text-white/90">
                        {game.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* facts */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#77757a]">
                  small details
                </p>

                <p className="text-[7px] uppercase tracking-[0.15em] text-[#aaa7aa]">
                  about the room owner
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {facts.slice(0, 4).map((fact) => (
                  <div
                    key={fact.label}
                    className="border border-black/[0.055] bg-white/25 p-4 transition hover:bg-white/40"
                  >
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#a09da0]">
                      {fact.label}
                    </p>

                    <p className="mt-2 text-[11px] leading-relaxed text-[#55565b]">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* iconic things */}
            <section>
              <div className="mb-3 border-b border-black/[0.055] pb-3">
                <p className="text-[11px] font-medium text-[#57585d]">
                  how people remember me
                </p>

                <p className="mt-1 text-[8px] text-[#a09da0]">
                  small signs
                </p>
              </div>

              <div className="border border-black/[0.055] bg-white/20">
                {iconicThings.map((item, index) => (
                  <div
                    key={item.title}
                    className="group grid gap-3 border-b border-black/[0.045] px-4 py-4 last:border-b-0 sm:grid-cols-[45px_1fr_auto] sm:items-center"
                  >
                    <span className="text-[8px] tracking-[0.12em] text-[#aaa7aa]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#68686d]">
                        {item.title}
                      </p>

                      <p className="mt-1.5 max-w-2xl text-[10.5px] leading-relaxed text-[#8a878b] transition group-hover:text-[#66666b]">
                        {item.line}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={12}
                      className="hidden text-[#b0adaf] sm:block"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* media */}
            <section>
              <div className="mb-3 border-b border-black/[0.055] pb-3">
                <p className="text-[11px] font-medium text-[#57585d]">
                  soft media
                </p>

                <p className="mt-1 text-[8px] text-[#a09da0]">
                  things kept a little private
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {/* image */}
                <div className="border border-black/[0.055] bg-white/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={12}
                        strokeWidth={1.4}
                        className="text-[#8b888b]"
                      />
                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#858286]">
                        locked portrait
                      </p>
                    </div>

                    <span className="text-[7px] uppercase tracking-[0.15em] text-[#aaa7aa]">
                      {videosUnlocked ? "open" : "private"}
                    </span>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[270px] flex-col items-center justify-center border border-dashed border-black/[0.07] bg-[#d9d5d6]/35 text-center">
                      <ImageIcon
                        size={18}
                        strokeWidth={1.3}
                        className="text-[#aaa6a8]"
                      />

                      <p className="mt-4 text-[10px] text-[#858286]">
                        this item is hidden away.
                      </p>

                      <p className="mt-1 text-[7px] uppercase tracking-[0.15em] text-[#aaa7aa]">
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
                    <div className="flex min-h-[270px] items-center justify-center border border-dashed border-black/[0.07] text-[#aaa6a8]">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                {/* videos */}
                <div className="border border-black/[0.055] bg-white/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video
                        size={12}
                        strokeWidth={1.4}
                        className="text-[#8b888b]"
                      />

                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#858286]">
                        locked tape
                      </p>
                    </div>

                    <span className="text-[7px] uppercase tracking-[0.15em] text-[#aaa7aa]">
                      {videosUnlocked ? "open" : "private"}
                    </span>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[270px] flex-col justify-center border border-dashed border-black/[0.07] bg-[#d9d5d6]/35 p-5">
                      <p className="text-[11px] text-[#858286]">
                        this fragment requires a passcode.
                      </p>

                      <div className="mt-5 flex border border-black/[0.07] bg-white/35">
                        <input
                          type="password"
                          value={videoPasswordInput}
                          onChange={(e) =>
                            setVideoPasswordInput(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") unlockVideos();
                          }}
                          placeholder="passcode"
                          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[8px] uppercase tracking-[0.16em] text-[#55565b] outline-none placeholder:text-[#aaa7aa]"
                        />

                        <button
                          type="button"
                          onClick={unlockVideos}
                          className="border-l border-black/[0.06] px-4 text-[7px] uppercase tracking-[0.15em] text-[#77757a] transition hover:bg-white/50"
                        >
                          unlock
                        </button>
                      </div>

                      {videoError && (
                        <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#b16e6e]">
                          {videoError}
                        </p>
                      )}
                    </div>
                  ) : selfVideos.length > 0 ? (
                    <div className="space-y-3">
                      {selfVideos.map((video) => (
                        <div
                          key={video.url}
                          className="border border-black/[0.06] bg-black/5 p-2"
                        >
                          <video
                            src={video.url}
                            controls
                            playsInline
                            className="max-h-[340px] w-full object-cover"
                          />

                          <p className="mt-2 px-1 text-[8px] uppercase tracking-[0.16em] text-[#858286]">
                            {video.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[270px] items-center justify-center border border-dashed border-black/[0.07] text-[8px] uppercase tracking-[0.15em] text-[#aaa7aa]">
                      no videos available
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* note */}
            <section>
              <div className="mb-3 border-b border-black/[0.055] pb-3">
                <p className="text-[11px] font-medium text-[#57585d]">
                  {profile.note_title || "not a biography"}
                </p>

                <p className="mt-1 text-[8px] text-[#a09da0]">
                  just traces
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
                <div className="border border-black/[0.055] bg-white/25 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen
                      size={13}
                      strokeWidth={1.4}
                      className="text-[#858286]"
                    />

                    <p className="text-[8px] uppercase tracking-[0.18em] text-[#858286]">
                      short note
                    </p>
                  </div>

                  <p className="whitespace-pre-line text-[11.5px] leading-[1.8] text-[#727075]">
                    {profile.note_text}
                  </p>
                </div>

                <div className="space-y-2 border border-black/[0.055] bg-white/20 p-4">
                  {floatingNotes.map((note) => (
                    <div
                      key={note}
                      className="border border-black/[0.045] bg-white/20 px-3 py-3 text-[10px] leading-relaxed text-[#858286]"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* favorites */}
            <section>
              <div className="mb-3 border-b border-black/[0.055] pb-3">
                <p className="text-[11px] font-medium text-[#57585d]">
                  favorite shelves
                </p>

                <p className="mt-1 text-[8px] text-[#a09da0]">
                  things staying here
                </p>
              </div>

              <div className="border border-black/[0.055] bg-white/20 p-5">
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

    <footer className="relative z-20 border-t border-black/[0.06] bg-[#d8d4d5]/80 px-6 py-12 text-center backdrop-blur-xl">
      <p className="mx-auto max-w-xl whitespace-pre-line text-[9px] leading-relaxed tracking-[0.12em] text-[#99969a]">
        {profile.footer_text}
      </p>
    </footer>

    <GlobalStyles />
  </main>
);
