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
| Farmers market stall | `71bb9234-7443-4a68-a632-5c663188517e` |
| Cabin interior — two figures knitting | `5837513d-15bb-4695-b7d9-a46a8b258039` |

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
