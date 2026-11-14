# Platform support

Support tiers (full: macOS, Linux; minimal: Windows, Gemini models) are in
[docs/support-tiers.md](docs/support-tiers.md).

- **macOS** + **Linux**: full test suite supported.
- **Windows**: minimal support; [docs/support-tiers.md](docs/support-tiers.md)
  says what is promised. Every PR must pass the `windows-smoke` check (`./setup`,
  the core skills start, the fastest Windows-safe tests); the curated
  Windows-safe subset runs nightly on main in `windows-free-tests` and never
  blocks a PR. Setup script (`./setup`) requires Git Bash or
  MSYS today; native PowerShell support is a future expansion. The `bin/gstack-paths`
  helper resolves state roots through `CLAUDE_PLUGIN_DATA` / `GSTACK_HOME` so plugin
  installs work on every platform.
- **CSO native helper**: `/cso` additionally needs Bun's four
  `--no-compile-autoload-*` flags and a native toolchain (static-capable C on
  Linux, Xcode command-line tools on macOS, or VS 2022 C++ Build Tools on
  Windows). Setup installs everything else and leaves `/cso` explicitly
  unavailable when that optional toolchain is absent.
- **Browser and renderer**: the browser skills, `/make-pdf`, and `/diagram` drive
  the Aside browser first, which is macOS 15+ only. On Linux and Windows (or a
  Mac with Aside closed) the readiness check says so once and the same skills use
  gstack's own bundled browser, built by `./setup`.
