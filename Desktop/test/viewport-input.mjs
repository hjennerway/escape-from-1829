// These controls are already on screen in the fixed smoke-test viewport.
// Chromium's scroll-into-view acknowledgement can wait behind several very
// slow SwiftShader frames. Hit-test the visible control, then send a real mouse
// click directly so user activation (including pointer lock) is preserved.
export async function clickViewportControl(page, selector, {timeout = 120000} = {}) {
  const target = await page.waitForFunction(selector => {
    const element = document.querySelector(selector);
    if (!element || element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true') return false;
    const style = getComputedStyle(element), rect = element.getBoundingClientRect();
    if (style.visibility !== 'visible' || Number(style.opacity) === 0 || rect.width <= 0 || rect.height <= 0) return false;
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight || !element.contains(document.elementFromPoint(x, y))) return false;
    return {x, y};
  }, selector, {polling: 100, timeout});
  const point = await target.jsonValue();
  await target.dispose();
  let timer;
  try {
    await Promise.race([
      page.mouse.click(point.x, point.y),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Mouse input timed out: ${selector}`)), timeout); }),
    ]);
  } finally { clearTimeout(timer); }
}
