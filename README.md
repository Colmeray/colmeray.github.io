# D.E.A.T.H. — poster and energy model

A static website for the D.E.A.T.H. concept, designed primarily for phones. It keeps the poster’s black, white and red palette, with a shorter introduction, four interactive model-handover situations, a sourced chip explanation and the energy calculator. The supplied `DEATH_poster_overleaf.pdf` is included as `assets/exam-poster.pdf`.

The model illustration distinguishes routine waypoint flight, local SNN avoidance, uncertain conditions requiring a heavy-navigation fallback, and destination planning with a VLM. The flight controller remains active in every mode. This is proposed control logic, not inference or a connection to a drone, and it is independent of the calculator’s duty-cycle illustration. Buttons update the scene, control owner, model statuses and GPU state; the selected situation survives a language change.

The chip section uses SynSense Speck as a hardware candidate, with links to SynSense/Sinabs documentation. Integrated Speck sensing and the poster’s separate GenX320 + SNN example are distinguished. NVIDIA’s module power modes and Intel Loihi 2 research access are linked separately. These hardware specifications do not establish a measured flight-system power budget.

English is the default; DA/EN switches the interface, number formatting and validation messages. The language choice is saved locally. `?lang=da` or `?lang=en` selects a language directly. The responsive layout uses local HTML, CSS, JavaScript and SVG without external fonts or a build step.

Run in this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No installation or build is needed. Use a webserver rather than opening the HTML as a file, because the app uses JavaScript modules. The source is suitable for GitHub Pages.

The model compares always-on navigation with camera + SNN + duty-cycled heavy navigation, including sleep power. It estimates usable battery energy, flight time, round-trip delivery radius and total Wh/km. All parameters can be edited; light/medium/heavy presets only change propulsion power.

The poster's assumptions are examples, not flight measurements. Battery energy, ground speed and reserve are additional example inputs. The model holds propulsion and speed constant and excludes extra avionics, wake-up overhead, wind and delivery time; the destination VLM workload is not modelled separately. A sticky result strip keeps the range gain visible while adjusting inputs on a phone. Additional flight/sensor inputs and the training illustration are expandable.

```sh
node energy-model.test.mjs
```

The ForestScan training-source card cites Chavana-Bryant et al. (2026): https://essd.copernicus.org/articles/18/1243/2026/. ForestScan provides forest structure from LiDAR. The illustrated workflow is geometry → simulated camera events → SNN training; the website does not download ForestScan data, generate a training dataset or run a trained network.

The canvas demo uses deterministic synthetic forest points. Its 12-second cycle follows the calculator's heavy-navigator awake percentage. Instantaneous power uses the selected camera/SNN power plus either heavy or sleep power; the calculator continues to show the cycle average. Pause/replay controls, DA/EN labels and reduced-motion handling are included. Animation stops while off screen or in a hidden tab.
