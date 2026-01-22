async function loadConfig(){
  const res = await fetch('assets/config.json');
  return await res.json();
}

function moneyRange([a,b], currency){
  const fmt = new Intl.NumberFormat('en-CA', {style:'currency', currency, maximumFractionDigits:0});
  return `${fmt.format(a)} – ${fmt.format(b)}`;
}

function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }

function calc(config, inputs){
  const {currency, labor_per_sqft, materials, add_ons} = config;
  const mat = materials[inputs.material];
  const sqft = clamp(inputs.sqft, 5, 500);
  const matLow = mat.per_sqft[0]*sqft;
  const matHigh = mat.per_sqft[1]*sqft;

  const laborLow = labor_per_sqft[0]*sqft;
  const laborHigh = labor_per_sqft[1]*sqft;

  let addLow = 0, addHigh = 0;
  for(const k of inputs.addons){
    if(add_ons[k]){
      addLow += add_ons[k][0];
      addHigh += add_ons[k][1];
    }
  }

  // small buffer for seams/edges/handling (rough)
  const bufferLow = 0.05*(matLow+laborLow);
  const bufferHigh = 0.12*(matHigh+laborHigh);

  const totalLow = Math.round(matLow + laborLow + addLow + bufferLow);
  const totalHigh = Math.round(matHigh + laborHigh + addHigh + bufferHigh);

  return {
    material: [Math.round(matLow), Math.round(matHigh)],
    labor: [Math.round(laborLow), Math.round(laborHigh)],
    add_ons: [Math.round(addLow), Math.round(addHigh)],
    buffer: [Math.round(bufferLow), Math.round(bufferHigh)],
    total: [totalLow, totalHigh],
    currency
  };
}

function getSelectedAddons(){
  return Array.from(document.querySelectorAll('input[name="addon"]:checked')).map(i => i.value);
}

function serializeLead(inputs, breakdown){
  const lines = [
    `Name: ${inputs.name || ''}`,
    `Phone: ${inputs.phone || ''}`,
    `Email: ${inputs.email || ''}`,
    `City/Postal: ${inputs.location || ''}`,
    `Material: ${inputs.material}`,
    `Approx. size (sq ft): ${inputs.sqft}`,
    `Add-ons: ${inputs.addons.join(', ') || 'None'}`,
    ``,
    `Estimate range: ${moneyRange(breakdown.total, breakdown.currency)}`,
    `Breakdown:`,
    `- Material: ${moneyRange(breakdown.material, breakdown.currency)}`,
    `- Labor: ${moneyRange(breakdown.labor, breakdown.currency)}`,
    `- Add-ons: ${moneyRange(breakdown.add_ons, breakdown.currency)}`,
    `- Buffer: ${moneyRange(breakdown.buffer, breakdown.currency)}`
  ];
  return lines.join('\n');
}

function mailtoLink(to, subject, body){
  const enc = (s) => encodeURIComponent(s);
  return `mailto:${enc(to)}?subject=${enc(subject)}&body=${enc(body)}`;
}

(async function(){
  const config = await loadConfig();

  // populate materials
  const matSel = document.querySelector('#material');
  if(matSel){
    Object.keys(config.materials).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      matSel.appendChild(opt);
    });
  }

  const addonsWrap = document.querySelector('#addons');
  if(addonsWrap){
    Object.keys(config.add_ons).forEach(name => {
      const row = document.createElement('label');
      row.className = 'chip';
      row.innerHTML = `<input type="checkbox" name="addon" value="${name}" style="width:auto;margin:0 6px 0 0"> ${name} <span class="muted">(${moneyRange(config.add_ons[name], config.currency)})</span>`;
      addonsWrap.appendChild(row);
    });
  }

  const disc = document.querySelector('#disclaimer');
  if(disc) disc.textContent = config.disclaimer;

  const form = document.querySelector('#estimateForm');
  const out = document.querySelector('#estimateOutput');

  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = {
        name: document.querySelector('#name').value.trim(),
        phone: document.querySelector('#phone').value.trim(),
        email: document.querySelector('#email').value.trim(),
        location: document.querySelector('#location').value.trim(),
        material: document.querySelector('#material').value,
        sqft: parseFloat(document.querySelector('#sqft').value || '0'),
        addons: getSelectedAddons()
      };

      const breakdown = calc(config, inputs);

      if(out){
        out.innerHTML = `
          <div class="notice"><strong>Your rough estimate:</strong> ${moneyRange(breakdown.total, breakdown.currency)}</div>
          <table class="table" aria-label="Estimate breakdown">
            <tr><td><strong>Material</strong></td><td>${moneyRange(breakdown.material, breakdown.currency)}</td></tr>
            <tr><td><strong>Labor</strong></td><td>${moneyRange(breakdown.labor, breakdown.currency)}</td></tr>
            <tr><td><strong>Add-ons</strong></td><td>${moneyRange(breakdown.add_ons, breakdown.currency)}</td></tr>
            <tr><td><strong>Range buffer</strong></td><td>${moneyRange(breakdown.buffer, breakdown.currency)}</td></tr>
            <tr><td><strong>Total range</strong></td><td>${moneyRange(breakdown.total, breakdown.currency)}</td></tr>
          </table>
        `;
      }

      const to = document.querySelector('meta[name="lead-email"]').getAttribute('content');
      const subject = `Countertop Estimate Request – ${inputs.location || 'New lead'}`;
      const leadText = serializeLead(inputs, breakdown);
      const link = mailtoLink(to, subject, leadText);

      const send = document.querySelector('#sendLead');
      if(send){
        send.href = link;
        send.style.display = 'inline-flex';
      }

      const save = document.querySelector('#saveLead');
      if(save){
        save.onclick = () => {
          const key = 'countertop_leads';
          const arr = JSON.parse(localStorage.getItem(key) || '[]');
          arr.push({ts: Date.now(), inputs, breakdown});
          localStorage.setItem(key, JSON.stringify(arr));
          alert('Saved locally on this device.');
        };
        save.style.display = 'inline-flex';
      }

      window.scrollTo({top: out.offsetTop - 90, behavior: 'smooth'});
    });
  }
})();
