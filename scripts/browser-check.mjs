import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

// The override allows temporary QA dependencies without adding runtime dependencies.
const require=createRequire(process.env.SPIKENAV_QA_PACKAGE || import.meta.url);
const { chromium }=require('playwright');
const { default:AxeBuilder }=require('@axe-core/playwright');
const base=process.env.SPIKENAV_URL || 'http://127.0.0.1:8000';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
const fill=async(selector,value)=>{await page.locator(selector).fill(value);};
const txt=selector=>page.locator(selector).textContent();
const check=(name)=>console.log(`PASS ${name}`);

try {
  await page.goto(`${base}/?lang=en`,{waitUntil:'networkidle'});
  assert.equal(await txt('#switch-result'),'5.80');
  assert.equal(await txt('[data-out="navigation"]'),'3.48');
  assert.equal(await txt('[data-out="baseline-nav"]'),'12.15');
  assert.equal(await txt('#cost-usd'),'$963');
  assert.match(await txt('#cost-completeness'),/7 unpriced/);
  check('poster defaults and incomplete cost subtotal');

  await page.locator('#prompt-open').click();
  await page.waitForFunction(()=>document.querySelector('#prompt-text').textContent.includes('Be creative with the presentation'));
  assert.equal(await txt('#prompt-text'),await readFile(new URL('../original-prompt.txt',import.meta.url),'utf8'));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#prompt-dialog').evaluate(el=>el.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'prompt-open');
  check('complete prompt bytes, Escape and returned keyboard focus');

  await fill('#distance-speed','10');await fill('#distance-reaction','0.3');
  await fill('#distance-deceleration','5');await fill('#distance-minimum','2');
  await fill('#distance-clearance','3');
  assert.equal(await txt('#switch-result'),'15.00');
  assert.equal(await txt('#step-reaction'),'3.00 m');assert.equal(await txt('#step-braking'),'10.00 m');
  assert.match(await txt('#sensor-range-note'),/exceeds 12 m/);
  await fill('#distance-deceleration','0');
  assert.equal(await page.locator('#distance-error').isVisible(),true);
  assert.equal(await txt('#switch-result'),'—');assert.equal(await page.locator('#signal-play').isDisabled(),true);
  await fill('#distance-deceleration','5');await fill('#distance-clearance','1');
  assert.equal(await page.locator('#clearance-note').getAttribute('data-valid'),'false');
  await page.locator('#distance-form button[type=reset]').click();
  await page.waitForFunction(()=>document.querySelector('#switch-result').textContent==='5.80');
  check('manual distance example, physical validation and reset');

  const setObstacle=async(value)=>page.locator('#obstacle-distance').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await setObstacle('4');assert.equal(await page.locator('#live-lab').getAttribute('data-state'),'avoidance');
  assert.match(await txt('#signal-command'),/SNN/);assert.equal(await txt('#sim-gpu'),'Inactive');
  await setObstacle('0.5');assert.equal(await page.locator('#live-lab').getAttribute('data-state'),'override');
  assert.equal(await txt('#sim-gpu'),'Requested on');
  await fill('#clear-dwell','0.1');await setObstacle('14');
  assert.match(await txt('#signal-sensor'),/Beyond 12 m specification/);
  await page.waitForFunction(()=>document.querySelector('#live-lab').dataset.state==='cruise');
  await page.locator('#looming').check();assert.equal(await page.locator('#live-lab').getAttribute('data-state'),'avoidance');
  await page.locator('#looming').uncheck();
  check('avoidance, safety fallback, clearance dwell and looming');

  await fill('#price-neuromorphic','500');assert.equal(await txt('#cost-usd'),'$1,463');
  assert.match(await txt('[data-price-basis="neuromorphic"]'),/User engineering/);
  await fill('#price-lidar','50');assert.equal(await txt('#cost-usd'),'$1,563');
  await fill('#quantity-lidar','3');assert.equal(await txt('#cost-usd'),'$1,613');
  await fill('#price-rgb','-1');assert.equal(await txt('#cost-usd'),'—');
  await fill('#price-rgb','');await fill('#exchange-rate','0');assert.equal(await txt('#cost-dkk'),'—');
  await page.locator('#cost-reset').click();
  const downloadPromise=page.waitForEvent('download');await page.locator('#cost-export').click();
  const download=await downloadPromise;const stream=await download.createReadStream();let chunks=[];for await(const chunk of stream)chunks.push(chunk);
  const exported=JSON.parse(Buffer.concat(chunks).toString());
  assert.equal(exported.calculation.complete,false);assert.equal(exported.calculation.subtotal,963);
  assert.equal(exported.items.find(i=>i.id==='neuromorphic').usd,null);
  check('editable unit costs, quantities, invalid exchange rate and exported unknowns');

  for(const id of ['snn','lidar','gpu','rgb','thermal','event']){
    await page.locator(`[data-component="${id}"]`).click();
    assert.equal(await page.locator(`[data-product-panel="${id}"]`).isVisible(),true);
    assert.equal(await page.locator('[data-product-panel]:visible').count(),1);
  }
  await page.locator('[data-architecture-node="flight"]').click();
  assert.match(await txt('#architecture-inspector'),/does not bypass/);
  await page.locator('[data-reward="-0.2"]').click();assert.equal(await txt('#reward-delta'),'Δw = -0.016');
  await fill('#closest-approach','3');assert.match(await txt('#gain-learning-result'),/weaker correction/);
  await page.locator('[data-scenario-select="uncertain"]').click();assert.equal(await txt('#gpu-state'),'GPU awake');
  await page.locator('#mission-progress').evaluate(el=>{el.value='13';el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('.mission-explorer').getAttribute('data-scenario'),'uncertain');
  check('hardware panels, architecture inspector, both learning populations and original mission');

  await fill('#reference-search','0011242');assert.equal(await page.locator('.reference-entry').count(),1);
  await page.locator('a[href="#ref-poster"]').first().click();assert.equal(await page.locator('.reference-entry').count(),22);
  await fill('#distance-speed','5');await page.locator('[data-language="da"]').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'da');assert.equal(await txt('#switch-result'),'8,25');
  assert.equal(await page.locator('#distance-speed').inputValue(),'5');
  assert.equal(await page.locator('[data-component="event"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-language="en"]').click();
  check('searchable citations and preserved state across English/Danish');

  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),[]);
  check('automated WCAG A/AA accessibility scan');

  for(const language of ['en','da'])for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});await page.goto(`${base}/?lang=${language}`,{waitUntil:'networkidle'});
    const dimensions=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,expected:innerWidth}));
    assert.ok(dimensions.actual<=dimensions.expected,`${language} ${width}: page overflow`);
    // Exclude visually hidden MathML while checking actual visible elements.
    const clipped=await page.evaluate(()=>[...document.querySelectorAll('.architecture-node,.cost-table input,.hero h1')].filter(el=>{const r=el.getBoundingClientRect();return r.left<0 || r.right>innerWidth+1}).map(el=>el.outerHTML.slice(0,100)));
    assert.deepEqual(clipped,[],`${language} ${width}: clipped control`);
    if(width===390){await page.locator('.menu-toggle').click();assert.equal(await page.locator('#main-nav').isVisible(),true);await page.locator('#main-nav a[href="#distance"]').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');}
  }
  check('responsive controls and navigation at 320 / 390 / 768 / 1440 px in both languages');
  assert.deepEqual(errors,[]);
  const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1 && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));
  assert.deepEqual(broken,[]);
  check('no browser errors or broken internal citations');
} finally {
  await context.close();await browser.close();
}
