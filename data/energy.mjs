// Poster v5: two 0.7 W LiDAR units, 1 W assumed SNN budget, 10% GPU duty.
// Flight examples (speed, reserve) are additional assumptions, not measurements.
export const ENERGY_DEFAULTS = Object.freeze({
  propulsion:130, heavy:10, awake:10, camera:3, snn:1,
  lidar:0.7, lidarCount:2, frame:0.75, sleep:0,
  battery:77, speed:36, reserve:20,
});
export const ENERGY_PROVENANCE = Object.freeze({
  units:{power:'W',camera:'mW',battery:'Wh',speed:'km/h',awake:'%',reserve:'%'},
  poster:['propulsion','heavy','awake','camera','snn','lidar','lidarCount','frame','sleep'],
  additionalAssumptions:['speed','reserve'],
  manufacturerReference:{battery:'DJI Mavic 3, 77 Wh; modelling reference only'},
  exclusions:['carrier/controller electronics','regulator losses','wind','additional payload','GPU boot/shutter transients beyond the duty allowance'],
});
