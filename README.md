# D.E.A.T.H. energy calculator

A compact, static calculator based on the quantitative analysis in `assets/exam-poster.pdf`. English is the default; DA/EN switches the whole interface, number formatting and validation messages. The language choice is saved locally. `?lang=da` or `?lang=en` selects a language directly.

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
