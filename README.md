# SpikeNav — interactive research companion

A responsive scientific website matching the poster’s white, black, red and pale-green visual identity based on **DEATH_poster_overleaf-5.pdf**, dated 24 November 2026. The existing English/Danish interface, mission walkthrough, energy calculator and learning demonstration are preserved and extended. The supplied poster replaces the previous PDF at `assets/exam-poster.pdf`.

Static HTML, CSS and JavaScript modules; no backend, build step, analytics or runtime network dependencies. KaTeX 0.16.22 and product imagery are served locally; the poster typography uses system Arial. The repository remains compatible with GitHub Pages.

## Run locally

```sh
npm run preview
```

Open **http://127.0.0.1:8000/**. Alternatively, use `python3 -m http.server 8000`. Serve the files over HTTP because ES modules and the original-prompt viewer fetch local files. No npm install is needed to run the website.

English is the default. EN/DA preserves calculator inputs, selected components and mission state. `?lang=en` and `?lang=da` override the saved language. Bibliographic titles, the original prompt and the top AI disclosure remain in their original language. Explanatory reference metadata and interface controls are translated.

## Implemented experience

- The full AI disclosure appears above navigation. **View the original AI prompt** opens an accessible dialog displaying `original-prompt.txt` without rewriting. Escape closes it and returns focus. The file includes the user request, supplied file context and original formatting; it excludes private system/developer instructions.
- A labelled AI-authored SVG depicts the proposed payload, two narrow LiDAR paths, event sensing, RGB/thermal input, Loihi 2, on-demand GPU and the logical avoidance path into the conventional flight controller. Coverage and placement are schematic.
- The distance laboratory renders the poster equation with local KaTeX, pairs sliders and numerical inputs, displays intermediate terms, plots switching distance versus speed, and validates physical inputs and target-clearance ordering.
- The original four-state, 24-second mission remains playable, pausable and seekable. Scripted timing is separate from the energy budget. The safety-fallback phase holds position.
- Six structured hardware records distinguish exact variants, chips, modules and development kits. They include sourced specifications, verified imagery where available, mass/power information, limitations and source links. Missing information is explicit.
- The energy calculator now defaults to the poster's **two LiDARs**. It preserves editable sleep power, battery, reserve, speed and one/two-LiDAR alternatives, with their assumptions identified. Visible scenario notes distinguish ground speed from obstacle approach speed; these examples stay independent and show both unit conversions.
- The three-factor learning example retains the poster's reward values. A separate qualitative gain-synapse illustration compares closest approach with target clearance. Missing gain rules and clipping bounds are not invented.
- The cost worksheet separates neuromorphic platform, sensors, GPU, controller, drone and integration costs. Unknown prices remain blank. It labels partial budgets “Subtotal for entered items” even when values are manually estimated. A mobile subtotal stays visible while scrolling through the inputs. Four integration categories and the currency/export breakdown use disclosures. It reports an incomplete subtotal until all lines are priced, converts to DKK using a dated ECB snapshot, and exports the scenario as JSON.
- A searchable source ledger retains all 14 poster references, adds the poster and seven further sources, and provides verified DOI identifiers. A review register exposes scientific gaps and discrepancies. Source and review details start collapsed; citations and direct source URLs automatically reveal the source ledger and clear its filter. Training-method and gain-example details also fold away to keep the initial reading flow compact.

## Scientific models and assumptions

The poster reports no integrated SpikeNav flight measurements. All website calculations are theoretical or illustrative.

### Distances

```text
d_switch = v × t_r + v² / (2a) + d_min
d_min < c* < d_switch
```

`v`: approach speed, m/s; `t_r`: reaction time, s; `a`: positive constant-deceleration magnitude, m/s²; `d_min`: designer-supplied hard limit, m; `c*`: target clearance, m. The plot holds all inputs except speed fixed. This 1D calculation omits wind, attitude, actuation and timing uncertainty.

**No d_max definition or equation is supplied. No numerical derivation of d_min is supplied.** The site therefore treats d_min as an input and d_max as unavailable. Neither is substituted with d_switch or a datasheet sensor range. Defaults of 4 m/s, 0.2 s, 2 m/s², 1 m and 2 m are explicitly website examples, not safety recommendations.

| Manually checked example | Reaction | Braking | d_switch |
| --- | --- | --- | --- |
| v=4, t_r=0.2, a=2, d_min=1 | 0.8 m | 4 m | 5.8 m |
| v=10, t_r=0.3, a=5, d_min=2 | 3 m | 10 m | 15 m |

The latter exceeds TFmini-S's conditional 12 m range at 90% reflectivity. Its 7 m range at 10% reflectivity is separately flagged. Neither is d_max or guaranteed obstacle detection.

### Energy

```text
Pbase = PGPU + n × Plidar + Pframe
PSpikeNav = Pcam + PSNN + n × Plidar
          + f × (PGPU + Pframe) + (1−f) × Psleep
range gain = (Pprop + Pbase) / (Pprop + PSpikeNav) − 1
```

Defaults: propulsion 130 W; active GPU 10 W; GPU/frame-camera duty 10%; event camera 3 mW; assumed SNN 1 W; two LiDARs at 0.7 W each; RGB/thermal 0.75 W; inactive GPU/cameras 0 W. Camera input is converted to W.

These give **12.15 W** baseline and **3.478 W** proposed navigation, a **71.4%** theoretical navigation-power reduction. The original poster rounds to 12.2/3.5 W. The calculator retains full precision until display. Modeled range gains round to **6.5%, 3.3%, 1.3%** at propulsion powers 130/260/650 W.

77 Wh comes from the DJI Mavic 3 reference; 36 km/h and 20% reserve are extra website assumptions. Constant propulsion/speed are assumed. Controller/carrier electronics, regulators, wind, delivery hover and extra transients are omitted. Boot and fallback must fit within or increase the active share. A DJI reference does not select a delivery airframe. Complete inactive power-off and a 1 W SNN remain unvalidated.

### Learning

```text
Δw_ij = η × M × e_ij
```

Poster modulators: needed take-over +1, false alarm −0.2, missed obstacle −1 on a different “stay” synapse population. With illustrative η=0.1 and e=0.8, changes are +0.080, −0.016 and −0.080. No numerical clipping bounds or gain-reward rule are supplied. c* is the target to maintain; the hard safety limit is not learned.

## Cost evidence

Three observed listings seed a **$963 subtotal**: OpenMV GENX320 module $400; Jetson Orin Nano Super Developer Kit $399; FLIR Lepton 3.5 $164. Reviewed 24 November 2026. These are listings/MSRP for distinct assemblies, not guaranteed availability, quotations, bare-chip costs or the cost of a completed prototype.

Seven lines remain unpriced, including Loihi 2. Evidence is insufficient for credible low/central/high Loihi estimates. Intel's research access and unrelated product prices cannot establish a commercial chip price. A research board and a bare chip are distinct. Manual values are labelled user engineering assumptions; blank means unknown, while an explicit zero means the user assumes no incremental cost.

The priced OpenMV module requires a compatible host, shown as a separate unpriced integration item. No specific host is added to the poster architecture as a confirmed selection. Avoid counting controllers/carriers twice if included in another platform quote.

ECB snapshot, **2026-11-24**: 1 EUR = 1.0963 USD = 7.4744 DKK. DKK/USD = 7.4744 / 1.0963, rounded to six decimals in the editable field. Editing it marks the rate as user-supplied. Tax, import duties, delivery, labour, certification, test flights, software and clinical logistics are excluded.

## Unresolved scientific questions and discrepancies

- No justified d_min value, d_max equation, validated deceleration/latency or event-to-command timing is given.
- No integrated SpikeNav prototype, under-canopy flight result, online-learning performance or clinical benefit is demonstrated.
- Loihi 2's ≤1 W budget is an assumption, not a universal Intel specification. Public retail chip pricing was not verified. Oheo Gulch and Kapoho Point are distinct research platforms.
- OpenFlyV2 is a preprint reporting 48% success in its own 100 physical trials on a DJI M30T with **Orin NX**. This does not establish **Orin Nano** compatibility, SpikeNav performance, thermal fusion or the assumed 10 W workload.
- The cited DTU Lecture 3 slides were not supplied and could not be independently accessed. The poster's rule is reproduced; the additional peer-reviewed review supports the general mechanism only.
- The exact LI-IMX678-MIPI-118H indexed datasheet ends at rev. 0.2 (4 July 2023), while the poster cites 1.0. Direct download is blocked; indexed manufacturer-document content was reviewed. An exact-model photo could not be retrieved.
- The poster names Lepton without a variant. Lepton 3.5 / 500-0771-01 is explicitly a website candidate, and its family image is labelled.
- NVIDIA's current FAQ lists $399 for the Super kit; older launch material says $249. Production-module volume pricing is a separate purchase basis. The poster's ≈$1k excluding SNN is not a reproducible complete quotation.
- The six-hour comparison comes from a separate coagulopathy study, not a universal treatment deadline. WeRobotics' 2017 delivery used a different fixed-wing aircraft and simulated clinical response.

Direct retrieval of canonical Intel and Mouser downloads was blocked. Intel's official alternate worked. `data/link-review.json` records these limits; HTTP availability is not scientific validation.

## Data and code

| File | Purpose |
| --- | --- |
| `data/science.mjs` | Poster equations, demonstration defaults and scientific gaps |
| `data/energy.mjs` | Power defaults, units and assumptions |
| `data/hardware.mjs` | Exact variants, specifications and image provenance |
| `data/pricing.mjs` | Prices, quantities, missing values and exchange-rate basis |
| `data/references.mjs` | Bibliography, DOI identifiers and verification status |
| `data/exchange-rate-2026-11-24.xml` | Official dated ECB snapshot |
| `data/link-review.json` | Dated direct link retrieval results |
| `data/poster-transcript.txt` | Full transcript of the supplied poster |
| `modules/*-model.mjs` | Pure calculations separated from browser rendering |
| `modules/*-view.mjs` | Calculators and learning interactions |
| `modules/research.mjs` | Source ledger, product panels and prompt viewer |
| `Script.js`, `model-switch.mjs`, `mission-timeline.mjs` | Preserved energy and mission functionality |
| `i18n.mjs` | English and Danish translations with updated-poster corrections |
| `style.css`, `research.css` | Layout foundations and new visual system |

Manrope: SIL Open Font License, `assets/fonts/OFL.txt`. KaTeX: MIT, `assets/vendor/katex/LICENSE`. Manufacturer-image attribution: `assets/hardware/ATTRIBUTION.txt`.

## Verification

```sh
npm test
```

24 individual model/integrity tests cover manual calculations, units, two-LiDAR power, reserve/return distance, switching, invalid inputs, missing costs, quantities, currency conversion, reward examples, equation rendering, source relationships and preserved mission timing.

For browser QA, install development-only dependencies and Chromium, start the preview in another terminal, then run:

```sh
npm install
npx playwright install chromium
npm run test:browser
```

The browser suite checks prompt-file fidelity and keyboard behaviour, distance/cost calculations and validation, JSON export, hardware panels, both learning populations, original mission controls, citations, both languages, responsive controls at 320/390/768/1440 px, internal anchors and JavaScript errors. It also runs an automated WCAG A/AA axe scan. Automated checks supplement scientific and visual review; they do not establish flight safety or full accessibility conformance.

Changes are local to this repository. These scripts do not deploy or push Git commits.
