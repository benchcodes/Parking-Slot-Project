/* --------------------------------------------------
   FLOORS + RATES (Base rates for first 4 hours)
-------------------------------------------------- */
// Price structure: base rate for first 4 hours by vehicle type
const floors = [
  { name: '2nd Floor', rates: { car: 60, motorcycle: 50, bicycle: 20 }, prefix: '2F'  },
  { name: '1st Floor', rates: { car: 60, motorcycle: 50, bicycle: 20 }, prefix: '1F'  },
  { name: 'Ground Floor', rates: { car: 60, motorcycle: 50, bicycle: 20 }, prefix: 'G'  },
  { name: 'Basement Level 1', rates: { car: 60, motorcycle: 50, bicycle: 20 }, prefix: 'B1' },
  { name: 'Basement Level 2', rates: { car: 60, motorcycle: 50, bicycle: 20 }, prefix: 'B2' }
];

/* create slots per floor (matching form.html capacity) */
const slotCounts = [40, 50, 40, 60, 60]; // slots for each floor
floors.forEach((f, index) => {
  f.slots = Array.from({ length: slotCounts[index] }, (_, i) => ({
    id: `${f.prefix}-${i + 1}`,
    available: true
  }));
});

/* --------------------------------------------------
   DOM REFERENCES & VEHICLE TYPE
-------------------------------------------------- */
const floorsDiv     = document.getElementById('floors');
const floorButtons  = document.getElementById('floorButtons');
const vehicleButtons = document.getElementById('vehicleButtons');
const proceedBtn    = document.getElementById('proceedBtn');
const startDateTime = document.getElementById('startDateTime');
const endDateTime   = document.getElementById('endDateTime');
const durationDisplay = document.getElementById('durationDisplay');

let selected        = null; // will hold { slot, cost, btn }
let currentFloor    = 0;    // track current floor
let vehicleType     = sessionStorage.getItem('vehicleType') || 'car'; // get vehicle type
let parkingDuration = 0;    // hours
let totalCost       = 0;

// Available vehicle types
const vehicleTypes = ['car', 'motorcycle', 'bicycle'];
const vehicleEmojis = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲' };
const vehicleLabels = { car: 'Car', motorcycle: 'Motorcycle', bicycle: 'Bicycle' };

/* --------------------------------------------------
   CALCULATE COST BASED ON DURATION
-------------------------------------------------- */
function calculateCost(hours, vehicleType) {
  const baseRate = floors[0].rates[vehicleType]; // First 4 hours rate
  
  if (hours <= 4) {
    return baseRate;
  } else {
    const extraHours = hours - 4;
    return baseRate + (extraHours * 10);
  }
}

/* --------------------------------------------------
   HANDLE DATE/TIME CHANGES
-------------------------------------------------- */
function updateDuration() {
  if (startDateTime.value && endDateTime.value) {
    const start = new Date(startDateTime.value);
    const end = new Date(endDateTime.value);
    
    if (end <= start) {
      durationDisplay.textContent = 'End time must be after start time';
      durationDisplay.className = 'duration-display show';
      durationDisplay.style.background = '#fee2e2';
      durationDisplay.style.color = '#dc2626';
      parkingDuration = 0;
      totalCost = 0;
      if (selected) {
        proceedBtn.disabled = true;
        proceedBtn.classList.remove('enabled');
      }
      return;
    }
    
    const diffMs = end - start;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Round up to next hour
    parkingDuration = diffHours;
    totalCost = calculateCost(diffHours, vehicleType);
    
    durationDisplay.textContent = `Duration: ${diffHours} hour${diffHours > 1 ? 's' : ''} | Total Cost: ₱${totalCost}`;
    durationDisplay.className = 'duration-display show';
    durationDisplay.style.background = '#eff6ff';
    durationDisplay.style.color = '#0a53be';
    
    // Update proceed button state
    if (selected) {
      proceedBtn.disabled = false;
      proceedBtn.classList.add('enabled');
    }
  } else {
    durationDisplay.className = 'duration-display';
    parkingDuration = 0;
    totalCost = 0;
  }
}

startDateTime.addEventListener('change', updateDuration);
endDateTime.addEventListener('change', updateDuration);

/* --------------------------------------------------
   CREATE VEHICLE TYPE BUTTONS
-------------------------------------------------- */
vehicleTypes.forEach(type => {
  const btn = document.createElement('button');
  btn.className = `vehicle-btn ${type === vehicleType ? 'active' : ''}`;
  btn.innerHTML = `<span>${vehicleEmojis[type]}</span><span>${vehicleLabels[type]}</span>`;
  btn.addEventListener('click', () => switchVehicle(type));
  vehicleButtons.appendChild(btn);
});

/* --------------------------------------------------
   SWITCH VEHICLE FUNCTION
-------------------------------------------------- */
function switchVehicle(type) {
  vehicleType = type;
  sessionStorage.setItem('vehicleType', vehicleType);
  selected = null; // reset selection
  proceedBtn.disabled = true;
  proceedBtn.classList.remove('enabled');

  // Update vehicle button states
  document.querySelectorAll('.vehicle-btn').forEach((btn, i) => {
    btn.classList.toggle('active', vehicleTypes[i] === type);
  });

  // Update floor button prices
  document.querySelectorAll('.floor-btn').forEach((btn, i) => {
    const rate = floors[i].rates[vehicleType];
    btn.querySelector('.floor-rate').textContent = `₱${rate} (first 4hrs)`;
  });

  // Recalculate cost if duration is set
  updateDuration();

  // Re-render current floor with new prices
  renderFloor(currentFloor);
}

/* --------------------------------------------------
   CREATE FLOOR BUTTONS
-------------------------------------------------- */
floors.forEach((floor, index) => {
  const btn = document.createElement('button');
  btn.className = `floor-btn ${index === 0 ? 'active' : ''}`;
  const rate = floor.rates[vehicleType];
  btn.innerHTML = `
    <div class="floor-name">${floor.name}</div>
    <div class="floor-rate">₱${rate} (first 4hrs)</div>
  `;
  btn.addEventListener('click', () => switchFloor(index));
  floorButtons.appendChild(btn);
});

/* --------------------------------------------------
   SWITCH FLOOR FUNCTION
-------------------------------------------------- */
function switchFloor(index) {
  currentFloor = index;
  selected = null; // reset selection
  proceedBtn.disabled = true;
  proceedBtn.classList.remove('enabled');

  // Update button states
  document.querySelectorAll('.floor-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  // Re-render slots for selected floor
  renderFloor(index);
}

function renderFloor(index) {
  floorsDiv.innerHTML = ''; // clear previous
  
  const floor = floors[index];
  const rate = floor.rates[vehicleType];
  const card = document.createElement('div');
  card.className = 'floor-card';
  card.innerHTML = `
    <div class="floor-header">
      <h2>${floor.name}</h2>
      <span class="rate">₱${rate} (first 4hrs) + ₱10/hr after</span>
    </div>`;

  const grid = document.createElement('div');
  grid.className = 'slot-grid';

  floor.slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.textContent = slot.id.split('-')[1];
    btn.className = `slot ${slot.available ? 'available' : 'taken'}`;

    if (slot.available) {
      btn.addEventListener('click', () => choose(slot, btn, rate));
    }

    grid.appendChild(btn);
  });

  card.appendChild(grid);
  floorsDiv.appendChild(card);
}

/* --------------------------------------------------
   INITIALIZE - SHOW SELECTED OR FIRST FLOOR
-------------------------------------------------- */
const selectedFloor = sessionStorage.getItem('selectedFloor');
const floorIndex = selectedFloor ? parseInt(selectedFloor) : 0;

// Highlight the selected floor button
if (selectedFloor) {
  document.querySelectorAll('.floor-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === floorIndex);
  });
}

renderFloor(floorIndex);

/* --------------------------------------------------
   CHOOSE A SLOT
-------------------------------------------------- */
function choose(slot, btn, cost) {
  if (selected) selected.btn.classList.remove('selected');

  selected = { slot, cost, btn };
  btn.classList.add('selected');

  // Enable proceed button only if datetime is also set
  if (parkingDuration > 0 && startDateTime.value && endDateTime.value) {
    proceedBtn.disabled = false;
    proceedBtn.classList.add('enabled');
  } else {
    proceedBtn.disabled = true;
    proceedBtn.classList.remove('enabled');
  }
}

/* --------------------------------------------------
   PROCEED BUTTON CLICK
-------------------------------------------------- */
proceedBtn.addEventListener('click', () => {
  if (!selected) return;
  
  if (!startDateTime.value || !endDateTime.value || parkingDuration === 0) {
    alert('Please select start and end date/time.');
    return;
  }

  const driver = JSON.parse(sessionStorage.getItem('driver') || '{}');

  if (!driver.name || !driver.plate) {
    alert('Driver details missing. Please fill the form first.');
    window.location = 'form.html';
    return;
  }

  const booking = {
    name : driver.name,
    plate: driver.plate,
    vehicleType: vehicleType,
    slot : selected.slot.id,
    startDateTime: startDateTime.value,
    endDateTime: endDateTime.value,
    duration: parkingDuration,
    cost : totalCost
  };

  sessionStorage.setItem('booking', JSON.stringify(booking));
  window.location = 'summary.html';
});
