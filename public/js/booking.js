/* ================================
   FREE CONSULTATION BOOKING
================================ */
var hour = 4;
var minute = 0;
var isPM = false;

const STEP = 15; // Standard 15-min steps
var RANGE_START = 4 * 60;      // 4:00 AM
var RANGE_END = 26 * 60;       // 2:00 AM (next day)

function openBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    modal.style.display = 'flex';

    var dateInput = document.getElementById("appointmentDate");
    var now = new Date();
    var today = now.toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;

    // Set current time
    let currentHour24 = now.getHours();
    let currentMinutes = now.getMinutes();

    // Round to nearest STEP (10 mins)
    currentMinutes = Math.round(currentMinutes / STEP) * STEP;
    if (currentMinutes === 60) {
        currentMinutes = 0;
        currentHour24 = (currentHour24 + 1) % 24;
    }

    // Convert to 12h format for state
    isPM = currentHour24 >= 12;
    hour = currentHour24 % 12;
    if (hour === 0) hour = 12;
    minute = currentMinutes;

    // Check if current time is within 4 AM - 2 AM range
    var selectedMinutes = (hour % 12) * 60 + minute + (isPM ? 720 : 0);
    var logicalMinutes = selectedMinutes < RANGE_START ? selectedMinutes + 1440 : selectedMinutes;

    if (logicalMinutes < RANGE_START || logicalMinutes > RANGE_END) {
        // Default back to 4 AM if outside range
        hour = 4; minute = 0; isPM = false;
    }

    updateTimeDisplay();
}

function closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (modal) modal.style.display = 'none';
}



function addMinutes(mins) {
    var selectedMinutes = (hour % 12) * 60 + minute + (isPM ? 720 : 0);
    var logicalMinutes = selectedMinutes < RANGE_START ? selectedMinutes + 1440 : selectedMinutes;

    logicalMinutes += mins;

    if (logicalMinutes < RANGE_START || logicalMinutes > RANGE_END) {
        return; // Bound to range
    }

    var totalMinutes = logicalMinutes % 1440;
    isPM = totalMinutes >= 720;
    var h24 = Math.floor(totalMinutes / 60);
    minute = totalMinutes % 60;
    hour = h24 % 12;
    if (hour === 0) hour = 12;
    updateTimeDisplay();
}

function timeUp() { addMinutes(STEP); }
function timeDown() { addMinutes(-STEP); }

function updateTimeDisplay() {
    const timeDisplayEl = document.getElementById("freeTimeDisplay");
    if (timeDisplayEl) {
        timeDisplayEl.innerText =
            (hour < 10 ? "0" : "") + hour + ":" +
            (minute < 10 ? "0" : "") + minute + " " +
            (isPM ? "PM" : "AM");
    }
}

async function bookNow() {
    var dateInput = document.getElementById("appointmentDate");
    var date = dateInput.value;
    const errEl = document.getElementById('freeBookingError');
    if (errEl) errEl.classList.add('hidden');

    if (!date) {
        if (errEl) { errEl.textContent = '⚠️ Please select a date.'; errEl.classList.remove('hidden'); }
        return;
    }

    var selectedMinutes = (hour % 12) * 60 + minute + (isPM ? 720 : 0);
    var logicalMinutes = selectedMinutes < RANGE_START ? selectedMinutes + 1440 : selectedMinutes;

    if (logicalMinutes < RANGE_START || logicalMinutes > RANGE_END) {
        if (errEl) { errEl.textContent = '⚠️ Booking allowed only between 4:00 AM and 2:00 AM.'; errEl.classList.remove('hidden'); }
        hour = 4; minute = 0; isPM = false;
        updateTimeDisplay();
        return;
    }

    var now = new Date();
    var bookingTime = new Date(date);
    var hour24 = hour % 12;
    if (isPM) hour24 += 12;
    bookingTime.setHours(hour24, minute, 0, 0);

    if (bookingTime <= now) {
        if (errEl) { errEl.textContent = '⚠️ The selected time has already passed. Please pick a future time.'; errEl.classList.remove('hidden'); }
        return;
    }

    var timeText = document.getElementById("freeTimeDisplay").innerText;
    var msg = `🅃🄵🄶 Hello Tax Filing Guru,
📞 I would like to Schedule a free consultation
📅 Date: ${date}
⏰ Time: ${timeText}
Please assist me with the process.`;

    trackWhatsAppClick('booking_modal', 'Free Consultation', { date, time: timeText });

    // Save to MongoDB
    try {
        const saveRes = await fetch('/api/book-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'Free Consultation',
                date: date,
                time: timeText,
                duration: 15,
                amount: '0'
            })
        });
        const saveData = await saveRes.json();
        if (!saveData.success) {
            if (errEl) { errEl.textContent = '⚠️ Booking could not be saved: ' + (saveData.error || 'Unknown error'); errEl.classList.remove('hidden'); }
            return;
        }
    } catch (err) {
        console.error('Booking save error:', err);
        if (errEl) { errEl.textContent = '⚠️ Could not connect to server. Please try again.'; errEl.classList.remove('hidden'); }
        return;
    }

    closeBookingModal();
    window.open(`https://api.whatsapp.com/send?phone=919811945176&text=${encodeURIComponent(msg)}`, '_blank');
}

/* ================================
   VIDEO CONSULTATION BOOKING
================================ */
let vcSelectedDuration = null;
let vcHour = 4;
let vcMinute = 0;
let vcIsPM = false;

// Returns the step size (in minutes) based on selected duration
function vcGetStep() {
    if (vcSelectedDuration === 90) return 90;
    return 45; // default & 45-min duration
}

// Snaps a total-minutes value to the nearest valid slot aligned to 'step',
// starting at 4:00 AM (240 mins). Returns clamped minutes within [240, 1560].
function vcSnapToSlot(totalMins, step) {
    const START = 4 * 60;  // 240 = 4:00 AM
    const END   = 26 * 60; // 1560 = 2:00 AM next day

    // Convert to logical minutes (4AM=0, 2AM next day = 22*60)
    let logical = totalMins < START ? totalMins + 1440 : totalMins;
    logical = Math.round((logical - START) / step) * step + START;
    if (logical < START) logical = START;
    if (logical > END)   logical = END;
    return logical % 1440; // convert back to clock minutes
}

function vcOpenBooking() {
    const overlay = document.getElementById("bookingOverlay");
    const tab = document.getElementById("rightTab");
    const closeTab = document.getElementById("closeTab");

    vcSetMinDate();

    // Start at current time snapped to the nearest slot, fall back to 4AM if out of range
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const step = vcGetStep();
    const START = 4 * 60;   // 240
    const END   = 26 * 60;  // 1560

    // Snap current time UP to the next valid slot on the 4AM grid
    let logical = nowMins < START ? nowMins + 1440 : nowMins;
    logical = Math.ceil((logical - START) / step) * step + START;

    if (logical < START || logical > END) {
        // Outside allowed window — default to 4:00 AM
        vcHour = 4; vcMinute = 0; vcIsPM = false;
    } else {
        const snappedMins = logical % 1440;
        vcIsPM = snappedMins >= 720;
        const h24 = Math.floor(snappedMins / 60);
        vcMinute = snappedMins % 60;
        vcHour = h24 % 12 || 12;
    }

    vcUpdateTimeDisplay();
    vcBackToForm(); // Ensure we start at form step

    overlay.classList.remove("hidden");
    closeTab.classList.remove("hidden");

    requestAnimationFrame(() => {
        overlay.classList.add("show");
        closeTab.classList.add("show");
    });
    tab.classList.add("hide");
}

function vcCloseBooking() {
    const overlay = document.getElementById("bookingOverlay");
    const tab = document.getElementById("rightTab");
    const closeTab = document.getElementById("closeTab");

    overlay.classList.remove("show");
    closeTab.classList.remove("show");

    setTimeout(() => {
        overlay.classList.add("hidden");
        closeTab.classList.add("hidden");
        tab.classList.remove("hide");
    });
}

function vcSetMinDate() {
    const dateInput = document.getElementById("datePicker");
    if (!dateInput) return;
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
}

function vcSelectDuration(minutes) {
    vcSelectedDuration = minutes;

    // Snap current time to the nearest valid slot for the new duration
    const step = minutes; // step matches duration
    const currentTotalMins = (vcHour % 12) * 60 + vcMinute + (vcIsPM ? 720 : 0);
    const snapped = vcSnapToSlot(currentTotalMins, step);

    vcIsPM = snapped >= 720;
    const h24 = Math.floor(snapped / 60);
    vcMinute = snapped % 60;
    vcHour = h24 % 12;
    if (vcHour === 0) vcHour = 12;

    document.querySelectorAll(".duration button").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById(minutes === 45 ? "d45" : "d90");
    if (btn) btn.classList.add("active");
    vcUpdateTimeDisplay();
}

function vcUpdateTimeDisplay() {
    const display = document.getElementById("timeDisplay");
    if (!display) return;
    const hh = vcHour < 10 ? "0" + vcHour : vcHour;
    const mm = vcMinute < 10 ? "0" + vcMinute : vcMinute;
    const ap = vcIsPM ? "PM" : "AM";
    display.textContent = `${hh}:${mm} ${ap}`;
}

function vcAddMinutes(delta) {
    const step = vcGetStep();
    const START = 4 * 60;  // 240 = 4:00 AM
    const END   = 26 * 60; // 1560 = 2:00 AM next day

    // Current clock minutes (0-1439)
    let currentTotal = (vcHour % 12) * 60 + vcMinute + (vcIsPM ? 720 : 0);
    // Convert to logical timeline (4AM = START)
    let logical = currentTotal < START ? currentTotal + 1440 : currentTotal;

    // Move by exactly one step
    logical += delta;

    // Hard clamp to allowed range
    if (logical < START || logical > END) return;

    // Snap to grid (in case time was somehow off-grid)
    logical = Math.round((logical - START) / step) * step + START;
    if (logical < START) logical = START;
    if (logical > END)   logical = END;

    const totalMins = logical % 1440;
    vcIsPM = totalMins >= 720;
    const h24 = Math.floor(totalMins / 60);
    vcMinute = totalMins % 60;
    vcHour = h24 % 12;
    if (vcHour === 0) vcHour = 12;
    vcUpdateTimeDisplay();
}

function vcTimeUp() {
    vcAddMinutes(vcGetStep());   // +45 or +90 depending on selected duration
}

function vcTimeDown() {
    vcAddMinutes(-vcGetStep());  // -45 or -90
}

function showVcError(msg) {
    const err = document.getElementById('vcError');
    if (err) {
        err.innerText = '❌ ' + msg;
        err.classList.remove('hidden');
        // Auto-hide after 5 seconds
        setTimeout(() => err.classList.add('hidden'), 5000);
    }
}

async function vcBookNow() {
    const name = document.getElementById("clientName").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const mobileField = document.getElementById("clientNo").value.trim();
    const codeField = document.getElementById("vcClientPhoneCode");
    const mobile = (codeField ? codeField.value : "") + mobileField;
    const date = document.getElementById("datePicker").value;
    const country = document.getElementById("vcClientCountry").value;

    const err = document.getElementById('vcError');
    if (err) err.classList.add('hidden');

    if (!name || !email || !mobileField || !date || !vcSelectedDuration || !country) {
        showVcError('Please fill in all details to proceed.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showVcError('Please enter a valid email address.');
        return;
    }
    if (mobileField.replace(/\D/g, '').length < 5) {
        showVcError('Please enter a valid mobile number.');
        return;
    }

    let selectedMinutes = (vcHour % 12) * 60 + vcMinute + (vcIsPM ? 720 : 0);
    let logicalMinutes = selectedMinutes < 4 * 60 ? selectedMinutes + 1440 : selectedMinutes;

    if (logicalMinutes < 4 * 60 || logicalMinutes > 26 * 60) {
        showVcError('Booking is allowed only between 4:00 AM and 2:00 AM.');
        vcHour = 4; vcMinute = 0; vcIsPM = false;
        vcUpdateTimeDisplay();
        return;
    }

    let hour24 = vcHour % 12;
    if (vcIsPM) hour24 += 12;
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour24, vcMinute, 0, 0);

    if (selectedDateTime <= new Date()) {
        showVcError('The selected time has already passed.');
        return;
    }

    const timeText = `${vcHour < 10 ? "0" : ""}${vcHour}:${vcMinute < 10 ? "0" : ""}${vcMinute} ${vcIsPM ? "PM" : "AM"}`;

    // Securely pull price directly from backend configuration
    let amount = vcSelectedDuration == 90 ? "₹699" : "₹499"; // Fallback
    try {
        const pkgRes = await fetch('/api/packages');
        if (pkgRes.ok) {
            const pkgs = await pkgRes.json();
            const matchingPkg = pkgs.find(p => p.slug === `video-consultation-${vcSelectedDuration}`);
            if (matchingPkg) {
                amount = matchingPkg.price;
            }
        }
    } catch (err) {
        console.error('Package fetch error:', err);
    }

    // Update confirmation step elements
    document.getElementById('confName').innerText = name;
    document.getElementById('confCountry').innerText = country;
    document.getElementById('confDate').innerText = date;
    document.getElementById('confTime').innerText = timeText;
    document.getElementById('confDuration').innerText = vcSelectedDuration;
    document.getElementById('confAmount').innerText = amount;

    // Show Confirmation View
    document.getElementById('vcFormStep').classList.add('hidden');
    document.getElementById('vcConfirmStep').classList.remove('hidden');
}

function vcBackToForm() {
    const f = document.getElementById('vcFormStep');
    const c = document.getElementById('vcConfirmStep');
    if (f && c) {
        f.classList.remove('hidden');
        c.classList.add('hidden');
    }
}

async function vcFinalConfirm() {
    const name = document.getElementById("clientName").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const mobileField = document.getElementById("clientNo").value.trim();
    const codeField = document.getElementById("vcClientPhoneCode");
    const mobile = (codeField ? codeField.value : "") + mobileField;
    const date = document.getElementById("datePicker").value;
    const country = document.getElementById("vcClientCountry").value;
    const timeText = `${vcHour < 10 ? "0" : ""}${vcHour}:${vcMinute < 10 ? "0" : ""}${vcMinute} ${vcIsPM ? "PM" : "AM"}`;
    const amount = document.getElementById('confAmount').innerText;

    const msg = `🅃🄵🄶 Hello Tax Filing Guru,
📹 Video Consultation Booking
👤 Name: ${name}
📧 Email: ${email}
📞 Mobile: ${mobile}
🌍 Country: ${country}
📅 Date: ${date}
⏰ Time: ${timeText}
⏳ Duration: ${vcSelectedDuration} Minutes
💰 Amount: ${amount}`;

    trackWhatsAppClick('consultation', 'Video Consultation', { name, email, mobile, country, date, time: timeText, duration: vcSelectedDuration, amount });

    // Save to MongoDB first
    try {
        const saveRes = await fetch('/api/book-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'Video Consultation',
                name: name,
                email: email,
                mobile: mobile,
                country: country,
                date: date,
                time: timeText,
                duration: vcSelectedDuration,
                amount: amount
            })
        });
        const saveData = await saveRes.json();
        if (!saveData.success) {
            showVcError('Booking could not be saved: ' + (saveData.error || 'Unknown error'));
            return;
        }
    } catch (err) {
        console.error('Booking save error:', err);
        showVcError('Could not connect to server. Please try again.');
        return;
    }

    vcCloseBooking();
    window.open(`https://api.whatsapp.com/send?phone=919811945176&text=${encodeURIComponent(msg)}`, '_blank');
}

// Global listeners
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        vcCloseBooking();
        closeBookingModal();
    }
});

const overlay = document.getElementById("bookingOverlay");
if (overlay) overlay.addEventListener("click", vcCloseBooking);

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    vcSetMinDate();
    vcSelectDuration(45);
    updateTimeDisplay();

    fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => {
            if (d && d.country_name) {
                const cc = document.getElementById('vcClientPhoneCode');
                if (cc) {
                    for (let i = 0; i < cc.options.length; i++) {
                        if (cc.options[i].getAttribute('data-country') === d.country_name) {
                            cc.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }).catch(() => {});
});