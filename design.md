# Design System

Full design reference is in DESIGN.md. This is the quick reference for Kiro.

## Colors

| Role | Hex |
|---|---|
| Primary purple (brand anchor) | #3D3480 |
| Hot pink (CTA, highlights) | #FF1493 |
| Electric yellow (XP, achievements) | #FFD700 |
| Near black (backgrounds, text) | #1A1A2E |
| Off white (page background) | #F5F5F0 |
| Red orange (high chaos, danger) | #FF4500 |
| Mint green (success, confirmed) | #00C896 |

## Typography

- Headers: Space Grotesk, font-black, uppercase
- Body: DM Sans, font-normal or font-medium
- Numbers/data: JetBrains Mono

## Border Style (Neobrutalist)

All cards and inputs use thick visible borders with offset box shadows:

```
border: 3px solid #1A1A2E
box-shadow: 4px 4px 0px #1A1A2E
```

In Tailwind: `border-2 border-neutral-900 shadow-[4px_4px_0px_#1A1A2E]`

Hover state shifts shadow: `hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px]`

## Key Rules

- No border-radius on cards, buttons, or inputs
- Only rounded corners on achievement badge circles and XP bar fill
- No gradient backgrounds on full sections
- No Tailwind default drop shadows, use offset box-shadow only
- Page max-width: max-w-2xl centered, px-4 on mobile
- Section gaps: gap-8 (32px)
- Card padding: p-6 (24px)

## Button Variants

| Type | Classes |
|---|---|
| Primary CTA | bg-[#FF1493] text-white font-black uppercase border-2 border-neutral-900 |
| Secondary | bg-[#1A1A2E] text-white font-black uppercase border-2 border-neutral-900 |
| Confirm YES | bg-[#00C896] text-neutral-900 font-black border-2 border-neutral-900 |
| Confirm NO | bg-[#F5F5F0] text-neutral-900 font-black border-2 border-neutral-900 |
| Danger | bg-[#FF4500] text-white font-black border-2 border-neutral-900 |

## Logo

File: public/logo.png
Wizard cat winking, deep purple (#3D3480) flat icon on white background.
Use only on white or #F5F5F0 backgrounds.
Display at 40x40px in header alongside PURRIDICTION wordmark.
