/* --------------------------------------------------
   FLOORS + RATES
-------------------------------------------------- */
const floors = [
  { name: 'Basement',  rate: 60, prefix: 'B'  },
  { name: '2nd Floor', rate: 50, prefix: '2F' },
  { name: '3rd Floor', rate: 45, prefix: '3F' }
];

/* create 20 slots per floor */
floors.forEach(f => {
  f.slots = Array.from({ length: 20 }, (_, i) => ({
    id: `${f.prefix}-${i + 1}`,
    available: Math.random() > 0.3   // 70 % chance free
  }));
});

/* --------------------------------------------------
   DOM REFERENCES
-------------------------------------------------- */
const floorsDiv  = document.getElementById('floors');
const proceedBtn = document.getElementById('proceedBtn');
let selected = null; // will hold { slot, cost, btn }

/* --------------------------------------------------
   RENDER GRID
-------------------------------------------------- */
floors.forEach(floor => {
  const card = document.createElement('div');
  card.className = 'floor-card';
  card.innerHTML = `
    <div class="floor-header">
      <h2>${floor.name}</h2>
      <span class="rate">₱${floor.rate}/hr</span>
    </div>`;

  const grid = document.createElement('div');
  grid.className = 'slot-grid';

  floor.slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.textContent = slot.id.split('-')[1];
    btn.className = `slot ${slot.available ? 'available' : 'taken'}`;

    if (slot.available) {
      btn.addEventListener('click', () => choose(slot, btn, floor.rate));
    }

    grid.appendChild(btn);
  });

  card.appendChild(grid);
  floorsDiv.appendChild(card);
});

/* --------------------------------------------------
   CHOOSE A SLOT
-------------------------------------------------- */
function choose(slot, btn, cost) {
  if (selected) selected.btn.classList.remove('selected');

  selected = { slot, cost, btn };
  btn.classList.add('selected');

  proceedBtn.disabled = false;
  proceedBtn.classList.add('enabled');
}

/* --------------------------------------------------
   PROCEED BUTTON CLICK
-------------------------------------------------- */
proceedBtn.addEventListener('click', () => {
  if (!selected) return;

  const driver = JSON.parse(sessionStorage.getItem('driver') || '{}');

  if (!driver.name || !driver.plate) {
    alert('Driver details missing. Please fill the form first.');
    window.location = 'form.html';
    return;
  }

  const booking = {
    name : driver.name,
    plate: driver.plate,
    slot : selected.slot.id,
    cost : selected.cost
  };

  sessionStorage.setItem('booking', JSON.stringify(booking));
  window.location = 'summary.html';
});
