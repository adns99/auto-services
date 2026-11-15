import type { Page } from '@playwright/test';
import { CASTILLO_BASE_URL } from '@platforms/castillo/config';

/**
 * A small stand-in for pagoscastillo.com. The card form mirrors the live
 * markup: Kendo NumericTextBox (hidden real input), Kendo DropDownLists with
 * `aria-owns` popups, and the duplicate desktop/phone `#payButton`s. It lets
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
    <label>Número de Tarjeta de Crédito</label>
    <span class="k-widget k-numerictextbox"><span class="k-numeric-wrap">
      <input type="text" class="k-formatted-value k-input" />
      <input id="creditCardNumber" name="creditCardNumber" maxlength="16" data-role="numerictextbox" role="spinbutton" class="k-input" type="text" style="display:none" />
    </span></span>
    <label>Fecha de Expiración</label>
    <span class="k-widget k-dropdown" role="listbox" aria-owns="expirationMonth_listbox" tabindex="0">
      <span class="k-dropdown-wrap"><span class="k-input">01</span><span class="k-select">select</span></span>
      <select id="expirationMonth" style="display:none"></select>
    </span>
    <span class="k-widget k-dropdown" role="listbox" aria-owns="expirationYear_listbox" tabindex="0">
      <span class="k-dropdown-wrap"><span class="k-input">2026</span><span class="k-select">select</span></span>
      <select id="expirationYear" style="display:none"></select>
    </span>
    <label>Nombre del Titular</label><input id="cardHolderName" class="k-textbox" />
    <label>Código de Seguridad</label><input id="securityCode" class="k-textbox" maxlength="4" />
    <input type="checkbox" id="policyCheck" /><label>He leído y acepto las Políticas de Privacidad</label>
    <button id="payButton" type="button"><i class="fa fa-arrow-circle-right"></i> Pagar</button>
    <button id="payButton" type="button" style="display:none"><i class="fa fa-arrow-circle-right"></i> Pagar</button>
  </section>
  <p id="result" hidden></p>
</section>
<div class="k-animation-container" style="display:none"><ul role="listbox" id="expirationMonth_listbox" aria-hidden="true"></ul></div>
<div class="k-animation-container" style="display:none"><ul role="listbox" id="expirationYear_listbox" aria-hidden="true"></ul></div>
<script>
  const $ = (id) => document.getElementById(id);
  window.payClicks = 0;
  window.pending = PENDING;
  $('login').querySelector('button').onclick = () => { $('login').hidden = true; $('home').hidden = false; };
  document.querySelector('[title="Estados y Pagos"]').onclick = () => { $('menu').hidden = false; };
  $('services').onclick = () => { $('charges').hidden = false; };
  $('selectAll').onclick = () => { $('continue').disabled = !window.pending; };
  $('continue').onclick = () => { $('charges').hidden = true; $('card').hidden = false; };

  // Kendo NumericTextBox: the real input only shows while focused.
  const formatted = document.querySelector('.k-formatted-value');
  const number = $('creditCardNumber');
  formatted.onfocus = () => { formatted.style.display = 'none'; number.style.display = ''; number.focus(); };
  number.onblur = () => { number.style.display = 'none'; formatted.style.display = ''; formatted.value = number.value; };

  // Kendo DropDownList: clicking the wrapper opens a popup list attached to <body>.
  const options = {
    expirationMonth: ['01','02','03','04','05','06','07','08','09','10','11','12'],
    expirationYear: ['2026','2027','2028','2029','2030','2031'],
  };
  for (const id of Object.keys(options)) {
    const select = $(id);
    const list = $(id + '_listbox');
    const widget = document.querySelector('[aria-owns="' + id + '_listbox"]');
    for (const text of options[id]) {
      select.add(new Option(text, text));
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.className = 'k-item';
      li.textContent = text;
      li.onclick = (event) => {
        event.stopPropagation();
        select.value = text;
        widget.querySelector('.k-input').textContent = text;
        list.parentElement.style.display = 'none';
        list.setAttribute('aria-hidden', 'true');
      };
      list.append(li);
    }
    widget.onclick = () => { list.parentElement.style.display = ''; list.setAttribute('aria-hidden', 'false'); };
  }
  for (const button of document.querySelectorAll('#payButton')) {
    button.onclick = () => { window.payClicks++; $('result').textContent = 'Pago realizado con éxito'; $('result').hidden = false; };
  }
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
