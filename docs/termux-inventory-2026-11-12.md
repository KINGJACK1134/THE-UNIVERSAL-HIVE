# Termux Inventory — Galaxy A15 5G (SM-A156U) — 2026-11-12

Run: 2026-11-12 07:59 UTC, from `~/termux-inventory.txt` on the phone (2,463 lines, 80K).
Pasted by Jack into the Developer side chat. Raw file lives on the phone and in the chat
transcript; this record is the structured Hive copy. No secret contents were collected:
`.ssh` and secret-looking files are names only, git remotes were redacted of embedded
credentials by the inventory script.

## Device

- Termux: googleplay.2026.10.09, termux-tools 3.0.9, aarch64, all packages up to date
- Android 16, kernel 5.15.189-android13-8, Samsung SM-A156U
- Subscribed repos: termux.net + nohajc.github.io

## Storage — HEADLINE: root filesystem 100% FULL

```
/dev/block/dm-7  6.6G  6.6G  0  100%  /   <-- ZERO bytes free
SD card /mnt/media_rw/4CFC-8D04: 118G, 19G used, 99G free (16%)
```

The phone's internal app space is completely full. The 118G SD card (99G free) is the
relief valve. Nothing new can install or run cleanly until weight moves off `/`.

Installed Android apps visible in mounts (asec): Termux:API, OpenCode (cc.agentlabs.opencode),
Shizuku-adjacent tools (rosan.dhizuku), F-Droid, WhatsApp, X/Twitter, Cloudflare One agent,
and `app.scammersnightmarescamshield.android` (his ScamShield Android build).

## Home top-level sizes (full list)

```
1.4G  KRACKERJACK-Hive-Grok-CLI
1.3G  go
943M  arch
714M  .local
637M  llama.cpp
332M  sdk
317M  models
197M  .opencode
193M  groks fuck ups
169M  anything-llm
121M  downloads
116M  node_modules
108M  snoop
93M   TermuxArch
88M   .bun
75M   lobster
72M   gentoo-termux
44M   .cpan
37M   packages
26M   x11-packages
18M   SocialBox-Termux
13M   Termux-Root-Recovery-Tool
12M   ~
11M   trape
7.9M  hive-video-engine
6.5M  hive-video-studio-android.zip
3.1M  AdminHack
1.6M  root-packages
1.6M  T-Header
1.2M  termux-shizuku-tools
1.2M  scripts
1.2M  root
1.2M  XAttacker
858K  TermuxAm
819K  ParamSpider
738K  aria-termux
457K  THE-HIVE-OS
260K  ipdrone
256K  ReverseAPK
151K  ndk-patches
93K   .config
92K   package-lock.json
78K   .pm2
59K   src
48K   yarn.lock
40K   build-package.sh
36K   .llama-app
25K   KRACKERJACK
24K   public
20K   .python_history
20K   .node_repl_history
16K   .bash_history
16K   .android
12K   .ssh
12K   .expo
12K   .aria
11K   .grok
8.0K  kd,x,ds
7.5K  yt-dlp, jackschitt-llm, hive, bin, .termux
4.0K  loose files: wfdinstall(.1), vite.config.ts, tsconfig*.json,
      termux-inventory.txt, startgentoo.sh, package.json, ngrok.log, ksjk',
      index.html, hive-termux-cleanup.sh, hive-core.ts, eslint.config.js,
      clean.sh, app.log, _gitignore, Setup.sh, README.md, .yarnrc,
      .wget-hsts, .lesshst, .gitconfig, .bashrc
3.5K  storage, result-checking, krackerjack, gentoo-fs, gentoo-binds,
      backup_1779787638, backup_1779787294, backup_1779786945,
      COMBO MOFO, .yt-dlp, .suroot, .npm, .cache
0     {, coax, Python, C, **Support, **OpenRC**.*, **Build, **Action:
```

## Notable contents (from depth-2 tree)

- `KRACKERJACK/` — exports, incoming, notes, projects, scripts, work (his working desk)
- `KRACKERJACK-Hive-Grok-CLI/` — grok-cli fork + his additions (commander-hive.js, hive/, hive.html)
- `THE-HIVE-OS/` — hive-init.c, hive-shell.c, hive-personality.c/.h, pam_hive.c/.h, overlay/ (HIS repo)
- `gentoo-termux/` — stage3-arm64-openrc-20260531T234604Z.tar.xz + gentoo.sh + startgentoo.sh
- `arch/` — live ArchLinuxARM rootfs (etc, home, root, usr, var) + startarch + tarball
- `hive-video-engine/` — app.py, frames.py, stitch.py, story.py, hive_db.py, renderer/, static/
- `downloads/` — grokschitt_agent.py, opencode-termux-main.zip, Superconductor AppImage (x86_64 — dead weight on ARM)
- `models/` — Llama-3.2-1B-Instruct-Q8_0.gguf (316M) + partial `.1` (224K)
- `.ssh/` — id_ed25519 + id_ed25519.pub (Nov 6 ADMIN keypair, intact)
- `.config/` — aichat, amass, katana, subfinder, termux
- `.pm2/` — pm2 running (logs, pids, sockets)
- Junk/accidental: zero-byte files named `**Action:`, `**Build`, `**OpenRC**.*`, `**Support`, `C`, `Python`, `{`, `coax`, `kd,x,ds`, `ksjk'` (paste accidents, Sep 22 / Oct 6)

## Git repos (25) — status at inventory time

| Repo | Remote | Local state |
|---|---|---|
| snoop | snooppr/snoop | clean |
| ParamSpider | devanshbatham/ParamSpider | clean |
| T-Header | remo7777/T-Header | clean |
| KRACKERJACK-Hive-Grok-CLI | superagent-ai/grok-cli | MODIFIED .env.example; UNTRACKED commander-hive.js, hive/, hive.html, index.html |
| ReverseAPK | 1N3/ReverseAPK | clean |
| termux-shizuku-tools | AlexeiCrystal/termux-shizuku-tools | clean |
| TermuxArch | SDRausty/TermuxArch | modified scripts (submodule) |
| SocialBox-Termux | samsesh/SocialBox-Termux | 5 modified files |
| SocialBox-Termux/Gemail-Hack | Ha3MrX/Gemail-Hack | clean |
| SocialBox-Termux/insta-bf | samsesh/insta-bf | 4 modified files |
| SocialBox-Termux/fikrado.py | fikrado/fikrado.py | clean |
| AdminHack | mishakorzik/AdminHack | clean |
| gentoo-termux | MrPurple666/gentoo-termux | MODIFIED gentoo.sh; UNTRACKED stage3 tarball + startgentoo.sh |
| Termux-Root-Recovery-Tool | Ishu43642/Termux-Root-Recovery-Tool | 5+ modified files |
| groks fuck ups/KRACKERJACK-Hive-Grok-CLI | superagent-ai/grok-cli | UNTRACKED architect-ui/, hive-core.ts |
| THE-HIVE-OS | JACKSCHITT-INC/THE-HIVE-OS | UNTRACKED ~/ |
| lobster | the-omics-os/lobster | clean |
| trape | jofpin/trape | clean |
| XAttacker | Moham3dRiahi/XAttacker | modified termux-install.sh + 4 untracked junk tars |
| root | adarshaddee/root | modified main |
| ipdrone | noob-hackers/ipdrone | clean |
| aria-termux | Alex72-py/aria-termux | clean |
| anything-llm | Mintplex-Labs/anything-llm | clean |
| TermuxAm | termux/TermuxAm | clean |
| llama.cpp | ggerganov/llama.cpp | clean |

Local modifications that exist ONLY on this phone (assimilation priority): the
KRACKERJACK-Hive-Grok-CLI additions, gentoo.sh + startgentoo.sh, THE-HIVE-OS
untracked dir, groks-fuck-ups architect-ui/ + hive-core.ts.

## Installed packages — explicitly installed (non-automatic)

aichat 0.30.0, aidl, apt, argp, aria2, autoconf, bash, binutils-cross, busybox,
clang 21.1.8, cmatrix, command-not-found, coreutils, curl 8.21.0, dash,
debianutils, deno 2.8.3, dialog, diffutils, dos2unix, dpkg, ed, expect,
fakeroot, ffmpeg 8.1.2, figlet, findutils, fish 4.8.0, gawk, geth-utils, git
2.54.0, gnupg, golang 1.26.4, gotty, gpgv, grep, inetutils, jq, less,
libandroid-glob, libandroid-posix-semaphore, libandroid-selinux,
libandroid-support, libassuan, libbz2, libc++, libcap-ng, libcurl, libgcrypt,
libgmp, libgpg-error, libiconv, libjpeg-turbo, liblzma, libmd, libmpfr,
libnghttp2, libnghttp3, libngtcp2, libnpth, libpng, libsmartcols, libssh2,
libzopfli (auto), llama-cpp b9590, mandoc, mc, nano, ncdu, ncurses,
ncurses-utils, neofetch, net-tools, nodejs-lts 24.17.0, npm 11.17.0,
openjdk-21, openssh 10.3p1, openssl, parted, patch, patchelf, pcre2, perl
5.42.0, php 8.5.1, pkg-config, postgresql 18.2, procps, proot-distro 5.3.0,
proot, psmisc, python-pip, python 3.13.13, python2, ranger, ratt, readline,
resolv-conf, ripgrep, rsync, runit, sed, tar, termux-adb, termux-am,
termux-api 0.59.1, termux-exec, termux-gui-bash, termux-gui-c,
termux-gui-package, termux-gui-pm, termux-keyring, termux-licenses,
termux-services, termux-shizuku-tools 4.1 (local), termux-tools 3.0.9, tgpt,
tmux, toilet, tor, tree, tsu, unzip, util-linux, wget, xorriso, xxhash,
xz-utils, yarn, zip, zlib (+ ~140 automatic dependencies; full list in raw file).

## Tool versions (notable)

- git 2.54.0, node v24.17.0, npm 11.17.0, python 3.13.13, pip 26.1.2
- go present (version flag quirk), clang 21.1.8, make 4.4.1, ffmpeg 8.1.2
- rustc/cargo NOT installed; cmake NOT installed; ollama NOT installed
- **opencode BROKEN**: `"/data/data/com.termux/files/home/.opencode/bin/opencode" has unexpected e_type: 2` — the binary won't execute. This is why the Nov 6 assimilation run never reported back.
- termux-api commands present in $PREFIX/bin: termux-telephony-call, termux-sms-send, termux-location, termux-battery-status, termux-wifi-*, termux-toast, termux-tts-speak, termux-camera-*, termux-sensor, termux-nfc, termux-usb, termux-saf-*, termux-gui-* (the SOS dialer toolkit exists on the phone)
- llama-* binaries present (llama-server included) — the Android server road is installed
- Hive commands in bin: hive, krackerjack, krackerjack-ai
- postgres tooling present (initdb, pg_ctl, psql); sshd present; tor present; ngrok present

## Running services (runsvdir supervised)

postgres, sshd, ssh-agent, tor, ftpd, busybox-httpd, telnetd — all supervised
under runsvdir with svlogd logging. sshd running = the Tailscale/SSH bridge
door is open on the phone side whenever the tunnel is up.

## Storage links / SD card

`~/storage` links intact (downloads, dcim, pictures, shared, external-0/1,
media-0/1). SD card 4CFC-8D04 reachable at /storage/4CFC-8D04 with 99G free.

## Assimilation read (vs Nov 6 map)

- Same big blocks as Nov 6: Grok-CLI 1.4G, go 1.3G, arch 943M, .local 714M,
  llama.cpp 637M — the Nov 6 run never executed (opencode broken), so nothing moved.
- NEW since Nov 6: .opencode 197M, .bun 88M, termux-shizuku-tools, TermuxAm,
  THE-HIVE-OS additions, hive-core.ts, ndk-patches, scripts/, KRACKERJACK/ desk.
- GOLD (phone-only, must preserve): KRACKERJACK-Hive-Grok-CLI local additions,
  THE-HIVE-OS, gentoo-termux scripts, KRACKERJACK/ desk, hive-video-engine,
  .ssh keypair (NEVER leaves the phone), groks-fuck-ups additions.
- BULK (SD card): arch rootfs + tarball, go/pkg, models, anything-llm, llama.cpp
  (clean clone — re-creatable, but 637M; keep a hash record), packages/ +
  x11-packages/ clones (clean, re-creatable).
- JUNK candidates (proven re-creatable or accidental only): zero-byte paste
  accidents, Superconductor x86_64 AppImage, partial .gguf.1, XAttacker %0D junk
  tars. Nothing deleted without Jack's word per NEVER THROW AWAY WHAT WORKS.
