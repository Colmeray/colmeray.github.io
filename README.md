# D.E.A.T.H. — poster and energy model

A static project website matching the supplied `DEATH_poster_overleaf.pdf`, included as `assets/exam-poster.pdf`. The dark title band, annotated drone drawing, red section numbers and three-column concept layout follow the poster. The four sections cover the problem, proposed navigation loop, quantitative analysis and conclusion, followed by the interactive calculator, forest illustration, candidate hardware and references.

English is the default; DA/EN switches the interface, number formatting and validation messages. The language choice is saved locally. `?lang=da` or `?lang=en` selects a language directly. The responsive layout uses local HTML, CSS, JavaScript and SVG without external fonts or a build step.

Run in this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No installation or build is needed. Use a webserver rather than opening the HTML as a file, because the app uses JavaScript modules. The source is suitable for GitHub Pages.

The model compares always-on navigation with camera + SNN + duty-cycled heavy navigation, including sleep power. It estimates usable battery energy, flight time, round-trip delivery radius and total Wh/km. All parameters can be edited; light/medium/heavy presets only change propulsion power.

The poster's assumptions are examples, not flight measurements. Battery energy, ground speed and reserve are additional example inputs. The model holds propulsion and speed constant and excludes extra avionics, wake-up overhead, wind and delivery time.

```sh
node energy-model.test.mjs
```

The ForestScan training-source card cites Chavana-Bryant et al. (2026): https://essd.copernicus.org/articles/18/1243/2026/. ForestScan provides forest structure from LiDAR. The illustrated workflow is geometry → simulated camera events → SNN training; the website does not download ForestScan data, generate a training dataset or run a trained network.

The canvas demo uses deterministic synthetic forest points. Its 12-second cycle follows the calculator's heavy-navigator awake percentage. Instantaneous power uses the selected camera/SNN power plus either heavy or sleep power; the calculator continues to show the cycle average. Pause/replay controls, DA/EN labels and reduced-motion handling are included. Animation stops while off screen or in a hidden tab.
