// Primary source: supplied DEATH_poster_overleaf-5.pdf, 24 November 2026.
// Values with status 'illustrative' are UI examples, never poster measurements.
export const REVIEW_DATE = '2026-11-24';
export const DISTANCE_PARAMETERS = Object.freeze({
  speed: { symbol: 'v', unit: 'm/s', value: 4, min: 0, max: 20, step: 0.1, status: 'illustrative' },
  reaction: { symbol: 't_r', unit: 's', value: 0.2, min: 0, max: 2, step: 0.01, status: 'illustrative' },
  deceleration: { symbol: 'a', unit: 'm/s²', value: 2, min: 0.1, max: 10, step: 0.1, status: 'illustrative' },
  minimum: { symbol: 'd_{\\min}', unit: 'm', value: 1, min: 0.1, max: 5, step: 0.1, status: 'illustrative' },
  clearance: { symbol: 'c^*', unit: 'm', value: 2, min: 0.1, max: 10, step: 0.1, status: 'illustrative' },
});
export const EQUATIONS = Object.freeze({
  switch: String.raw`d_{\mathrm{switch}} = v\,t_r + \frac{v^2}{2a} + d_{\min}`,
  ordering: String.raw`d_{\min} < c^* < d_{\mathrm{switch}}`,
  learning: String.raw`\Delta w_{ij} = \eta\,M\,e_{ij}`,
  baseline: String.raw`P_{\mathrm{nav,base}} = P_{\mathrm{GPU}}+P_{\mathrm{lidar}}+P_{\mathrm{frame}}`,
  proposed: String.raw`P_{\mathrm{nav,ours}} = P_{\mathrm{cam}}+P_{\mathrm{SNN}}+P_{\mathrm{lidar}}+f(P_{\mathrm{GPU}}+P_{\mathrm{frame}})`,
  gain: String.raw`\mathrm{Gain}=\frac{P_{\mathrm{prop}}+12.2\,\mathrm{W}}{P_{\mathrm{prop}}+3.5\,\mathrm{W}}-1`,
});
export const LEARNING_EXAMPLE = Object.freeze({
  rate:0.1, eligibility:0.8, // Illustrative values; the poster does not specify these.
  needed:1, falseAlarm:-0.2, missed:-1, // Poster Fig. 4, different synapse populations.
  clippingBounds:null, // Poster says clipped; numeric bounds are not supplied.
});
export const SCIENTIFIC_GAPS = Object.freeze([
  { id: 'dmax', sources: ['poster'], en: 'No d_max definition or equation appears in the poster. It must not be substituted with d_switch or the LiDAR’s maximum specified range.', da: 'Posteren definerer ingen d_max-ligning. Den må ikke erstattes af d_switch eller LiDAR-sensorens maksimale specificerede rækkevidde.' },
  { id: 'dmin', sources: ['poster'], en: 'd_min is a fixed hard limit supplied by the designer. Its numerical value, derivation, uncertainty and validation are not given.', da: 'd_min er en fast grænse valgt af konstruktøren. Værdi, udledning, usikkerhed og validering er ikke angivet.' },
  { id: 'loihi', sources: ['7'], en: 'The ≤1 W Loihi 2 budget is an assumption. The Intel brief gives no universal 1 W guarantee or commercial chip price. A research board and a bare chip are different things.', da: 'Loihi 2-budgettet på ≤1 W er en antagelse. Intel garanterer ikke 1 W eller en kommerciel chippris. Et forskningskort og en løs chip er forskellige ting.' },
  { id: 'vlm', sources: ['5','10'], en: 'OpenFlyV2 reports 48% success in its own 100 real-world trials on a DJI M30T with Jetson Orin NX. It does not validate SpikeNav, Orin Nano execution, thermal integration or the assumed 10 W workload.', da: 'OpenFlyV2 rapporterer 48 % succes i egne 100 flyveforsøg på DJI M30T med Jetson Orin NX. Det validerer ikke SpikeNav, Orin Nano, termisk integration eller den antagne belastning på 10 W.' },
  { id: 'lecture', sources: ['6','15'], en: 'The cited DTU Lecture 3 slides were not supplied and could not be independently accessed. The poster’s learning rule is reproduced; the additional peer-reviewed review supports the general three-factor method only.', da: 'De citerede DTU-slides fra forelæsning 3 var ikke vedlagt og kunne ikke tilgås uafhængigt. Posterens læringsregel gengives; den ekstra fagfællebedømte artikel understøtter kun den generelle trefaktormetode.' },
  { id: 'cost', sources: ['14','17','19'], en: 'The poster’s ≈$1k excluding the SNN is not an itemized quotation. Current OpenMV and NVIDIA pages alone list $400 for the camera module and $399 for the Super developer kit; these are assemblies, not bare sensor or chip prices.', da: 'Posterens ≈$1.000 uden SNN er ikke et specificeret tilbud. OpenMV og NVIDIA angiver henholdsvis $400 for kameramodulet og $399 for Super-udviklingssættet. Det er moduler, ikke løse sensorer eller chips.' },
  { id: 'revision', sources: ['11'], en: 'Poster reference [11] says datasheet rev. 1.0; the linked exact-model document shows rev. 0.2 (4 July 2023). The model agrees; the revision discrepancy remains visible.', da: 'Posterreference [11] angiver datablad rev. 1.0; det linkede dokument for den præcise model viser rev. 0.2 (4. juli 2023). Modelnavnet stemmer, men revisionen afviger.' },
  { id: 'clinical', sources: ['3','4'], en: 'The six-hour comparison is context from a separate coagulopathy study, not a universal treatment deadline. WeRobotics’ 2017 delivery demonstration used a different fixed-wing aircraft and a simulated clinical response.', da: 'Sammenligningen med seks timer stammer fra et separat studie af koagulopati og er ikke en universel behandlingsfrist. WeRobotics’ demonstration i 2017 brugte et andet fastvingefly og en simuleret klinisk indsats.' },
  { id: 'validation', sources: ['poster'], en: 'No integrated SpikeNav prototype measurements or flight results are reported. Under-canopy autonomy, robust switching, GPU boot, reward signals, weight clipping bounds and safe online adaptation remain unvalidated.', da: 'Der rapporteres ingen målinger eller flyveresultater fra en integreret SpikeNav-prototype. Flyvning under trækroner, robust overtagelse, GPU-opstart, belønningssignaler, vægtgrænser og sikker onlinetilpasning er ikke valideret.' },
]);
