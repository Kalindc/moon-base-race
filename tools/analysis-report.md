# Moon Base Race: analysis

Generated 2026-11-14 by `node tools/analysis.js 1000`. Deadline Dec 2035 unless stated.

## Sensitivity

Baseline: a sensible player wins 16.9% (usually lost), an expert 97.2%, and a perfect run with no mishaps finishes in time. The awarded-only result uses no estimates and cannot change.

| Parameter | Range | Sensible win low / high | Expert low / high | Perfect run low / high | Flips |
|---|---|---|---|---|---|
| Every estimate at once | all kind to all harsh | 73.7% / 0% | 100% / 0% | yes / no | all kind: a sensible player's run becomes a coin flip; all harsh: the base becomes impossible even with perfect play |
| Total budget ($20B spoken figure) | $15B to $30B | 0.1% / 36.5% | 97.3% / 96.8% | yes / yes | $30B: a sensible player's run becomes a coin flip |
| Crew flight cost (2021 Inspector General, $4.1B) | $2.0B to $6.0B | 33.8% / 3.9% | 97.3% / 97.1% | yes / yes | $2.0B: a sensible player's run becomes a coin flip |
| China's date (assumption) | Dec 2030 to Dec 2040 | 0% / 23.2% | 0% / 100% | no / yes | Dec 2030: the base becomes impossible even with perfect play |
| Build pads, roads and foundations: estimated times | half to double | 26% / 4.1% | 98.6% / 71.8% | yes / yes | half: a sensible player's run becomes a coin flip |
| Development cost and time of new technologies | half to double | 21.6% / 4.1% | 96% / 96.3% | yes / yes | none |
| Ready dates of reactor, habitats and rovers (published) | 1 yr earlier to 1 yr later | 22% / 5.5% | 96.2% / 82.7% | yes / yes | none |
| Build pads, roads and foundations: estimated costs | half to double | 21.7% / 9.7% | 97.3% / 97.3% | yes / yes | none |
| Land the heavy cargo: estimated costs | half to double | 21.7% / 9.8% | 96.8% / 97.2% | yes / yes | none |
| Send construction and resource payloads: estimated times | half to double | 21.7% / 10.3% | 98.8% / 88.3% | yes / yes | none |
| Choose the base site: estimated times | half to double | 20.6% / 9.5% | 97.5% / 94.2% | yes / yes | none |
| Send construction and resource payloads: estimated costs | half to double | 19% / 9.8% | 96.2% / 96.8% | yes / yes | none |
| Lunar night slowdown (20%) | 0% to 40% | 20.7% / 12.2% | 99.4% / 89.1% | yes / yes | none |
| Shield the habitat: estimated times | half to double | 18.6% / 10.2% | 98.3% / 90% | yes / yes | none |
| Move the habitat: estimated times | half to double | 17.4% / 11% | 98.8% / 83.4% | yes / yes | none |
| Place the reactor and connect power: estimated times | half to double | 17.3% / 12.3% | 98% / 91.2% | yes / yes | none |
| Land the mobility fleet: estimated costs | half to double | 18.1% / 13.7% | 96.8% / 96% | yes / yes | none |
| Scout the South Pole: estimated costs | half to double | 18.1% / 14.5% | 96.8% / 97.3% | yes / yes | none |
| Place the reactor and connect power: estimated costs | half to double | 17.5% / 14% | 96.7% / 97.3% | yes / yes | none |
| Land the heavy cargo: estimated times | half to double | 16.4% / 13.2% | 91.1% / 97.2% | yes / yes | none |
| Send construction and resource payloads: estimated mishap chances | none to double | 17.8% / 14.8% | 98.4% / 95.5% | yes / yes | none |
| Land the heavy cargo: estimated mishap chances | none to double | 17.8% / 14.9% | 96% / 97.3% | yes / yes | none |
| Move the habitat: estimated mishap chances | none to double | 16.9% / 15% | 98.1% / 95.7% | yes / yes | none |
| Shield the habitat: estimated costs | half to double | 15.9% / 14.4% | 97.3% / 96.7% | yes / yes | none |
| Budget release in equal yearly parts (assumption) | all at once to over 10 yrs | 10.4% / 8.9% | 97.3% / 96.1% | yes / yes | none |
| Build pads, roads and foundations: estimated mishap chances | none to double | 17% / 15.6% | 97.4% / 94.4% | yes / yes | none |
| Shield the habitat: estimated mishap chances | none to double | 17% / 15.8% | 97.3% / 96.8% | yes / yes | none |
| Scout the South Pole: estimated mishap chances | none to double | 15.4% / 16.4% | 96% / 97.2% | yes / yes | none |
| Place the reactor and connect power: estimated mishap chances | none to double | 15.1% / 14.2% | 97.5% / 96.6% | yes / yes | none |
| Choose the base site: estimated costs | half to double | 17% / 17.8% | 96.1% / 97.3% | yes / yes | none |
| Move the habitat: estimated costs | half to double | 15.4% / 15.7% | 97.3% / 97.3% | yes / yes | none |
| Land the crew: estimated costs | half to double | 16.9% / 16.9% | 97.2% / 97.2% | yes / yes | none |
| Land the crew: estimated times | half to double | 16.9% / 16.9% | 97.2% / 97.2% | yes / yes | none |
| Delays after a failed attempt (all stages) | half to double | 16.9% / 16.9% | 97.2% / 97.2% | yes / yes | none |

## Adversary: awarded hardware plus the fewest additions

Starts Jun 2028 with $2.5B of awarded robotic missions paid. Searched 18004 complete plans. Fewest additions: 14 new contracts.

- Send construction and resource payloads: Two Blue Moon Mark 1 cargo flights with ISRU Pilot Excavator (IPEx), Solar concentrator sintering rig, miniCAST solar and comms tower (done May 2029, total spent $3.2B)
- Build pads, roads and foundations: Landing pad with blast berm, then road, then habitat foundations (done Jun 2030, total spent $4.4B)
- Land the heavy cargo: SpaceX Starship cargo with Fission Surface Power reactor, Inflatable surface habitat, Power cable reels and radiators, Logistics and supplies (done Jan 2032, total spent $11.0B)
- Move the habitat: Winch it on a skid (done Sep 2032, total spent $11.0B)
- Place the reactor and connect power: One kilometre away behind a berm, with a rover laying cable (done Feb 2033, total spent $11.1B)
- Shield the habitat: Bury it under 2 to 3 metres of loose regolith (done Aug 2033, total spent $11.3B)
- Land the crew: Starship lander to the pad (done Jan 2034, total spent $15.4B)

With no mishaps the crew moves in Jan 2034 for $15.4B. With mishaps on, over 4000 runs, it wins 99.4% before Dec 2035; finish p10/median/p90 Jan 2034 / Apr 2034 / Jan 2035.
If Artemis IV and V count against the $20B, $1.9B is left for everything else.

## Back-plan ranges

### Against China's announced date

- base: first deadline Cargo lander for 15 to 30 t loads, Aug 2027 (median comparable). cargo Sep 2027 / Aug 2027 / Aug 2026; reactor Aug 2031 / Dec 2028 / Jul 2026; habitat Sep 2030 / Oct 2027 / Feb 2026; pads Jan 2030 / Dec 2028 / Jul 2028
- surfaceHalf: first deadline Cargo lander for 15 to 30 t loads, Mar 2028 (median comparable). cargo Apr 2028 / Mar 2028 / Mar 2027; reactor Mar 2032 / Jul 2029 / Feb 2027; habitat Apr 2031 / May 2028 / Sep 2026; pads Feb 2031 / Jan 2030 / Aug 2029
- surfaceDouble: first deadline Cargo lander for 15 to 30 t loads, Mar 2026 (median comparable). cargo Apr 2026 / Mar 2026 / Mar 2025; reactor Mar 2030 / Jul 2027 / Feb 2025; habitat Apr 2029 / May 2026 / Sep 2024; pads Jul 2027 / Jun 2026 / Jan 2026
- tail0: first deadline Cargo lander for 15 to 30 t loads, Aug 2027 (median comparable). cargo Sep 2027 / Aug 2027 / Aug 2026; reactor Feb 2032 / Jun 2029 / Jan 2027; habitat Mar 2031 / Apr 2028 / Aug 2026; pads Jul 2030 / Jun 2029 / Jan 2029
- tail12: first deadline Surface habitat, Apr 2027 (median comparable). cargo Sep 2027 / Aug 2027 / Aug 2026; reactor Feb 2031 / Jun 2028 / Jan 2026; habitat Mar 2030 / Apr 2027 / Aug 2025; pads Jul 2029 / Jun 2028 / Jan 2028

### Against NASA's own dates

- base: first deadline Cargo lander for 15 to 30 t loads, Jan 2024 (median comparable). cargo Feb 2024 / Jan 2024 / Jan 2023; reactor Jan 2028 / May 2025 / Dec 2022; habitat Feb 2033 / Mar 2030 / Jul 2028; pads Jun 2026 / May 2025 / Dec 2024
- surfaceHalf: first deadline Cargo lander for 15 to 30 t loads, Jan 2024 (median comparable). cargo Feb 2024 / Jan 2024 / Jan 2023; reactor Jan 2028 / May 2025 / Dec 2022; habitat Feb 2033 / Mar 2030 / Jul 2028; pads Dec 2026 / Nov 2025 / Jun 2025
- surfaceDouble: first deadline Cargo lander for 15 to 30 t loads, Jan 2024 (median comparable). cargo Feb 2024 / Jan 2024 / Jan 2023; reactor Jan 2028 / May 2025 / Dec 2022; habitat Feb 2033 / Mar 2030 / Jul 2028; pads May 2025 / Apr 2024 / Nov 2023
- tail0: first deadline Cargo lander for 15 to 30 t loads, Jan 2024 (median comparable). cargo Feb 2024 / Jan 2024 / Jan 2023; reactor Jul 2028 / Nov 2025 / Jun 2023; habitat Aug 2033 / Sep 2030 / Jan 2029; pads Dec 2026 / Nov 2025 / Jun 2025
- tail12: first deadline Cargo lander for 15 to 30 t loads, Jan 2024 (median comparable). cargo Feb 2024 / Jan 2024 / Jan 2023; reactor Jul 2027 / Nov 2024 / Jun 2022; habitat Aug 2032 / Sep 2029 / Jan 2028; pads Dec 2025 / Nov 2024 / Jun 2024

