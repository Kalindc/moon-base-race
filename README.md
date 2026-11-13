# Moon Base Race

A browser game about building NASA's Moon Base at the lunar south pole before China's stated date for its own lunar research station (December 2035).

**Play it:** https://kalindc.github.io/moon-base-race/

You make the calls NASA's plan depends on, one cutscene at a time: which Commercial Lunar Payload Services (CLPS) landers carry which scouting instruments, which rovers to land (up to ATHLETE with its swappable tools), where to put the base, which construction and resource payloads to send, how to build landing pads and roads, what Blue Origin's Blue Moon Mark 2 and SpaceX's Starship bring down (habitats, supplies and fission reactors), and how to move, connect and bury the habitat under regolith for radiation shielding. A good choice unlocks the next stage. A wrong one costs months and money. When everything is ready the crew lands and you win. If the mission clock reaches China's date first, you lose.

The game runs on a $20 billion budget released over seven years, as NASA has described it, so you can only spend what has been released so far.

Every lander, rover, payload and choice lists what it can do and why it helps, and is tagged for **Speed**, **Reliability** or **Quality**. Fast choices shorten every later stage, reliable ones lower the chance of a mishap, and quality choices raise your **base quality score**, so the debrief grades you from a bare outpost to a thriving settlement. You can also back seven early-stage concepts from NASA's Innovative Advanced Concepts (NIAC) program, such as a levitating cargo track and an oxygen pipeline. Each one costs development money and time before it can fly.

## What's in this repository

| Path | What it is |
| --- | --- |
| `index.html` | The game, including the **Scene editor** and **Data and sources** tabs. Built from the files below. |
| `timeline.html` | Timeline explorer: NASA's published milestones next to China's, with a source link for each one. |
| `scenario.json` | **All the game content.** Every stage, choice, payload, mass, cost, duration, risk, outcome and source lives here. |
| `src/` | The game engine (JavaScript, CSS and HTML template). |
| `tools/balance.js` | Plays thousands of games automatically and reports win rates, spending and dead ends. Run `node tools/balance.js 2000`; the latest results are in `tools/balance-report.txt`. |
| `tools/compress_art.py` | Shrinks the art for the web. |
| `build.py` | Combines `scenario.json` and `src/` into `index.html` and `timeline.html`, and checks `scenario.json` for mistakes. |
| `art/` | The AI-generated cutscene videos and card pictures. |
| `references/` | Links to public domain NASA reference images of the real hardware and places, used as references for the game's art. Browse them at https://kalindc.github.io/moon-base-race/references/ |

## How accurate is it?

The game follows NASA's published Moon Base plan and timeline (its three phases, Artemis missions, contract values and "ready no earlier than" dates), and the **Data and sources** tab links every source used. Where a cost, mass or date has been published (contract values, lander capacities, vehicle masses), the game uses it, and the **Basis for the numbers** column says which figures are published and links the source. But a game needs numbers nobody has published, so **many values are still estimates**, including:

- the masses and costs of hardware still in early design,
- how long each step takes, and the chance of a mishap,
- the Speed, Reliability and Quality effects, the quality points, and the development cost and time of the NIAC concepts (none of which are funded for flight),
- what happens when a choice goes wrong.

Deliberate game design rather than predictions: The "what if" modes are hypothetical scenarios. Treat the game as an informed simulation, not an official NASA projection. NASA has not reviewed or endorsed it.

If you know a better number and have a source, please [suggest a data fix](CONTRIBUTING.md). That is one of the most useful contributions.

## Help make it better

Anyone can propose new scenes, choices, outcomes and data fixes, with or without coding. See [CONTRIBUTING.md](CONTRIBUTING.md).

## What works where

The game was first built as a claude.ai page, where it gets a few extra features from claude.ai. The version here is a plain web page.

| Feature | On this site | On the [claude.ai version](https://claude.ai/artifact/T3U7q59bmcxbcfezXhHe6i) |
| --- | --- | --- |
| Playing the game, "Play as awarded only" mode, sound, what-if modes, site map, quality score, NIAC concepts, debrief | Yes | Yes |
| Video cutscenes and vehicle pictures | Yes, from the `art/` folder; any file not there yet shows the drawn placeholder scene instead | No, claude.ai pages can't load outside media, so placeholder scenes show |
| Mission control voice | Yes, using your browser's built-in voice | Yes |
| Save result card (image) | Yes, as a normal download | Yes |
| Share link to your result | Yes, links to this site | Yes |
| Scene editor, drafts and playtesting | Yes, the draft stays in your browser | Yes |
| Sharing an edit | "Propose on GitHub" opens a pre-filled GitHub issue; you can also download your draft as `scenario.json` | Proposals and publishing inside claude.ai |
| "Rewrite with Claude" (describe a change in plain words) | No, it needs Claude | Yes |

## Run it yourself

Download the repository and open `index.html` in a browser. To rebuild after editing `scenario.json` or `src/`, run `python3 build.py` (Python 3, nothing to install). When a change to `scenario.json` or `src/` lands on the `main` branch, GitHub rebuilds `index.html` and `timeline.html` automatically.

## Credits

Game data comes from NASA (nasa.gov/moonbase and related pages) and the news coverage listed in the game's sources. Reference images are NASA's; NASA does not endorse this project. The cutscene videos and the pictures on the cards are AI-generated with Higgsfield. They are artist's impressions of hardware that mostly doesn't exist yet, not photographs, and they may get details wrong. Where they can't load, the game falls back to simple drawn scenes.

## License

MIT. See [LICENSE](LICENSE). The license covers this repository's own code, data and art; the NASA images listed in `references/` are NASA's, and the sources linked in the game belong to their publishers.
