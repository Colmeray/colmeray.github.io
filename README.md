# SpikeNav

A complete, buildless website for the November 2026 SpikeNav poster: event-based navigation for medical delivery drones. Static HTML, CSS, JavaScript modules and local SVG illustrations; no dependencies, external fonts, analytics or build step. Suitable for this repository's GitHub Pages hosting.

## Preview and checks

    python3 -m http.server 8000

Open http://localhost:8000. Use a server because the page imports JavaScript modules.

    node --test energy-model.test.mjs model-switch.test.mjs
    node --check Script.js

English is the default. EN/DA translates the complete interface and formats numbers; the preference is stored locally. ?lang=en and ?lang=da override the saved preference. Language changes preserve the selected flight scenario, hardware component, reward example and calculator inputs.

## Experience

- A locally drawn SVG introduces the navigation payload.
- Four selectable flight situations show sparse flight, SNN obstacle avoidance, failed-takeover safety fallback and VLM destination planning. The flight controller stabilises in every mode. These are proposed control states, not inference or drone telemetry.
- The front-page "Watch the mission" button reveals and starts a 24-second guided mission with obstacle avoidance, a stationary safety fallback and medical delivery. Play/pause, restart and a seekable timeline are available in both languages. It pauses when off screen or in a hidden tab; reduced-motion users see still scenes within each phase. The sequence is scripted and independent of the calculator's duty-cycle assumptions.
- Six hardware panels link to documentation for GenX320, Loihi 2, TFmini-S, Jetson Orin Nano, LI-IMX678-MIPI-118H and Lepton 3.5. DJI Mavic 3 Classic is explained separately as a modelling reference.
- An editable calculator compares navigation power, total power, flight duration and return-trip radius. It supports the three poster propulsion examples, one/two LiDAR units, sleep power and frame-camera gating.
- A three-factor learning illustration previews the proposed reward modulation. It uses fixed illustrative learning-rate and trace values; it does not train a network. The missed-obstacle example acts on a stay-in-autopilot synapse, unlike the takeover examples.
- Responsive navigation, native form validation states, keyboard controls, live announcements and reduced-motion support.
- assets/exam-poster.pdf is the supplied DEATH_poster_overleaf-1.pdf, replacing the older poster.

## Energy model

Power is in watts, except event-camera input in milliwatts. The defaults are:

| Input | Default |
| --- | --- |
| Propulsion | 130 W |
| GPU active power | 10 W |
| GPU + frame-camera active fraction | 10% |
| Event camera | 3 mW |
| SNN | **1 W** |
| LiDAR | 0.7 W × one unit |
| Active RGB + thermal | 0.75 W |
| Inactive GPU + frame cameras | 0 W |
| Battery / speed / reserve | 77 Wh / 36 km/h / 20% |

    Pbase = PGPU + n × Plidar + Pframe
    PSpikeNav = Pcam + PSNN + n × Plidar
             + f × (PGPU + Pframe) + (1 − f) × Psleep
    range gain = (Pprop + Pbase) / (Pprop + PSpikeNav) − 1

The unrounded navigation values are 11.45 W and 2.778 W, about 75.7% navigation savings. At 130, 260 and 650 W propulsion the model gives about 6.5%, 3.3% and 1.3% range gain.

The 1 W SNN budget, 10 W average GPU workload, 10% duty cycle and full GPU/frame-camera power-off are project assumptions, not measured hardware guarantees. The active share must include boot and safety fallback. Speed and reserve are additional examples. Constant propulsion and speed are assumed; extra avionics, weather, delivery hover, regulators and separate boot/shutter peaks are excluded. Battery and speed affect duration/radius, not percentage range gain.

The poster budgets a single TFmini-S even though its diagram describes forward and downward ranging. The calculator permits two fixed units and charges both architectures for the same sensor count.

## Sources and interpretation

Manufacturer links are beside the facts in the page:

- [GenX320 2023 product brief](https://www.prophesee.ai/wp-content/uploads/2023/10/GENX320ES-Product-Brief-2023-DICE-OK.pdf): the cited 3 mW and 22.8 mW are specific historical operating points; current product figures vary.
- [Intel Loihi 2 brief](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/neuromorphic-computing-loihi-2-brief.pdf): research access, neuron/core counts and learning capability; not evidence for a universal 1 W specification.
- [Benewake TFmini-S datasheet](https://en.benewake.com/uploadfiles/2024/04/20240426140025367.pdf): power is per single-point sensor; two fixed directions imply two units.
- [NVIDIA JetPack 6.2](https://developer.nvidia.com/blog/nvidia-jetpack-6-2-brings-super-mode-to-nvidia-jetson-orin-nano-and-jetson-orin-nx-modules/): distinguish original 7/15 W modes from Super options.
- [Leopard Imaging datasheet, hosted by Mouser](https://www.mouser.com/datasheet/2/233/LI_IMX678_MIPI_118H_Datasheet-3420357.pdf): the exact non-HL camera variant.
- [FLIR Lepton 3.5](https://oem.flir.com/products/lepton/?model=500-0771-01): operating, standby and shutter powers differ.
- [DJI specifications](https://www.dji.com/mavic-3-classic/specs): 77 Wh, 40 min maximum hover and 895 g imply about 129 W/kg total electrical power. Rounding to 130 and treating that as linearly scaling propulsion is a poster approximation.

WHO contextual burden estimates, the WeRobotics transport report, Houcke et al.'s separate French Guiana clinical study and the two learning-method publications are linked in their sections. The poster's isolated 48% VLM claim points to a LiDAR reference and could not support a website claim.

The site is a research presentation. System integration, safe switching, GPU boot, VLM reliability and in-flight learning remain to be demonstrated.
