# poi website visual identity

This guide governs website-kai's UI. Keep the poi mark, harbour map and IBM Plex typography; use consistent color semantics and control hierarchy. `src/styles/globals.css` is the source of truth for colors. Individual pages must not introduce their own action colors.

## Color roles

The base palette is paper `#f5f0e0`, night blue `#13202b`, ink `#2f2b27`, brick `#a34233`, harbour teal `#426d69` and neutral gray `#656963`. Dark mode adjusts the same semantic tokens. Do not hard-code separate page palettes.

| Token                       | Purpose                                                           | Boundary                                                 |
| --------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `background` / `foreground` | Page surfaces, headings and ordinary text                         | Do not fill content areas with brand colors              |
| `card` / `popover`          | Download groups and floating menus                                | Ordinary paragraphs do not need cards                    |
| `primary` / `primary-hover` | The main action in an action group: stable download, Show updates | Not for ordinary links, labels or selection markers      |
| `navigation`                | Text links, current location, selected items and timeline nodes   | Not a filled action-button color                         |
| `muted-foreground` / `copy` | Field labels, channels, dates and counts / long-form body copy    | Do not reduce body readability through opacity           |
| `border` / `input`          | Content separators / interactive control boundaries               | Input boundaries are stronger than decorative separators |
| `ring`                      | Keyboard focus                                                    | Does not replace persistent selection markers            |
| `destructive`               | Actions that actually delete or destroy data                      | Not for beta releases or ordinary error messages         |

Brick is the primary action color, not an error signal. Color must be accompanied by text, a line, an icon or an explicit current/selected state; it must not be the only way to convey meaning.

## Buttons, links and fields

Use `Button`. For links styled as buttons, use `asChild` or the same module's `buttonVariants`. Pages may adjust layout, but must not override control colors, radius, focus or hover treatment.

| Role                | Convention                                               | Examples                                              |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Primary action      | `variant="default" size="lg"`, filled brick              | Stable download, Show updates                         |
| Secondary action    | `variant="outline" size="lg"`, neutral border            | Beta download                                         |
| Utility action      | `variant="ghost"`; `size="icon"` for icon-only controls  | Language, theme                                       |
| Home primary action | `size="hero"`; same color and shape, larger size         | Home download                                         |
| Ordinary navigation | `text-link`, teal text and underline                     | Download options, Compare versions, Back to changelog |
| Linked heading      | Body-colored heading, teal on hover, external-link arrow | Version heading linking to GitHub Release             |

Emphasize one primary action per action group. Stable and beta downloads must not compete as two equally prominent filled buttons. Header and footer utility links stay neutral; the current page uses teal text and an underline.

- Action buttons have a 6px radius and no shadow. Floating menus may use shadows to indicate elevation.
- Utility buttons are at least 40px high; page actions and fields are at least 48px. Home primary actions are at least 56px, or 64px on desktop. Accommodate translated text without clipping.
- `field-control` styles native selects and download platform selectors: 48px minimum height, neutral border, 6px radius and 16px text.
- `field-label` uses 14px medium-weight neutral text above the control. Use a visible label rather than relying on a placeholder.
- Native forms must remain usable without JavaScript. Preserve label associations, keyboard access, disabled states and link semantics.

## Labels, states and navigation

Stable and beta are channel labels, not actions or success/warning states. Use the text-only `field-label` treatment, without filled blocks, pills or colored borders. Dates, formats, platforms and year counts use neutral 12–14px text. Versions and dates use monospace.

Do not style noninteractive information as clickable pills. Before adding a status label, define the domain state it represents rather than assigning a color independently on each page.

- Current header page: teal text and bottom border, with `aria-current="page"`.
- Current release: teal text, left border and a subtle background, with `aria-current="location"`.
- Selected menu option: selection indicator, teal text and subtle background. Keyboard focus also has a background treatment.
- Year groups use neutral headings, counts and disclosure arrows. The desktop directory is sticky; the mobile directory is collapsible. Neither has internal scrollbars.

## Typography, layout and copy

- Keep the brand mark and map. Use IBM Plex Sans and its JP / SC / TC / KR families for interface text; use the system monospace stack for versions and dates.
- Interior pages use `PageHeader`: 36px on mobile, 48px on tablet and 60px on desktop. Ordinary section headings use 24px; release headings may use 24–30px monospace.
- Body copy uses 16px text with 28–32px line height and a readable line length. Labels use 14px; dates and counts use 12px. Avoid long uppercase passages and decorative letter spacing.
- Interior pages share `Transition` widths and gutters. Group content with whitespace and thin separators, not a card around every paragraph.
- Omit subtitles that repeat a title or explain an obvious action. Keep explanations that affect a decision: comparison boundaries, mobile download availability and error states.
- Use an up-right arrow for external content links, a right arrow for forward navigation and a left arrow for return navigation. Decorative icons have `aria-hidden` and do not repeat the accessible label.
- Repository documentation, code comments and PR descriptions use English. User-facing strings remain localized through the existing message catalogs.

## Interaction and accessibility

- Hover changes color over 150ms. Buttons do not lift or bounce. Respect `prefers-reduced-motion`.
- Keyboard focus uses a 2px teal outline with 3px offset on links, buttons, disclosures and fields. Menu items retain their keyboard-focus background.
- Disabled controls use native disabled semantics and 50% opacity, and cannot perform their action.
- Normal text must reach 4.5:1 contrast; essential control boundaries and focus indicators must reach 3:1. Check light, dark and hover states.
- Preserve the visible SSR paint. Hydration must not hide content again; scroll synchronization updates only navigation state.

## Maintenance

Colors and shared classes live in `src/styles/globals.css`; button variants and sizes in `src/components/ui/button.tsx`; menu states in `src/components/ui/dropdown-menu.tsx`; interior headings in `src/components/page-header.tsx`.

Start new pages with these semantics and components. When they do not cover a required role, document that role here before updating the shared definitions. Check home, download, changelog and comparison pages on desktop and mobile, in light and dark themes.
