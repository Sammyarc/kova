export default {
  selectors: {
    hero: '.hero',
    heroItems: '.hero__copy, .hero__stage'
  },
  bookSelector: '.header__right [data-dialog="open"]',
  menuTarget: '#pricing',
  interactions: {
    'converter: two-way amounts, currency, delivery method': async (p, assert) => {
      const send = p.locator('[data-amt="send"]'), get = p.locator('[data-amt="get"]');
      await send.scrollIntoViewIfNeeded();
      await send.fill('1000');
      assert.equal(await get.inputValue(), '2,069,100', 'pounds convert to naira');
      assert.match(await p.locator('[data-send-total]').textContent(), /Send £1,000\.99/);
      assert.match(await p.locator('[data-compare-title]').textContent(), /£1,000 to Lagos/);
      await get.fill('206910');
      assert.equal(await send.inputValue(), '100.00', 'naira converts back to pounds');
      assert.ok(await p.locator('[data-swap]').evaluate((s) => s.classList.contains('is-flipped')), 'swap icon flips with the edited side');
      await p.locator('[data-to]').selectOption('GHS');
      assert.match(await p.locator('[data-rate-line]').textContent(), /GH₵19\.42/);
      assert.match(await p.locator('[data-compare-title]').textContent(), /Accra/);
      await p.locator('[data-method="cash"]').click();
      assert.equal(await p.locator('[data-method="cash"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await p.locator('[data-fee]').textContent(), '£1.99');
      assert.equal(await p.locator('[data-eta]').textContent(), 'Within the hour');
    },
    'savings calculator updates projections': async (p, assert) => {
      const range = p.locator('[data-calc-input]');
      await range.scrollIntoViewIfNeeded();
      await range.fill('1000');
      assert.equal(await p.locator('[data-calc-out]').textContent(), '$1,000');
      assert.equal(await range.getAttribute('aria-valuetext'), '$1,000 a month');
      assert.equal(await p.locator('[data-years="1"]').textContent(), '$12,250');
    },
    'billing switch changes plan prices': async (p, assert) => {
      const sw = p.locator('[data-billing]');
      await sw.scrollIntoViewIfNeeded();
      await sw.click();
      assert.equal(await sw.getAttribute('aria-checked'), 'true');
      assert.equal(await p.locator('.plan--hot .plan__price strong').textContent(), '£49.90');
      await sw.click();
      assert.equal(await p.locator('.plan--hot .plan__price strong').textContent(), '£4.99');
    },
    'nav pill follows the section in view': async (p, assert) => {
      await p.evaluate(() => document.getElementById('pricing').scrollIntoView());
      await p.waitForTimeout(400);
      assert.equal(await p.locator('.nav a.is-on').getAttribute('href'), '#pricing');
    },
    'footer wordmark fills the width and is cut off at the bottom': async (p, assert) => {
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(400);
      const m = await p.evaluate(() => {
        const w = document.querySelector('[data-word]').getBoundingClientRect(), f = document.querySelector('.footer').getBoundingClientRect();
        return { ww: w.width, fw: f.width, wb: w.bottom, fb: f.bottom, h: w.height };
      });
      assert.ok(m.ww > m.fw * 0.94, `wordmark spans the footer (${Math.round(m.ww)} of ${Math.round(m.fw)})`);
      assert.ok(m.wb > m.fb + m.h * 0.15, 'its lower part runs past the bottom edge');
    }
  }
};
