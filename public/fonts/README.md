# Anthropic brand fonts

The app is wired (in `src/app/globals.css`, via `@font-face`) to use the real
Anthropic typefaces. These are **licensed faces and are not committed to the
repo** — drop your own `.woff2` files here with these exact names and they'll
be picked up automatically. Until the files exist, the stacks fall back to
Inter / Newsreader / JetBrains Mono, so the site always renders.

Expected files:

| File | Family | Weight | Style |
|------|--------|--------|-------|
| `AnthropicSans-Regular.woff2`  | Anthropic Sans  | 400 | normal |
| `AnthropicSans-Medium.woff2`   | Anthropic Sans  | 500 | normal |
| `AnthropicSans-SemiBold.woff2` | Anthropic Sans  | 600 | normal |
| `AnthropicSans-Bold.woff2`     | Anthropic Sans  | 700 | normal |
| `AnthropicSerif-Regular.woff2` | Anthropic Serif | 400 | normal |
| `AnthropicSerif-Italic.woff2`  | Anthropic Serif | 400 | italic |
| `AnthropicMono-Regular.woff2`  | Anthropic Mono  | 400 | normal |

If your files use different weights/names, edit the `@font-face` blocks at the
top of `src/app/globals.css` to match.
