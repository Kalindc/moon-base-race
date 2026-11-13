# Contributing to Moon Base Race

Thanks for helping. You don't need to code to contribute. All game content lives in one file, `scenario.json`, and the game has a built-in editor for it.

## Ways to help

1. **Fix a number.** If a mass, cost, date, duration or risk is wrong or has a better source, [open a data fix](https://github.com/Kalindc/moon-base-race/issues/new?template=data-fix.yml). Include the source link. Published sources (NASA, contractor announcements, papers) beat estimates.
2. **Propose a scene or choice.** Add a new payload, rover, decision or outcome, or change how one plays out. The easiest way is the in-game editor (below).
3. **Report a bug.** [Open an issue](https://github.com/Kalindc/moon-base-race/issues/new) saying what you did, what you expected and what happened, with your browser name.
4. **Improve the code.** Open a pull request against `src/`.

## Proposing a change with the in-game editor (no coding)

1. Open the game at https://kalindc.github.io/moon-base-race/ and choose **Scene editor**.
2. Pick a stage, or **Game settings** for the budget, timeline and what-if modes.
3. Edit the stage data. The fields are described below. Press **Save to draft**, then **Playtest from this stage** to try it. Your draft stays in your browser.
4. Write a short note on what you changed and why, then press **Propose on GitHub**. A GitHub issue opens with your stage filled in. Sign in to GitHub (a free account) and press **Create**.
   - For a long stage, the button copies the stage instead; paste it into the **Stage data** box.
   - For changes across several stages, press **Download draft** and attach the `scenario.json` file to the issue.

The maintainer reviews each proposal, playtests it, and adds it to the game.

## Editing scenario.json directly (pull requests)

1. Edit `scenario.json` (on GitHub you can press the pencil icon on the file; GitHub creates a fork and pull request for you).
2. If you work locally, run `python3 build.py` to check your change and rebuild `index.html`. You don't have to: GitHub checks every pull request and rebuilds the game after it is merged.
3. Say in the pull request where your numbers come from.
4. If you change costs, durations or risks, run `node tools/balance.js 2000` (Node.js) and say in the pull request how the win rates moved. A sensible player should win about half the time.

## How a stage is written

Each entry in `stages` is one cutscene and decision.

- Common fields: `id` (short unique name), `type` (`"choice"` or `"loadout"`), `title`, `narration` (what the player reads), `scene` (which placeholder drawing to show: lander, rover, orbit, build, cargo, habitat, reactor, shield, crew or boom), `videoPrompt` (the description the cutscene video was made from), and optionally `still` (a picture link) and `media` (a video link) for the cutscene. Cards can carry `image` (a picture link). If a picture or video can't load, the placeholder drawing shows instead.
- A **choice** stage has `options`, each with `label`, `desc`, `months` (time it costs), `costM` (millions of dollars), `risk` (0 to 1 chance of a mishap), `outcome` (`"ok"`, `"fail"` or `"setback"`), `resultText`, and optionally `requires` and `grants` (tags for things the player has, such as `"mapping"` or `"pads"`). At least one option must be `"ok"`.
- A **loadout** stage has `carriers` (landers or rockets with `capKg`, `months`, `costM`) and `items` (payloads with `kg`, `tags`, `costM`), plus `needs` (the tags the chosen payloads must cover). A payload can always fail with `"outcome": "fail"`.
- Anything can carry `availableAt: {"y": 2028, "m": 6}` for a "ready no earlier than" date, and a stage can carry `insight: {"text": ..., "url": ...}` for a sourced fact shown after the decision.

Please keep wording plain and factual, and add a source link for any real-world figure.

## Images and video

Only add images or video you have the right to publish: your own work, public domain NASA material, or something with a license that allows it (say which). Company and press images need the owner's permission. The `references/` folder lists the NASA reference images.

## Be kind

Assume good intent, keep discussion about the work, and remember that people of all ages and backgrounds may be learning about spaceflight here.
