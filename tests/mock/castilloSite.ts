import type { Page } from '@playwright/test';
import { CASTILLO_BASE_URL } from '@platforms/castillo/config';

/**
 * A small stand-in for pagoscastillo.com, built from the flow description:
 * same titles, button texts, Knockout ids and Kendo dropdown markup. It lets
 * the page objects run offline. It is not a copy of the real site.
 */
const HTML = String.raw`<!doctype html>
<html><body>
<section id="login">
  <label for="username">Usuario</label><input id="username" name="username" />
  <label for="password">Contraseña</label><input id="password" type="password" />
  <button type="submit" class="btn btn-primary"><i class="fa fa-sign-in"></i> Entrar</button>
</section>
<section id="home" hidden>
  <a href="#" title="Estados y Pagos"><i class="fa fa-money"></i> Estados</a>
  <section id="menu" hidden><a href="#" id="services">Pago de Servicios</a></section>
  <section id="charges" hidden>
    <button id="selectAll" data-bind="events: { click: selectAll }">Marcar todos</button>
    <button id="continue" disabled data-bind="enabled: HasSelectedToPay, events: { click: goToCreditCardData }">Continuar</button>
  </section>
  <section id="card" hidden>
    <label for="creditCardNumber">Número de tarjeta</label><input id="creditCardNumber" />
    <label for="cardHolderName">Nombre en la tarjeta</label><input id="cardHolderName" />
    <div class="form-group"><label>Fecha de Expiración</label>
      <span class="k-dropdown" id="month"><span class="k-input">Mes</span><span class="k-select">▼</span></span>
      <span class="k-dropdown" id="year"><span class="k-input">Año</span><span class="k-select">▼</span></span>
    </div>
    <label for="securityCode">Código de seguridad</label><input id="securityCode" />
    <input type="checkbox" id="policyCheck" /><label for="policyCheck">Acepto términos y condiciones</label>
    <button id="payButton">Pagar</button>
  </section>
  <p id="result" hidden></p>
</section>
<div class="k-animation-container" hidden><ul role="listbox" id="list"></ul></div>
<script>
  const $ = (id) => document.getElementById(id);
  window.payClicks = 0;
  window.pending = PENDING;
  $('login').querySelector('button').onclick = () => { $('login').hidden = true; $('home').hidden = false; };
  document.querySelector('[title="Estados y Pagos"]').onclick = () => { $('menu').hidden = false; };
  $('services').onclick = () => { $('charges').hidden = false; };
  $('selectAll').onclick = () => { $('continue').disabled = !window.pending; };
  $('continue').onclick = () => { $('charges').hidden = true; $('card').hidden = false; };
  const options = {
    month: ['01','02','03','04','05','06','07','08','09','10','11','12'],
    year: ['2026','2027','2028','2029','2030','2031'],
  };
  for (const id of ['month', 'year']) {
    $(id).querySelector('.k-select').onclick = () => {
      $('list').innerHTML = '';
      for (const text of options[id]) {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'k-item';
        li.textContent = text;
        li.onclick = () => { $(id).querySelector('.k-input').textContent = text; $('list').parentElement.hidden = true; };
        $('list').append(li);
      }
      $('list').parentElement.hidden = false;
    };
  }
  $('payButton').onclick = () => { window.payClicks++; $('result').textContent = 'Pago realizado con éxito'; $('result').hidden = false; };
</script>
</body></html>`;

export async function mockCastilloSite(page: Page, { pending = true } = {}): Promise<void> {
  await page.route(`${CASTILLO_BASE_URL}/**`, (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: HTML.replace('PENDING', String(pending)),
    }),
  );
}
