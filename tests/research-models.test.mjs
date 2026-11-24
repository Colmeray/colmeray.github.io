import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { calculateDistances } from '../modules/distance-model.mjs';
import { calculateCost } from '../modules/cost-model.mjs';
import { DISTANCE_PARAMETERS, EQUATIONS } from '../data/science.mjs';
import { COST_ITEMS, EXCHANGE } from '../data/pricing.mjs';
import { HARDWARE } from '../data/hardware.mjs';
import { REFERENCES } from '../data/references.mjs';
import { ENERGY_DEFAULTS } from '../data/energy.mjs';
import { calculateWeightChange } from '../modules/learning-model.mjs';
import katex from '../assets/vendor/katex/katex.min.js';

const defaults=Object.fromEntries(Object.entries(DISTANCE_PARAMETERS).map(([key,p])=>[key,p.value]));
const near=(value,expected)=>assert.ok(Math.abs(value-expected)<1e-9,`${value} != ${expected}`);

test('manual example: 4 × 0.2 + 4² / (2 × 2) + 1 = 5.8 m',()=>{
  const r=calculateDistances(defaults);
  near(r.reactionDistance,0.8);near(r.brakingDistance,4);near(r.switchDistance,5.8);
  assert.equal(r.minimum,1);assert.equal(r.maximum,null);assert.equal(r.clearanceValid,true);
});
test('manual example: 10 × 0.3 + 10² / (2 × 5) + 2 = 15 m',()=>{
  const r=calculateDistances({speed:10,reaction:0.3,deceleration:5,minimum:2,clearance:3});
  near(r.reactionDistance,3);near(r.brakingDistance,10);near(r.switchDistance,15);
  assert.equal(r.exceedsBrightRange,true);assert.equal(r.exceedsDarkRange,true);
});
test('zero speed yields the hard limit and leaves no feasible target-clearance interval',()=>{
  const r=calculateDistances({...defaults,speed:0});
  near(r.switchDistance,1);assert.equal(r.clearanceValid,false);
});
test('hard limit stays an input, d_max stays unknown, and clearance requires strict ordering',()=>{
  for(const clearance of [1,5.8,9])assert.equal(calculateDistances({...defaults,clearance}).clearanceValid,false);
  const r=calculateDistances({...defaults,minimum:2,clearance:3});near(r.switchDistance,6.8);assert.equal(r.maximum,null);
});
test('rejects negative, missing, zero-deceleration and non-finite physical inputs',()=>{
  for(const overrides of [{speed:-1},{reaction:-1},{deceleration:0},{deceleration:-1},{minimum:0},{clearance:0},{speed:NaN},{reaction:Infinity},{minimum:undefined}])
    assert.throws(()=>calculateDistances({...defaults,...overrides}),RangeError);
});
test('unknown prices remain unknown: 400 + 399 + 164 = $963 subtotal, with 7 excluded lines',()=>{
  const r=calculateCost(COST_ITEMS,EXCHANGE.dkkPerUsd);
  near(r.subtotal,963);near(r.dkk,963*7.4744/1.0963);
  assert.equal(r.complete,false);assert.equal(r.missing.length,7);assert.ok(r.missing.includes('neuromorphic'));
});
test('quantities, explicit zero, and USD/DKK conversion: 2 × $50 + 1 × $0 = $100 / 680 DKK',()=>{
  const r=calculateCost([{id:'a',category:'Sensors',quantity:2,usd:50},{id:'b',category:'Other',quantity:1,usd:0}],6.8);
  assert.equal(r.complete,true);near(r.subtotal,100);near(r.dkk,680);
});
test('invalid costs, quantities and exchange rates are rejected',()=>{
  for(const item of [{quantity:0,usd:1},{quantity:1.5,usd:1},{quantity:1,usd:-1},{quantity:1,usd:NaN},{quantity:1,usd:Infinity}])
    assert.throws(()=>calculateCost([{id:'bad',...item}],6.8),RangeError);
  for(const rate of [0,-1,NaN,Infinity])assert.throws(()=>calculateCost(COST_ITEMS,rate),RangeError);
});
test('all poster equations render with the local KaTeX distribution',()=>{
  for(const equation of Object.values(EQUATIONS))assert.ok(katex.renderToString(equation,{throwOnError:true}).includes('katex-mathml'));
  assert.equal(EQUATIONS.switch,String.raw`d_{\mathrm{switch}} = v\,t_r + \frac{v^2}{2a} + d_{\min}`);
});
test('manual three-factor examples use the poster modulator values',()=>{
  near(calculateWeightChange(.1,1,.8),.08);
  near(calculateWeightChange(.1,-.2,.8),-.016);
  near(calculateWeightChange(.1,-1,.8),-.08);
  assert.throws(()=>calculateWeightChange(-.1,1,.8),RangeError);
});
test('source IDs, hardware images and pricing citations resolve; unavailable source URLs are explicit null',()=>{
  const ids=new Set(REFERENCES.map(r=>r.id));assert.equal(ids.size,REFERENCES.length);
  for(const entry of [...HARDWARE,...COST_ITEMS])for(const id of entry.sources??[entry.source])assert.ok(ids.has(id),id);
  for(const h of HARDWARE)if(h.image)assert.ok(existsSync(h.image),h.image);
  assert.equal(REFERENCES.find(r=>r.id==='6').url,null);
  assert.equal(COST_ITEMS.find(r=>r.id==='neuromorphic').usd,null);
  assert.equal(ENERGY_DEFAULTS.lidarCount,2);
  const prompt=readFileSync('original-prompt.txt','utf8');
  assert.ok(prompt.includes('DEATH_poster_overleaf-5.pdf'));
  assert.equal((prompt.match(/\\## \d+\./g)??[]).length,11);
  assert.ok(prompt.includes('Be creative with the presentation, conservative with the science'));
});
