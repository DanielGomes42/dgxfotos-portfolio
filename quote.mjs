export const services = [
  {name:'Fotografia', options:[{name:'Meia diária',price:null},{name:'Diária',price:null}]},
  {name:'Filmmaker', options:[{name:'Meia diária',price:null},{name:'Diária',price:null}]},
  {name:'Drone', options:[{name:'Meia diária',price:null},{name:'Diária',price:null}]},
  {name:'Site', options:[{name:'Por projeto',price:null}]},
  {name:'Landing page', options:[{name:'Por projeto',price:null}]},
  {name:'Aplicativo mobile', options:[{name:'Por projeto',price:null}]}
];

export function calculate(items) {
  let total = 0, pending = 0;
  for (const {price,quantity} of items) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 30) throw new Error('Quantidade deve ser de 1 a 30.');
    if (price === null) pending++;
    else {
      if (!Number.isFinite(price) || price < 0) throw new Error('Preço inválido.');
      total += Math.round(price * 100) * quantity;
    }
  }
  return {total:total / 100,pending};
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#quote-form');
  const rows = document.querySelector('#quote-options');
  const summary = document.querySelector('#quote-summary');
  const request = document.querySelector('#quote-request');
  const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  let text = '';
  for (const [i,service] of services.entries()) {
    const field = document.createElement('fieldset');
    field.innerHTML = `<legend><label><input type="checkbox" name="service-${i}"> ${service.name}</label></legend><label for="mode-${i}">Modalidade</label><select id="mode-${i}" disabled>${service.options.map((o,j)=>`<option value="${j}">${o.name} · ${o.price === null ? 'Sob orçamento' : money(o.price)}</option>`).join('')}</select><label for="quantity-${i}">Quantidade de ${i < 3 ? 'períodos' : 'projetos'}</label><input id="quantity-${i}" type="number" min="1" max="30" step="1" value="1" disabled>`;
    rows.append(field);
  }
  function update() {
    const selected = [];
    for (const [i,service] of services.entries()) {
      const field = rows.children[i];
      const enabled = field.querySelector('[type=checkbox]').checked;
      const select = field.querySelector('select');
      const quantityInput = field.querySelector('[type=number]');
      select.disabled = quantityInput.disabled = !enabled;
      if (enabled) selected.push({...service.options[Number(select.value)],service:service.name,quantity:Number(quantityInput.value)});
    }
    request.disabled = !selected.length || !form.checkValidity();
    if (!form.checkValidity()) {summary.textContent = 'Informe uma quantidade inteira de 1 a 30.'; return;}
    const result = calculate(selected);
    const lines = selected.map(o=>`${o.service} — ${o.name} × ${o.quantity}: ${o.price === null ? 'sob orçamento' : money(o.price * o.quantity)}`);
    const totalLabel = result.pending ? (result.total ? `Subtotal dos itens com preço: ${money(result.total)}. Há serviços sob orçamento.` : 'Valor total sob orçamento.') : `Total estimado: ${money(result.total)}`;
    summary.textContent = selected.length ? `${lines.join('\n')}\n\n${totalLabel}\nDuração, entregas e disponibilidade serão confirmadas na proposta.` : 'Selecione os serviços para montar seu pedido.';
    text = `Olá, DGX Fotos! Gostaria de um orçamento:\n${summary.textContent}`;
  }
  form.addEventListener('input',update);
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if (request.disabled) return;
    const message = document.querySelector('#quote-message');
    message.hidden = false;
    message.value = text;
    try {await navigator.clipboard.writeText(text); request.textContent = 'Pedido copiado! Envie pelo Instagram';}
    catch {message.focus(); message.select(); request.textContent = 'Copie o pedido abaixo';}
  });
  update();
}
