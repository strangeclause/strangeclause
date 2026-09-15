return (
  <main
    className={`${inter.className} min-h-screen overflow-x-hidden bg-[#f8e9ed] text-[#4b3d43] font-light text-[13px] antialiased selection:bg-[#d9aebd]/30 selection:text-[#49363e]`}
  >
    <Background rainDrops={rainDrops} />

    {/* soft decorative butterflies */}
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <div className="absolute left-[8%] top-[18%] rotate-[-15deg] text-[19px] text-[#c995aa]/45">
        🦋
      </div>

      <div className="absolute right-[10%] top-[30%] rotate-[12deg] text-[15px] text-[#c995aa]/35">
        🦋
      </div>

      <div className="absolute left-[45%] top-[10%] text-[13px] text-[#b9879d]/30">
        ❀
      </div>

      <div className="absolute right-[25%] bottom-[20%] rotate-[-10deg] text-[17px] text-[#c995aa]/30">
        ❁
      </div>

      <div className="absolute left-[5%] bottom-[12%] text-[14px] text-[#bd91a3]/30">
        ✿
      </div>
    </div>

    {nowPlayingAudio && (
      <audio
        ref={audioRef}
        src={nowPlayingAudio}
        loop
        preload="auto"
      />
    )}

    {/* enter overlay */}
    {!hasInteracted && nowPlayingAudio && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8e9ed]/90 px-5 backdrop-blur-2xl">
        <div className="relative w-[320px] overflow-hidden border border-white/70 bg-[#fff8fa]/65 p-7 text-center shadow-[0_30px_90px_rgba(174,112,137,0.18)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-5 -top-5 text-[42px] text-[#d9aabc]/25">
            ❀
          </div>

          <div className="pointer-events-none absolute -bottom-5 -left-4 rotate-[-20deg] text-[34px] text-[#d6a5b6]/20">
            🦋
          </div>

          <CloudRain
            size={20}
            strokeWidth={1.3}
            className="mx-auto mb-5 text-[#9b7181]"
          />

          <p className="mb-1 text-[8px] uppercase tracking-[0.28em] text-[#a1848e]">
            welcome to
          </p>

          <h2 className="text-[19px] font-medium tracking-[-0.03em] text-[#4d3b43]">
            a strange house.
          </h2>

          <p className="mt-3 text-[10px] leading-relaxed text-[#967c85]">
            this space carries sound. step inside to hear the room.
          </p>

          <button
            onClick={handleEnterPage}
            className="mt-6 border border-[#b8899b]/25 bg-white/50 px-6 py-2.5 text-[8px] uppercase tracking-[0.2em] text-[#775a65] transition hover:bg-white/80"
          >
            enter softly
          </button>
        </div>
      </div>
    )}

    {/* top window bar */}
    <nav className="fixed left-0 right-0 top-0 z-[60] h-[58px] border-b border-[#b8869a]/10 bg-[#fff7f9]/75 backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#957d86] transition hover:text-[#4b3d43]"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          leave
        </button>

        <button
          onClick={() => router.push("/")}
          className="absolute left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#59464e]">
            strange clause
          </p>

          <p className="mt-0.5 text-[7px] tracking-[0.16em] text-[#ae929d]">
            the room owner
          </p>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-white/70 bg-[#e4b9c7]" />
          <span className="h-2.5 w-2.5 rounded-full border border-white/70 bg-[#cdb9d9]" />
          <span className="h-2.5 w-2.5 rounded-full border border-white/70 bg-[#b9cdd0]" />
        </div>
      </div>
    </nav>

    {/* main profile window */}
    <div className="relative z-20 mx-auto min-h-screen max-w-[1450px] px-3 pb-12 pt-[74px] md:px-8">
      <div className="grid min-h-[calc(100vh-100px)] overflow-hidden border border-white/65 bg-[#fff7f9]/55 shadow-[0_35px_100px_rgba(168,111,133,0.18)] backdrop-blur-2xl lg:grid-cols-[390px_1fr]">

        {/* LEFT PROFILE PANEL */}
        <aside className="relative border-b border-[#b8869a]/10 bg-[#f9e9ed]/65 lg:border-b-0 lg:border-r">

          {/* banner */}
          <div className="relative h-[185px] overflow-hidden bg-[#edcdd7]">
            {profile.self_image_url ? (
              <img
                src={profile.self_image_url}
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_72%_20%,rgba(255,255,255,.8),transparent_28%),radial-gradient(circle_at_20%_75%,rgba(255,218,228,.7),transparent_30%),linear-gradient(135deg,#e8c6d1,#f4dfe5_55%,#d9c9df)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[#f9e9ed]" />

            {/* flowers / butterflies */}
            <div className="absolute left-[15%] top-[22%] rotate-[-12deg] text-[19px] text-white/65">
              ❀
            </div>

            <div className="absolute right-[18%] top-[35%] rotate-[12deg] text-[15px] text-white/60">
              🦋
            </div>

            <div className="absolute bottom-[15%] left-[55%] text-[20px] text-white/55">
              ✿
            </div>

            <div className="absolute right-[35%] top-[15%] text-[9px] text-white/55">
              ·
            </div>
          </div>

          {/* avatar */}
          <div className="relative px-6">
            <div className="absolute -top-[62px] left-6">
              <div className="h-[108px] w-[108px] rounded-full border-[6px] border-[#f9e9ed] bg-[#ead8dd] shadow-[0_8px_30px_rgba(130,88,103,.15)]">
                {profile.self_image_url ? (
                  <img
                    src={profile.self_image_url}
                    alt="profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#b28b99]">
                    <Sparkles size={24} strokeWidth={1.3} />
                  </div>
                )}
              </div>

              <div className="absolute bottom-[2px] right-[3px] flex h-6 w-6 items-center justify-center rounded-full border-[4px] border-[#f9e9ed] bg-[#8daa98]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* identity */}
            <div className="pt-[65px]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-[22px] font-semibold tracking-[-0.045em] text-[#493b42]">
                    404Candle
                  </h1>

                  <p className="mt-0.5 text-[11px] text-[#967e87]">
                    strangeclause
                    <span className="mx-1.5 text-[#c5a9b2]">•</span>
                    donotexist
                  </p>
                </div>

                <span className="border border-[#b8869a]/15 bg-white/45 px-2 py-1 text-[7px] uppercase tracking-[0.15em] text-[#a0838d]">
                  {profile.page_badge}
                </span>
              </div>

              {/* buttons */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    if (profile.discord_url) {
                      window.open(profile.discord_url, "_blank");
                    }
                  }}
                  className="flex-1 bg-[#ad7d8e] px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white shadow-sm transition hover:bg-[#9d6e80]"
                >
                  message
                </button>

                <button
                  onClick={() => {
                    if (profile.spotify_url) {
                      window.open(profile.spotify_url, "_blank");
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center border border-[#b8869a]/15 bg-white/50 text-[#8c6876] transition hover:bg-white/75"
                >
                  <FaSpotify size={14} />
                </button>

                <button
                  onClick={() => {
                    if (profile.discord_url) {
                      window.open(profile.discord_url, "_blank");
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center border border-[#b8869a]/15 bg-white/50 text-[#8c6876] transition hover:bg-white/75"
                >
                  <FaDiscord size={14} />
                </button>
              </div>

              {/* bio */}
              <div className="mt-6 border-t border-[#b8869a]/10 pt-5">
                <p className="whitespace-pre-line text-[11px] leading-[1.75] text-[#715d65]">
                  {profile.description}
                </p>
              </div>

              {/* member info */}
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-[#b8869a]/10 pt-5">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.18em] text-[#ae929d]">
                    member since
                  </p>

                  <p className="mt-1.5 text-[10px] text-[#67545d]">
                    Jan 12, 2022
                  </p>
                </div>

                <div>
                  <p className="text-[7px] uppercase tracking-[0.18em] text-[#ae929d]">
                    currently
                  </p>

                  <p className="mt-1.5 text-[10px] text-[#67545d]">
                    {isPlaying ? "listening quietly" : "somewhere quiet"}
                  </p>
                </div>
              </div>

              {/* connections */}
              <div className="mt-7 border-t border-[#b8869a]/10 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                    connections
                  </p>

                  <ArrowUpRight
                    size={11}
                    strokeWidth={1.4}
                    className="text-[#b69ca5]"
                  />
                </div>

                <div className="space-y-2">
                  <a
                    href={profile.discord_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-[#b8869a]/10 bg-white/35 px-3 py-2.5 transition hover:bg-white/60"
                  >
                    <div className="flex h-7 w-7 items-center justify-center bg-[#ead7dd] text-[#916d7b]">
                      <FaDiscord size={13} />
                    </div>

                    <div>
                      <p className="text-[9px] font-medium text-[#5f4d55]">
                        discord
                      </p>

                      <p className="text-[7px] text-[#aa929b]">
                        ohmycouffee
                      </p>
                    </div>

                    <ArrowUpRight
                      size={10}
                      className="ml-auto text-[#bba4ad]"
                    />
                  </a>

                  <a
                    href={profile.spotify_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-[#b8869a]/10 bg-white/35 px-3 py-2.5 transition hover:bg-white/60"
                  >
                    <div className="flex h-7 w-7 items-center justify-center bg-[#ead7dd] text-[#916d7b]">
                      <FaSpotify size={13} />
                    </div>

                    <div>
                      <p className="text-[9px] font-medium text-[#5f4d55]">
                        spotify
                      </p>

                      <p className="text-[7px] text-[#aa929b]">
                        404Candle
                      </p>
                    </div>

                    <ArrowUpRight
                      size={10}
                      className="ml-auto text-[#bba4ad]"
                    />
                  </a>
                </div>
              </div>

              {/* usually called */}
              <div className="mt-7 border-t border-[#b8869a]/10 pt-5">
                <p className="mb-3 text-[8px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                  usually called
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {usuallyCalled.map((name) => (
                    <span
                      key={name}
                      className="border border-[#b8869a]/10 bg-white/35 px-2.5 py-1.5 text-[8px] text-[#856d77]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* player */}
              <div className="mt-7 mb-6 border border-[#b8869a]/10 bg-white/35 p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ad7d8e] text-white transition hover:bg-[#9d6e80]"
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
                    <p className="truncate text-[8px] uppercase tracking-[0.13em] text-[#6d5962]">
                      background melody
                    </p>

                    <p className="mt-1 truncate text-[7px] text-[#ac949d]">
                      {isPlaying
                        ? "playing softly"
                        : "paused in the room"}
                    </p>
                  </div>

                  {isPlaying && (
                    <Music2
                      size={13}
                      className="ml-auto animate-pulse text-[#a77d8c]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT BOARD */}
        <section className="min-w-0 bg-[#fff7f9]/55">

          {/* tabs */}
          <div className="sticky top-0 z-20 border-b border-[#b8869a]/10 bg-[#fff7f9]/80 px-6 backdrop-blur-2xl md:px-8">
            <div className="flex h-[66px] items-end gap-7">
              <button className="relative h-full pt-2 text-[10px] font-medium text-[#59464e]">
                board

                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ad7d8e]" />
              </button>

              <button className="h-full pb-[21px] text-[10px] text-[#ae999f] transition hover:text-[#755d66]">
                activity
              </button>

              <button className="h-full pb-[21px] text-[10px] text-[#ae999f] transition hover:text-[#755d66]">
                wishlist
              </button>
            </div>
          </div>

          <div className="space-y-7 p-6 md:p-8">

            {/* intro */}
            <section>
              <div className="flex items-end justify-between border-b border-[#b8869a]/10 pb-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#b0969e]">
                    your board
                  </p>

                  <h2 className="mt-1 text-[18px] font-medium tracking-[-0.035em] text-[#5a484f]">
                    little things staying here.
                  </h2>
                </div>

                <Sparkles
                  size={14}
                  strokeWidth={1.3}
                  className="text-[#c09eaa]"
                />
              </div>
            </section>

            {/* games */}
            <section className="border border-white/65 bg-white/35 p-5 shadow-[0_15px_45px_rgba(168,111,133,0.055)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#67535b]">
                    games i like
                  </p>

                  <p className="mt-1 text-[8px] text-[#ad979f]">
                    things i keep coming back to
                  </p>
                </div>

                <button className="flex h-8 w-8 items-center justify-center border border-[#b8869a]/10 bg-white/45 text-[#977986] transition hover:bg-white/70">
                  +
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    title: "fisch",
                    image: favoriteGames?.[0]?.image_url || "",
                  },
                  {
                    title: "valorant",
                    image: favoriteGames?.[1]?.image_url || "",
                  },
                  {
                    title: "mobile legends",
                    image: favoriteGames?.[2]?.image_url || "",
                  },
                  {
                    title: "roblox",
                    image: favoriteGames?.[3]?.image_url || "",
                  },
                ].map((game, index) => (
                  <div
                    key={`${game.title}-${index}`}
                    className="group relative aspect-[1.15] overflow-hidden border border-white/60 bg-[#efdce2]"
                  >
                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#c09eaa]">
                        <Sparkles size={18} strokeWidth={1.3} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#553f48]/60 to-transparent p-3 pt-8">
                      <p className="text-[8px] uppercase tracking-[0.12em] text-white/95">
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
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#806b74]">
                  small details
                </p>

                <p className="text-[7px] uppercase tracking-[0.15em] text-[#b39da5]">
                  about the room owner
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {facts.slice(0, 4).map((fact) => (
                  <div
                    key={fact.label}
                    className="border border-white/55 bg-white/30 p-4 transition hover:bg-white/50"
                  >
                    <p className="text-[7px] uppercase tracking-[0.18em] text-[#b39da5]">
                      {fact.label}
                    </p>

                    <p className="mt-2 text-[11px] leading-relaxed text-[#705c64]">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* iconic things */}
            <section>
              <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                <p className="text-[11px] font-medium text-[#69555d]">
                  how people remember me
                </p>

                <p className="mt-1 text-[8px] text-[#ad979f]">
                  small signs
                </p>
              </div>

              <div className="border border-white/55 bg-white/25">
                {iconicThings.map((item, index) => (
                  <div
                    key={item.title}
                    className="group grid gap-3 border-b border-[#b8869a]/[0.07] px-4 py-4 last:border-b-0 sm:grid-cols-[45px_1fr_auto] sm:items-center"
                  >
                    <span className="text-[8px] tracking-[0.12em] text-[#b59da6]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#806872]">
                        {item.title}
                      </p>

                      <p className="mt-1.5 max-w-2xl text-[10.5px] leading-relaxed text-[#9b858d] transition group-hover:text-[#745d66]">
                        {item.line}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={12}
                      className="hidden text-[#c0a8b0] sm:block"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* media */}
            <section>
              <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                <p className="text-[11px] font-medium text-[#69555d]">
                  soft media
                </p>

                <p className="mt-1 text-[8px] text-[#ad979f]">
                  things kept a little private
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {/* image */}
                <div className="border border-white/55 bg-white/25 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={12}
                        strokeWidth={1.4}
                        className="text-[#9d7d89]"
                      />

                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#957983]">
                        locked portrait
                      </p>
                    </div>

                    <span className="text-[7px] uppercase tracking-[0.15em] text-[#b49da5]">
                      {videosUnlocked ? "open" : "private"}
                    </span>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[270px] flex-col items-center justify-center border border-dashed border-[#bd9ba8]/20 bg-[#f4e4e8]/40 text-center">
                      <ImageIcon
                        size={18}
                        strokeWidth={1.3}
                        className="text-[#c09eaa]"
                      />

                      <p className="mt-4 text-[10px] text-[#987e87]">
                        this item is hidden away.
                      </p>

                      <p className="mt-1 text-[7px] uppercase tracking-[0.15em] text-[#b9a1a9]">
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
                    <div className="flex min-h-[270px] items-center justify-center border border-dashed border-[#bd9ba8]/20 text-[#c09eaa]">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                {/* videos */}
                <div className="border border-white/55 bg-white/25 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video
                        size={12}
                        strokeWidth={1.4}
                        className="text-[#9d7d89]"
                      />

                      <p className="text-[8px] uppercase tracking-[0.17em] text-[#957983]">
                        locked tape
                      </p>
                    </div>

                    <span className="text-[7px] uppercase tracking-[0.15em] text-[#b49da5]">
                      {videosUnlocked ? "open" : "private"}
                    </span>
                  </div>

                  {!videosUnlocked ? (
                    <div className="flex min-h-[270px] flex-col justify-center border border-dashed border-[#bd9ba8]/20 bg-[#f4e4e8]/40 p-5">
                      <p className="text-[11px] text-[#987e87]">
                        this fragment requires a passcode.
                      </p>

                      <div className="mt-5 flex border border-[#bd9ba8]/15 bg-white/40">
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
                          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[8px] uppercase tracking-[0.16em] text-[#67545d] outline-none placeholder:text-[#bea6ae]"
                        />

                        <button
                          type="button"
                          onClick={unlockVideos}
                          className="border-l border-[#bd9ba8]/15 px-4 text-[7px] uppercase tracking-[0.15em] text-[#91737f] transition hover:bg-white/60"
                        >
                          unlock
                        </button>
                      </div>

                      {videoError && (
                        <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#b16e7d]">
                          {videoError}
                        </p>
                      )}
                    </div>
                  ) : selfVideos.length > 0 ? (
                    <div className="space-y-3">
                      {selfVideos.map((video) => (
                        <div
                          key={video.url}
                          className="border border-[#bd9ba8]/10 bg-[#f3e4e8]/45 p-2"
                        >
                          <video
                            src={video.url}
                            controls
                            playsInline
                            className="max-h-[340px] w-full object-cover"
                          />

                          <p className="mt-2 px-1 text-[8px] uppercase tracking-[0.16em] text-[#957983]">
                            {video.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[270px] items-center justify-center border border-dashed border-[#bd9ba8]/20 text-[8px] uppercase tracking-[0.15em] text-[#b9a1a9]">
                      no videos available
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* note */}
            <section>
              <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                <p className="text-[11px] font-medium text-[#69555d]">
                  {profile.note_title || "not a biography"}
                </p>

                <p className="mt-1 text-[8px] text-[#ad979f]">
                  just traces
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
                <div className="border border-white/55 bg-white/30 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen
                      size={13}
                      strokeWidth={1.4}
                      className="text-[#9d7d89]"
                    />

                    <p className="text-[8px] uppercase tracking-[0.18em] text-[#957983]">
                      short note
                    </p>
                  </div>

                  <p className="whitespace-pre-line text-[11.5px] leading-[1.8] text-[#7c6870]">
                    {profile.note_text}
                  </p>
                </div>

                <div className="space-y-2 border border-white/55 bg-white/25 p-4">
                  {floatingNotes.map((note) => (
                    <div
                      key={note}
                      className="border border-[#bd9ba8]/10 bg-white/25 px-3 py-3 text-[10px] leading-relaxed text-[#927b84]"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* favorites */}
            <section>
              <div className="mb-3 border-b border-[#b8869a]/10 pb-3">
                <p className="text-[11px] font-medium text-[#69555d]">
                  favorite shelves
                </p>

                <p className="mt-1 text-[8px] text-[#ad979f]">
                  things staying here
                </p>
              </div>

              <div className="border border-white/55 bg-white/25 p-5">
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

    {/* footer */}
    <footer className="relative z-20 border-t border-[#b8869a]/10 bg-[#f8e9ed]/80 px-6 py-12 text-center backdrop-blur-xl">
      <p className="mx-auto max-w-xl whitespace-pre-line text-[9px] leading-relaxed tracking-[0.12em] text-[#ad979f]">
        {profile.footer_text}
      </p>

      <div className="mt-5 flex justify-center gap-3 text-[13px] text-[#c092a3]/45">
        <span>✿</span>
        <span>♡</span>
        <span>🦋</span>
        <span>♡</span>
        <span>✿</span>
      </div>
    </footer>

    <GlobalStyles />
  </main>
);
