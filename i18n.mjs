const messages = {
  en: {
    trainingEyebrow: 'TRAINING SOURCE / FORESTSCAN', trainingTitle: 'From forest structure to smarter flight.', trainingSource: 'ForestScan · Chavana-Bryant et al., 2026 ↗',
    animationDescription: 'Illustrative drone flight through a synthetic forest point cloud. The navigator wakes during the configured active part of the cycle.',
    syntheticScene: 'SYNTHETIC SCENE · ILLUSTRATION', pauseAnimation: 'Pause', playAnimation: 'Play', replayAnimation: 'Replay ↺', demoCamera: 'Camera', demoNavigator: 'Navigator',
    routineState: 'Routine — navigator asleep', difficultState: 'Difficult — navigator awake', invalidAnimation: 'Enter valid values to show power', instantPower: 'Instantaneous navigation power',
    animationTiming: 'The awake-time slider sets the active share of each cycle.',
    trainingCaption: 'ForestScan provides forest LiDAR geometry. Illustrated training workflow: 3D scenes → simulated camera events → SNN. This animation uses generated points, not a dataset replay or a trained-model prediction.',
    title: 'D.E.A.T.H. — Energy calculator', description: 'Explore navigation power, flight time and delivery range with the D.E.A.T.H. neuromorphic energy model.',
    skip: 'Skip to calculator', brandNote: 'ENERGY LAB', poster: 'View poster ↗', language: 'Language',
    headline: 'Less compute.', headlineAccent: 'More range.', intro: 'Wake the heavy navigator only when needed. See what it saves.',
    inputs: 'Your setup', droneClass: 'Propulsion examples from the poster', presetGroup: 'Propulsion presets', light: 'Light', medium: 'Medium', heavyClass: 'Heavy',
    propulsion: 'Propulsion power', heavy: 'Heavy navigator', awake: 'Heavy navigator awake', mostlyAsleep: 'Mostly asleep', alwaysOn: 'Always on',
    flightInputs: 'For the flight estimate', battery: 'Battery energy', speed: 'Ground speed', advanced: 'Sensors, sleep & reserve', camera: 'Event camera', snn: 'SNN gatekeeper', sleep: 'Navigator in sleep', reserve: 'Battery reserve',
    example: 'Illustrative values, not flight measurements.', reset: 'Reset ↺', results: 'Results', calculatedGain: 'CALCULATED RANGE GAIN', sameBattery: 'Same battery. Same speed. Less navigation power.',
    flightTime: 'FLIGHT TIME', radius: 'DELIVERY RADIUS', baseline: 'Always-on:', comparison: 'Navigation power', navSaving: 'Navigation power saved', energyPerKm: 'Total energy per km',
    formulas: 'The model & its assumptions', powerFormula: 'Navigation power', flightFormula: 'Flight time & radius',
    flightEquation: 'Usable energy = battery × (1 − reserve / 100). Flight time = usable energy / total power × 60. Radius = speed × flight time / 120, including a return flight.',
    assumptionsTitle: 'Read the estimates correctly', assumptions: 'The poster’s example supplies the navigation and propulsion values. Battery, speed and reserve are additional examples. Propulsion and speed stay constant; wind, wake-up latency, extra avionics and delivery time are excluded.',
    gainEquation: 'Range gain = (baseline total power / gated total power − 1) × 100. Navigation savings apply to computing only.', footer: '27020 · Exam poster energy model',
    invalid: '{field}: enter a number from {min} to {max}.', invalidGeneric: 'Check the entered values.', invalidStatus: 'Complete all fields to calculate.',
    reserveNote: 'Return flight included · {reserve} battery reserve', positiveStatus: 'Navigation savings only. Total drone power: {baseline} → {gated} W.', negativeStatus: 'No range gain at these settings. Total drone power: {baseline} → {gated} W.',
  },
  da: {
    trainingEyebrow: 'TRÆNINGSKILDE / FORESTSCAN', trainingTitle: 'Fra skovstruktur til smartere flyvning.', trainingSource: 'ForestScan · Chavana-Bryant m.fl., 2026 ↗',
    animationDescription: 'Illustration af en drone gennem en syntetisk punktsky af en skov. Navigationen vågner i den indstillede aktive del af hvert forløb.',
    syntheticScene: 'SYNTETISK SCENE · ILLUSTRATION', pauseAnimation: 'Pause', playAnimation: 'Afspil', replayAnimation: 'Forfra ↺', demoCamera: 'Kamera', demoNavigator: 'Navigation',
    routineState: 'Rutine — navigation i dvale', difficultState: 'Svært — navigation aktiv', invalidAnimation: 'Indtast gyldige tal for at vise effekt', instantPower: 'Øjeblikkelig navigationseffekt',
    animationTiming: 'Skyderen bestemmer den aktive andel af hvert forløb.',
    trainingCaption: 'ForestScan leverer LiDAR-geometri af skove. Illustreret træningsforløb: 3D-scener → simulerede kamerahændelser → SNN. Animationen bruger genererede punkter, ikke en afspilning af datasættet eller en trænet models forudsigelse.',
    title: 'D.E.A.T.H. — Energiberegner', description: 'Beregn navigationseffekt, flyvetid og leveringsradius med D.E.A.T.H.-konceptets energimodel.',
    skip: 'Spring til beregneren', brandNote: 'ENERGILAB', poster: 'Se poster ↗', language: 'Sprog',
    headline: 'Mindre beregning.', headlineAccent: 'Længere rækkevidde.', intro: 'Tænd kun den tunge navigation, når det er nødvendigt. Se besparelsen.',
    inputs: 'Din opsætning', droneClass: 'Eksempler på motoreffekt fra posteren', presetGroup: 'Eksempler på motoreffekt', light: 'Let', medium: 'Mellem', heavyClass: 'Tung',
    propulsion: 'Motoreffekt', heavy: 'Tung navigation', awake: 'Tid med tung navigation tændt', mostlyAsleep: 'Mest i dvale', alwaysOn: 'Altid tændt',
    flightInputs: 'Til flyveestimatet', battery: 'Batterienergi', speed: 'Fart over jorden', advanced: 'Sensorer, dvale og reserve', camera: 'Eventkamera', snn: 'SNN-gatekeeper', sleep: 'Navigation i dvale', reserve: 'Batterireserve',
    example: 'Eksempeltal, ikke målte flyvedata.', reset: 'Nulstil ↺', results: 'Resultater', calculatedGain: 'BEREGNET RÆKKEVIDDEGEVINST', sameBattery: 'Samme batteri. Samme fart. Mindre navigationseffekt.',
    flightTime: 'FLYVETID', radius: 'LEVERINGSRADIUS', baseline: 'Altid tændt:', comparison: 'Navigationseffekt', navSaving: 'Sparet navigationseffekt', energyPerKm: 'Samlet energi pr. km',
    formulas: 'Modellen og dens antagelser', powerFormula: 'Navigationseffekt', flightFormula: 'Flyvetid og radius',
    flightEquation: 'Brugbar energi = batteri × (1 − reserve / 100). Flyvetid = brugbar energi / samlet effekt × 60. Radius = fart × flyvetid / 120, inklusive returflyvning.',
    assumptionsTitle: 'Sådan læses estimaterne', assumptions: 'Navigation og motoreffekt er fra posterens regneeksempel. Batteri, fart og reserve er ekstra eksempelværdier. Motoreffekt og fart er konstante; vind, opvågningstid, øvrig elektronik og leveringstid er ikke medregnet.',
    gainEquation: 'Rækkeviddegevinst = (samlet effekt før / samlet effekt efter − 1) × 100. Navigationsbesparelsen gælder kun computerdelen.', footer: '27020 · Energimodel fra eksamensposter',
    invalid: '{field}: indtast et tal fra {min} til {max}.', invalidGeneric: 'Kontrollér de indtastede tal.', invalidStatus: 'Udfyld alle felter for at beregne.',
    reserveNote: 'Returflyvning inkluderet · {reserve} batterireserve', positiveStatus: 'Kun navigationsbesparelse. Samlet droneeffekt: {baseline} → {gated} W.', negativeStatus: 'Ingen rækkeviddegevinst med disse tal. Samlet droneeffekt: {baseline} → {gated} W.',
  },
};

export function t(language, key, values = {}) {
  const message = messages[language]?.[key];
  if (message === undefined) throw new Error(`Missing translation: ${language}.${key}`);
  return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}
export const localeFor = language => language === 'da' ? 'da-DK' : 'en-GB';
