# Summit & Stitch — Clay Scroll Site (Higgsfield art)

The full website concept with real AI-generated clay miniature art:
Patagonia-Provisions editorial layout, scroll-scrubbed hero push-in,
parallax clay bands, and all nine sections from the brief.

## Run it

No build step. Open `index.html` in a browser, or from VS Code:

```sh
npx serve web/site
```

## The art

All five dioramas were generated on Higgsfield (`z_image`) with the brand's
master clay-miniature prompt. They're referenced from Higgsfield's CDN and
also live in the account's generation library:

| Scene | Job ID |
|---|---|
| Hero — mountain island, cabin, clothesline | `6becc438-d1d1-40bb-a810-064f348040e5` |
| Clothesline colorways close-up | `ea4f319a-cdfe-45b2-bd3e-e8fa3f8c4620` |
| Craft macro — yarn basket, cable knit | `f985a052-5418-46ab-91fa-ab9ade17dd55` |
| Farmers market stall — both founders | `f51aedde-23fb-4e97-9bf7-c59ea61d931e` |
| Cabin interior — both founders knitting | `7bd4b347-3f76-4f45-8ede-64f7547d70cf` |

Earlier takes without the founder likenesses (`71bb9234…`, `5837513d…`)
remain in the Higgsfield library if ever needed.

## Founder character block (paste into any future scene prompt)

> the man has warm light-tan golden skin (not dark), a short neat black
> beard, and light brown hair, wearing a sage green cable-knit sweater;
> the woman has warm tanned golden skin and medium brown hair in a soft
> low bun, wearing a cream cable-knit sweater

The free-plan model is text-only (no reference images), so this exact
wording, repeated verbatim, is what keeps the couple consistent across
scenes. If the account is upgraded, re-render with `nano_banana_pro`
using these two takes as reference images for tighter consistency.

For production: download these from the Higgsfield library into
`web/site/assets/` and swap the URLs so the site doesn't depend on CDN
links. Re-roll or upscale any scene from the same prompts (each prompt is
stored with its generation).

## Higgsfield-hosted deployment (started, blocked by sandbox)

A Higgsfield website project (`summit-stitch`) was created via
`create_website` — its live URL would be `summit-stitch.<higgsfield-host>`.
This build sandbox's network policy blocks the Higgsfield git host
(`apps-repos.higgsfield.ai`), so the site code could not be pushed from
here. To finish that path: run the same flow from a network-open
environment (or Higgsfield's own Design mode) and port this page into the
scaffolded React/TanStack app. This static version is functionally the
same page.
