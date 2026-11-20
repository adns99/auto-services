import type { Page } from '@playwright/test';
import { CLARO_BASE_URL } from '@platforms/claro/config';

export interface ClaroMockOptions {
  /** Shown as "Total - ₡ <total>". */
  total?: string;
  pending?: boolean;
  /** Where the mock rejects the payment: right after "Pagar" or after "Continuar". */
  decline?: 'pay' | 'confirm' | false;
}

/**
 * A small stand-in for cr.mipagoclaro.com with the ids and data-testids the flow
 * uses. The phone and expiry inputs reformat what is typed, like masked inputs do.
 * It lets the page objects run offline. It is not a copy of the real site.
 */
const HTML = String.raw`<!doctype html>
<html><body>
<section id="lookup">
  <input type="radio" name="type" id="ServiceNumber" checked /><label for="ServiceNumber">Número de servicio</label>
  <input type="radio" name="type" id="MobileNumber" /><label for="MobileNumber">Número móvil</label>
  <input id="phone__input" type="tel" inputmode="numeric" />
  <button data-testid="accept-button" disabled>Aceptar</button>
</section>
<section id="invoice" hidden>
  <h2>Saldo de factura por vencer</h2>
  <div class="row"><span>Subtotal</span> <span>₡ 1.00</span></div>
  <div class="row"><span>Total -</span> <span>₡ TOTAL</span></div>
  <button data-testid="invoices__pay-button">Otro medio de pago</button>
</section>
<section id="paid-up" hidden><p>No tiene facturas pendientes</p></section>
<form id="card" hidden onsubmit="return false">
  <input data-testid="qa_ceCla_servicePay_input_card_number" maxlength="19" />
  <input data-testid="qa_ceCla_servicePay_input_expiration" placeholder="MM/YY" maxlength="5" />
  <input data-testid="qa_ceCla_servicePay_input_cvv" maxlength="4" />
  <input data-testid="qa_ceCla_servicePay_input_email" type="email" />
  <button id="continueButton" type="submit" class="submit button-continue">Pagar</button>
</form>
<p id="result" hidden></p>
<script>
  const $ = (id) => document.getElementById(id);
  const byTestId = (id) => document.querySelector('[data-testid="' + id + '"]');
  const digits = (value) => value.replace(/\D/g, '');
  window.payClicks = 0;
  window.confirmClicks = 0;
  window.submitted = null;
  const options = OPTIONS;

  const phone = $('phone__input');
  const accept = byTestId('accept-button');
  phone.addEventListener('input', () => {
    const d = digits(phone.value).slice(0, 8);
    phone.value = d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
    accept.disabled = !$('MobileNumber').checked || d.length !== 8;
  });
  accept.onclick = () => {
    $('lookup').hidden = true;
    (options.pending ? $('invoice') : $('paid-up')).hidden = false;
  };
  byTestId('invoices__pay-button').onclick = () => { $('invoice').hidden = true; $('card').hidden = false; };

  const expiry = byTestId('qa_ceCla_servicePay_input_expiration');
  expiry.addEventListener('input', () => {
    const d = digits(expiry.value).slice(0, 4);
    expiry.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });

  // "Pagar" and the next step's "Continuar" share id="continueButton", like the live site.
  const result = (text, error) => {
    $('result').textContent = text;
    if (error) $('result').setAttribute('role', 'alert');
    $('result').hidden = false;
  };
  $('continueButton').onclick = () => {
    window.payClicks++;
    window.submitted = {
      card: byTestId('qa_ceCla_servicePay_input_card_number').value,
      expiry: expiry.value,
      email: byTestId('qa_ceCla_servicePay_input_email').value,
    };
    $('card').hidden = true;
    if (options.decline === 'pay') return result('Tarjeta inválida, verifique los datos', true);
    const confirm = document.createElement('button');
    confirm.id = 'continueButton';
    confirm.type = 'button';
    confirm.className = 'submit button-continue';
    confirm.textContent = 'Continuar';
    confirm.onclick = () => {
      window.confirmClicks++;
      confirm.remove();
      if (options.decline === 'confirm') result('Transacción rechazada por el banco emisor', true);
      else result('Pago realizado con éxito');
    };
    document.body.append(confirm);
  };
</script>
</body></html>`;

export async function mockClaroSite(
  page: Page,
  { total = '34,424.00', pending = true, decline = false }: ClaroMockOptions = {},
): Promise<void> {
  const body = HTML.replace('TOTAL', total).replace(
    'OPTIONS',
    JSON.stringify({ pending, decline }),
  );
  await page.route(`${CLARO_BASE_URL}/**`, (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body }),
  );
}
