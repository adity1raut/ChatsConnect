# ChatsConnect client

React 19 + Vite + Tailwind CSS 4. The UI follows a terminal / HUD look —
monospace type, square corners, 1px borders, a teal accent — and is built
from [shadcn/ui](https://ui.shadcn.com) components on
[Radix](https://www.radix-ui.com) primitives.

```sh
npm install
npm run dev          # http://localhost:5173 (set VITE_BACKEND_URL in .env for a local API)
npm run ci           # lint + unit tests + production build
```

## Layout

```
src/
├── app/Providers.jsx        # context providers, outermost first
├── components/
│   ├── ui/                  # shadcn/ui components (button, dialog, select, …) + HUD pieces
│   ├── layout/              # app shell (Sidebar, MobileNav, StatusBar) and public site bar/footer
│   ├── routes/              # ProtectedRoute / PublicRoute
│   └── video/               # call overlays
├── context/                 # auth, socket, E2EE, AI, calls, friends, notifications, theme
├── features/<area>/         # pages and their parts: chat, ai, auth, dashboard, e2ee, …
├── lib/                     # cn(), toast store, time and download helpers
└── index.css                # theme tokens and custom utilities
```

## UI components

Import from the barrel:

```jsx
import { Button, Card, Modal, UserAvatar } from "../../components/ui";
```

- **shadcn/ui parts**: `Button`, `Badge`, `Card*`, `Dialog*`, `DropdownMenu*`, `Tabs*`,
  `Select*`, `Switch`, `ToggleGroup*`, `Tooltip*`, `Collapsible*`, `Alert*`, `Avatar*`,
  `Input`, `Textarea`, `Label`, `Separator` and `Skeleton`. Each is styled for the
  terminal theme.
- **App helpers built on them**:
  - `Modal`: a dialog with a title bar and footer.
  - `IconButton`: an icon-only button with a tooltip.
  - `SegmentedControl`: a single-choice toggle group.
  - `InputField`, `PasswordField`, `TextareaField` and `SelectField`: a label plus
    hint or error text.
  - `UserAvatar`: a photo or initials, with an online dot.
  - `Markdown`, `Toaster`, `EmptyState` and `Spinner`.
- **HUD pieces** (`hud.jsx`):
  - `Corners`: bracket corner ticks.
  - `Eyebrow`: a label in the "001 / SECTION" style.
  - `PageHeader`, `StatusDot` and `SignalBars`.

To add another shadcn component, run `npx shadcn add <name>`. `components.json`
and the `@` alias are already set up. Then swap any rounded or shadowed classes
for the square style used here.

## Theme

`src/index.css` defines the tokens under shadcn's names: `background`,
`card`, `popover`, `primary`, `muted`, `muted-foreground`, `accent`,
`destructive`, `border` and `ring`. It adds a few of its own:

- `faint` for tertiary text
- `border-strong`
- `info`, `success` and `warning`
- `sidebar` and `overlay`
- `shadow-panel` and `shadow-float`

Dark mode is the `.dark` class on `<html>`. It is the default; `ThemeContext`
and the pre-paint script in `index.html` switch it. To keep one area dark in
either theme, add `dark` to that area's own class list, as the call screens do.

Custom utilities:

- `eyebrow`: the small uppercase letter-spaced label
- `bg-grid`: the blueprint grid background
- `glow`: the teal halo on primary actions
- `scrollbar-thin` / `scrollbar-none`
- `pb-mobile-nav` / `h-above-mobile-nav`: room for the phone tab bar

Corners are square (`--radius: 0`), so `rounded-*` does nothing except
`rounded-full`, which is kept for dots.
