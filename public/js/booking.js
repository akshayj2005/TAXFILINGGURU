/* ================================
   FREE CONSULTATION BOOKING
================================ */
var hour = 4;
var minute = 0;
var isPM = false;

var STEP = 10;                 // 🔒 ONLY 10-minute gap
var RANGE_START = 4 * 60;      // 4:00 AM
var RANGE_END = 26 * 60;       // 2:00 AM (next day)

function openBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    modal.classList.remove("hidden");

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
    if (modal) modal.classList.add("hidden");
}

function addMinutes(mins) {
    var totalMinutes = (hour % 12) * 60 + minute + (isPM ? 720 : 0) + mins;
    totalMinutes = (totalMinutes + 1440) % 1440;
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
    if (!date) {
        showPopup({ title: 'Date Required', message: 'Please select a date for your consultation.', type: 'warning' });
        return;
    }

    var selectedMinutes = (hour % 12) * 60 + minute + (isPM ? 720 : 0);
    var logicalMinutes = selectedMinutes < RANGE_START ? selectedMinutes + 1440 : selectedMinutes;

    if (logicalMinutes < RANGE_START || logicalMinutes > RANGE_END) {
        showPopup({ title: 'Invalid Time', message: 'Booking is allowed only between 4:00 AM and 2:00 AM.', type: 'error' });
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
        showPopup({ title: 'Time Passed', message: 'The selected time has already passed. Please choose a future time.', type: 'warning' });
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
        await fetch('/api/book-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'Free Consultation',
                date: date,
                time: timeText
            })
        });
    } catch (err) {
        console.error('Booking save error:', err);
    }

    window.location.href = `whatsapp://send?phone=919811945176&text=${encodeURIComponent(msg)}`;
    closeBookingModal();
}

/* ================================
   VIDEO CONSULTATION BOOKING
================================ */
let vcSelectedDuration = null;
let vcHour = 4;
let vcMinute = 0;
let vcIsPM = false;

function vcOpenBooking() {
    const overlay = document.getElementById("bookingOverlay");
    const tab = document.getElementById("rightTab");
    const closeTab = document.getElementById("closeTab");

    vcSetMinDate();

    // Set current time
    const now = new Date();
    let currentHour24 = now.getHours();
    let currentMinutes = now.getMinutes();

    // Round to nearest 10 mins
    currentMinutes = Math.round(currentMinutes / 10) * 10;
    if (currentMinutes === 60) {
        currentMinutes = 0;
        currentHour24 = (currentHour24 + 1) % 24;
    }

    vcIsPM = currentHour24 >= 12;
    vcHour = currentHour24 % 12;
    if (vcHour === 0) vcHour = 12;
    vcMinute = currentMinutes;

    // Range Check (4 AM - 2 AM)
    let selectedMinutes = (vcHour % 12) * 60 + vcMinute + (vcIsPM ? 720 : 0);
    let logicalMinutes = selectedMinutes < 4 * 60 ? selectedMinutes + 1440 : selectedMinutes;

    if (logicalMinutes < 4 * 60 || logicalMinutes > 26 * 60) {
        vcHour = 4; vcMinute = 0; vcIsPM = false;
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
    vcMinute = 0;
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

function vcAddMinutes(mins) {
    let totalMinutes = (vcHour % 12) * 60 + vcMinute + (vcIsPM ? 720 : 0) + mins;
    totalMinutes = (totalMinutes + 1440) % 1440;
    vcIsPM = totalMinutes >= 720;
    let h24 = Math.floor(totalMinutes / 60);
    vcMinute = totalMinutes % 60;
    vcHour = h24 % 12;
    if (vcHour === 0) vcHour = 12;
    vcUpdateTimeDisplay();
}

function vcTimeUp() {
    if (!vcSelectedDuration) {
        showVcError('Please select a duration first.');
        return;
    }
    vcAddMinutes(vcSelectedDuration);
}
function vcTimeDown() {
    if (!vcSelectedDuration) {
        showVcError('Please select a duration first.');
        return;
    }
    vcAddMinutes(-vcSelectedDuration);
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

function vcBookNow() {
    const name = document.getElementById("clientName").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const mobile = document.getElementById("clientNo").value.trim();
    const date = document.getElementById("datePicker").value;

    const err = document.getElementById('vcError');
    if (err) err.classList.add('hidden');

    if (!name || !email || !mobile || !date || !vcSelectedDuration) {
        showVcError('Please fill in all details to proceed.');
        return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        showVcError('Please enter a valid 10-digit mobile number.');
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
    let amount = vcSelectedDuration == 90 ? "₹699" : "₹499";

    // Update confirmation step elements
    document.getElementById('confName').innerText = name;
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
    const mobile = document.getElementById("clientNo").value.trim();
    const date = document.getElementById("datePicker").value;
    const timeText = `${vcHour < 10 ? "0" : ""}${vcHour}:${vcMinute < 10 ? "0" : ""}${vcMinute} ${vcIsPM ? "PM" : "AM"}`;
    let amount = vcSelectedDuration == 90 ? "₹699" : "₹499";

    const msg = `🅃🄵🄶 Hello Tax Filing Guru,
📹 Video Consultation Booking
👤 Name: ${name}
📧 Email: ${email}
📞 Mobile: ${mobile}
📅 Date: ${date}
⏰ Time: ${timeText}
⏳ Duration: ${vcSelectedDuration} Minutes
💰 Amount: ${amount}`;

    trackWhatsAppClick('consultation', 'Video Consultation', { name, email, mobile, date, time: timeText, duration: vcSelectedDuration, amount });

    // Save to MongoDB
    try {
        await fetch('/api/book-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'Video Consultation',
                name: name,
                email: email,
                mobile: mobile,
                date: date,
                time: timeText,
                duration: vcSelectedDuration,
                amount: amount
            })
        });
    } catch (err) {
        console.error('Booking save error:', err);
    }

    window.location.href = `whatsapp://send?phone=919811945176&text=${encodeURIComponent(msg)}`;
    vcCloseBooking();
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
});
