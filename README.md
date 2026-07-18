# OrderPortal Concept Study

Four static Tailwind prototypes for a restaurant operations portal.

## Concepts

| Route                        | Purpose                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `/`                          | Concept gallery and entry point                             |
| `/concept-orderportal.html`  | Warm, approachable branch-management portal                 |
| `/concept-service.html`      | Dark command-centre portal with a vertical operational rail |
| `/concept-intelligence.html` | Light, executive-focused multi-branch analytics portal      |

## Local Preview

Run a static server from the project root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open [http://localhost:4173](http://localhost:4173).

## Design Review With Pikr

With the local server running, inspect a page using Pikr:

```powershell
pikr http://localhost:4173/concept-service.html
```

Use the route of the concept you want to review.

## OpenCode Skills

Project skills are registered through `opencode.json` and documented in `AGENTS.md`.

- Use `frontend-developer` for HTML, Tailwind, interaction, accessibility, and responsive UI work.
- Use `fullstack-ui-ux-engineer` when a feature also requires data, APIs, authentication, state, or backend design.
- Use both for end-to-end product features.

Restart OpenCode after changing `opencode.json`, `AGENTS.md`, or files under `.opencode/skills/`.

## Deploy

Deploy the static site to the configured Vercel team:

```powershell
vercel --prod --yes --scope zahidshersial
```

Current production URL: [admin-layout-eight.vercel.app](https://admin-layout-eight.vercel.app)
