const defaultConfig = {
  company_name: "Tax Filing Guru",
  tagline: "Resident & NRI ITR Filing",
  phone_number: "+91 98765 43210",
  hero_title: "Expert Tax Filing Services",
  hero_subtitle: "Professional tax solutions for residents and NRIs. Get maximum refunds with our expert guidance.",
  hero_cta: "Get Started Today",
  services_heading: "Our Services",
  service_1_title: "Individual ITR Filing",
  service_1_desc: "Complete tax filing services for salaried individuals and professionals.",
  service_2_title: "NRI Tax Services",
  service_2_desc: "Specialized tax solutions for Non-Resident Indians worldwide.",
  service_3_title: "Business Tax Filing",
  service_3_desc: "Comprehensive tax services for businesses and corporations.",
  service_4_title: "Tax Consultation",
  service_4_desc: "Expert tax planning and consultation services for all needs.",
  cta_heading: "Ready to File Your Taxes?",
  cta_button: "Contact Us Now",
  footer_text: "© 2024 Tax Filing Guru. All rights reserved.",
  background_color: "#f9fafb",
  primary_color: "#0052D4",
  secondary_color: "#4364F7",
  text_color: "#111827",
  accent_color: "#ffffff",
  font_family: "Poppins",
  font_size: 16
};

async function onConfigChange(config) {
  const backgroundColor = config.background_color || defaultConfig.background_color;
  const primaryColor = config.primary_color || defaultConfig.primary_color;
  const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const accentColor = config.accent_color || defaultConfig.accent_color;
  const customFont = config.font_family || defaultConfig.font_family;
  const baseSize = config.font_size || defaultConfig.font_size;
  const baseFontStack = 'sans-serif';

  // Apply text content
  const companyName = config.company_name || defaultConfig.company_name;
  const companyNameElement = document.getElementById('company-name');
  if (companyNameElement) {
    // Split the name to keep "Guru" in purple
    const nameParts = companyName.split(' ');
    const guruIndex = nameParts.findIndex(part => part.toLowerCase() === 'guru');
    if (guruIndex !== -1) {
      const beforeGuru = nameParts.slice(0, guruIndex).join(' ');
      const guru = nameParts[guruIndex];
      companyNameElement.innerHTML = beforeGuru ? `${beforeGuru} <span class="text-purple-600">${guru}</span>` : `<span class="text-purple-600">${guru}</span>`;
    } else {
      companyNameElement.textContent = companyName;
    }
  }
  document.getElementById('tagline').textContent = config.tagline || defaultConfig.tagline;
  document.getElementById('top-phone').textContent = config.phone_number || defaultConfig.phone_number;
  document.getElementById('hero-title').textContent = config.hero_title || defaultConfig.hero_title;
  document.getElementById('hero-subtitle').textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
  document.getElementById('hero-cta').textContent = config.hero_cta || defaultConfig.hero_cta;
  document.getElementById('services-heading').textContent = config.services_heading || defaultConfig.services_heading;
  document.getElementById('service-1-title').textContent = config.service_1_title || defaultConfig.service_1_title;
  document.getElementById('service-1-desc').textContent = config.service_1_desc || defaultConfig.service_1_desc;
  document.getElementById('service-2-title').textContent = config.service_2_title || defaultConfig.service_2_title;
  document.getElementById('service-2-desc').textContent = config.service_2_desc || defaultConfig.service_2_desc;
  document.getElementById('service-3-title').textContent = config.service_3_title || defaultConfig.service_3_title;
  document.getElementById('service-3-desc').textContent = config.service_3_desc || defaultConfig.service_3_desc;
  document.getElementById('service-4-title').textContent = config.service_4_title || defaultConfig.service_4_title;
  document.getElementById('service-4-desc').textContent = config.service_4_desc || defaultConfig.service_4_desc;
  document.getElementById('cta-heading').textContent = config.cta_heading || defaultConfig.cta_heading;
  document.getElementById('cta-button').textContent = config.cta_button || defaultConfig.cta_button;
  document.getElementById('footer-text').textContent = config.footer_text || defaultConfig.footer_text;

  // Apply colors
  document.querySelector('.hero-bg').style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${secondaryColor}dd 100%)`;

  const serviceIcons = document.querySelectorAll('.service-icon');
  serviceIcons.forEach(icon => {
    icon.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  });

  const primaryBtns = document.querySelectorAll('.primary-btn');
  primaryBtns.forEach(btn => {
    btn.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  });

  // Apply fonts
  document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

  // Apply font sizes
  document.getElementById('company-name').style.fontSize = `${baseSize * 1.5}px`;
  document.getElementById('hero-title').style.fontSize = `${baseSize * 3.5}px`;
  document.getElementById('hero-subtitle').style.fontSize = `${baseSize * 1.25}px`;
  document.getElementById('services-heading').style.fontSize = `${baseSize * 2.5}px`;

  const serviceTitles = [
    document.getElementById('service-1-title'),
    document.getElementById('service-2-title'),
    document.getElementById('service-3-title'),
    document.getElementById('service-4-title')
  ];
  serviceTitles.forEach(title => {
    if (title) title.style.fontSize = `${baseSize * 1.25}px`;
  });
}

// Position client login button to align with header
function positionClientLoginButton() {
  const loginButton = document.querySelector('a[href="/client-login"]');
  const header = document.querySelector('header');
  const topBar = document.querySelector('.w-full.bg-blue-900');

  if (loginButton && header) {
    const headerRect = header.getBoundingClientRect();
    const headerHeight = headerRect.height;
    const headerTop = headerRect.top;

    // Calculate button position to align with header center vertically
    // When header is sticky (top = 0), position button at header center
    // When header is in normal position, position button relative to header
    if (headerTop <= 0) {
      // Header is sticky at top, align with center of header
      loginButton.style.top = `${headerHeight / 2}px`;
      loginButton.style.transform = 'translateY(-50%)';
    } else {
      // Header is in normal position, align with header center
      loginButton.style.top = `${headerTop + (headerHeight / 2)}px`;
      loginButton.style.transform = 'translateY(-50%)';
    }
  }
}

// Run on load and scroll
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    positionClientLoginButton();
    window.addEventListener('scroll', positionClientLoginButton);
    window.addEventListener('resize', positionClientLoginButton);
  });
} else {
  positionClientLoginButton();
  window.addEventListener('scroll', positionClientLoginButton);
  window.addEventListener('resize', positionClientLoginButton);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        {
          get: () => config.background_color || defaultConfig.background_color,
          set: (value) => {
            config.background_color = value;
            window.elementSdk.setConfig({ background_color: value });
          }
        },
        {
          get: () => config.accent_color || defaultConfig.accent_color,
          set: (value) => {
            config.accent_color = value;
            window.elementSdk.setConfig({ accent_color: value });
          }
        },
        {
          get: () => config.text_color || defaultConfig.text_color,
          set: (value) => {
            config.text_color = value;
            window.elementSdk.setConfig({ text_color: value });
          }
        },
        {
          get: () => config.primary_color || defaultConfig.primary_color,
          set: (value) => {
            config.primary_color = value;
            window.elementSdk.setConfig({ primary_color: value });
          }
        },
        {
          get: () => config.secondary_color || defaultConfig.secondary_color,
          set: (value) => {
            config.secondary_color = value;
            window.elementSdk.setConfig({ secondary_color: value });
          }
        }
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: (value) => {
          config.font_family = value;
          window.elementSdk.setConfig({ font_family: value });
        }
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: (value) => {
          config.font_size = value;
          window.elementSdk.setConfig({ font_size: value });
        }
      }
    }),
    mapToEditPanelValues: (config) => new Map([
      ['company_name', config.company_name || defaultConfig.company_name],
      ['tagline', config.tagline || defaultConfig.tagline],
      ['phone_number', config.phone_number || defaultConfig.phone_number],
      ['hero_title', config.hero_title || defaultConfig.hero_title],
      ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle],
      ['hero_cta', config.hero_cta || defaultConfig.hero_cta],
      ['services_heading', config.services_heading || defaultConfig.services_heading],
      ['service_1_title', config.service_1_title || defaultConfig.service_1_title],
      ['service_1_desc', config.service_1_desc || defaultConfig.service_1_desc],
      ['service_2_title', config.service_2_title || defaultConfig.service_2_title],
      ['service_2_desc', config.service_2_desc || defaultConfig.service_2_desc],
      ['service_3_title', config.service_3_title || defaultConfig.service_3_title],
      ['service_3_desc', config.service_3_desc || defaultConfig.service_3_desc],
      ['service_4_title', config.service_4_title || defaultConfig.service_4_title],
      ['service_4_desc', config.service_4_desc || defaultConfig.service_4_desc],
      ['cta_heading', config.cta_heading || defaultConfig.cta_heading],
      ['cta_button', config.cta_button || defaultConfig.cta_button],
      ['footer_text', config.footer_text || defaultConfig.footer_text]
    ])
  });

}
// ================================
// FREE CONSULTATION BOOKING
// ================================

/* -------- STATE -------- */
var hour = 4;
var minute = 0;
var isPM = false;

var STEP = 10;                 // 🔒 ONLY 10-minute gap
var RANGE_START = 4 * 60;      // 4:00 AM
var RANGE_END = 26 * 60;       // 2:00 AM (next day)

/* -------- MODAL -------- */
function openBookingModal() {
  document.getElementById("bookingModal").classList.remove("hidden");

  var dateInput = document.getElementById("appointmentDate");
  var today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;

  updateTimeDisplay();
}

function closeBookingModal() {
  document.getElementById("bookingModal").classList.add("hidden");
}

/* -------- TIME CORE (DO NOT CHANGE) -------- */
function addMinutes(mins) {
  var totalMinutes =
    (hour % 12) * 60 +
    minute +
    (isPM ? 720 : 0) +
    mins;

  totalMinutes = (totalMinutes + 1440) % 1440;

  isPM = totalMinutes >= 720;

  var h24 = Math.floor(totalMinutes / 60);
  minute = totalMinutes % 60;

  hour = h24 % 12;
  if (hour === 0) hour = 12;

  updateTimeDisplay();
}

/* -------- BUTTON ACTIONS -------- */
function timeUp() {
  addMinutes(STEP);      // +10 min
}

function timeDown() {
  addMinutes(-STEP);     // -10 min
}

/* -------- DISPLAY -------- */
function updateTimeDisplay() {
  const timeDisplayEl = document.getElementById("freeTimeDisplay");
  if (timeDisplayEl) {
    timeDisplayEl.innerText =
      (hour < 10 ? "0" : "") + hour + ":" +
      (minute < 10 ? "0" : "") + minute + " " +
      (isPM ? "PM" : "AM");
  }
}

/* -------- BOOK NOW -------- */
function bookNow() {
  var dateInput = document.getElementById("appointmentDate");
  var date = dateInput.value;

  if (!date) {
    alert("❌ Please select date");
    return;
  }

  // convert selected time to minutes
  var selectedMinutes =
    (hour % 12) * 60 +
    minute +
    (isPM ? 720 : 0);

  // logical window: 4 AM → 2 AM
  var logicalMinutes =
    selectedMinutes < RANGE_START
      ? selectedMinutes + 1440
      : selectedMinutes;

  // ❌ out of allowed range
  if (logicalMinutes < RANGE_START || logicalMinutes > RANGE_END) {
    alert("❌ Booking allowed only between 4:00 AM and 2:00 AM");

    // reset to 4:00 AM
    hour = 4;
    minute = 0;
    isPM = false;
    updateTimeDisplay();
    return;
  }

  // ❌ past time for today
  var now = new Date();
  var bookingTime = new Date(date);

  var hour24 = hour % 12;
  if (isPM) hour24 += 12;

  bookingTime.setHours(hour24, minute, 0, 0);

  if (bookingTime <= now) {
    alert("❌ Selected time already passed");
    return;
  }

  // ✅ WhatsApp redirect
  var timeText = document.getElementById("freeTimeDisplay").innerText;
  var msg =
    `🅃🄵🄶 Hello Tax Filing Guru,
📞 I would like to Schedule a free consultation
📅 Date: ${date}
⏰ Time: ${timeText}
Please assist me with the process.
 Thank you!`
  window.location.href =
    `whatsapp://send?phone=919811945176&text=${encodeURIComponent(msg)}`;


  closeBookingModal();
}




function toggleFaq(button) {
  const answer = button.nextElementSibling;
  const icon = button.querySelector('.icon-wrapper');

  // Close all other open FAQs (Optional: remove this block if you want multiple open at once)
  document.querySelectorAll('.faq-answer').forEach(el => {
    if (el !== answer) {
      el.classList.add('hidden');
      el.previousElementSibling.querySelector('.icon-wrapper').classList.remove('rotate-180', 'bg-blue-600', 'text-white');
      el.previousElementSibling.querySelector('.icon-wrapper').classList.add('bg-blue-50', 'text-blue-600');
    }
  });

  // Toggle current
  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    icon.classList.add('rotate-180', 'bg-blue-600', 'text-white'); // Active state styles
    icon.classList.remove('bg-blue-50', 'text-blue-600');
  } else {
    answer.classList.add('hidden');
    icon.classList.remove('rotate-180', 'bg-blue-600', 'text-white');
    icon.classList.add('bg-blue-50', 'text-blue-600');
  }
}
// video consultation booking
/* ================================
   GLOBAL STATE
================================ */
let vcSelectedDuration = null;
let vcHour = 4;
let vcMinute = 0;
let vcIsPM = false;
const VC_MIN_MINUTES = 4 * 60;   // 4:00 AM
const VC_MAX_MINUTES = 26 * 60;  // 2:00 AM (next day)


/* ================================
   OPEN / CLOSE OVERLAY
================================ */
function vcOpenBooking() {
  const overlay = document.getElementById("bookingOverlay");
  const tab = document.getElementById("rightTab");
  const closeTab = document.getElementById("closeTab");

  vcSetMinDate();

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
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    vcCloseBooking();
    closeBookingModal();
  }
});
document.getElementById("bookingOverlay").addEventListener("click", vcCloseBooking);



/* ================================
   DATE
================================ */
function vcSetMinDate() {
  const dateInput = document.getElementById("datePicker");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
}

/* ================================
   DURATION
================================ */
function vcSelectDuration(minutes) {
  vcSelectedDuration = minutes;
  vcMinute = 0;

  document.querySelectorAll(".duration button")
    .forEach(b => b.classList.remove("active"));

  document.getElementById(minutes === 45 ? "d45" : "d90")
    .classList.add("active");

  vcUpdateTimeDisplay();
}

/* ================================
   TIME DISPLAY
================================ */
function vcUpdateTimeDisplay() {
  const hh = vcHour < 10 ? "0" + vcHour : vcHour;
  const mm = vcMinute < 10 ? "0" + vcMinute : vcMinute;
  const ap = vcIsPM ? "PM" : "AM";

  document.getElementById("timeDisplay").textContent =
    `${hh}:${mm} ${ap}`;
}

/* ================================
   TIME CORE LOGIC (IMPORTANT)
================================ */
function vcAddMinutes(mins) {
  let totalMinutes =
    (vcHour % 12) * 60 +
    vcMinute +
    (vcIsPM ? 720 : 0) +
    mins;

  totalMinutes = (totalMinutes + 1440) % 1440;

  vcIsPM = totalMinutes >= 720;

  let h24 = Math.floor(totalMinutes / 60);
  vcMinute = totalMinutes % 60;

  vcHour = h24 % 12;
  if (vcHour === 0) vcHour = 12;

  vcUpdateTimeDisplay();
}



/* ================================
   TIME UP / DOWN
================================ */
function vcTimeUp() {
  if (!vcSelectedDuration) {
    alert("Select duration first");
    return;
  }
  vcAddMinutes(vcSelectedDuration);
}

function vcTimeDown() {
  if (!vcSelectedDuration) {
    alert("Select duration first");
    return;
  }
  vcAddMinutes(-vcSelectedDuration);
}

/* ================================
   BOOK NOW
================================ */
function vcBookNow() {
  const name = document.getElementById("clientName").value.trim();
  const email = document.getElementById("clientEmail").value.trim();
  const mobile = document.getElementById("clientNo").value.trim();
  const date = document.getElementById("datePicker").value;

  if (!name || !email || !mobile || !date || !vcSelectedDuration) {
    alert("❌ Please fill all details");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    alert("❌ Enter valid 10-digit mobile number");
    return;
  }

  /* ---------- TIME RANGE CHECK (4 AM to 2 AM) ---------- */
  let selectedMinutes =
    (vcHour % 12) * 60 +
    vcMinute +
    (vcIsPM ? 720 : 0);

  // convert to logical 22-hour window
  let logicalMinutes =
    selectedMinutes < 4 * 60
      ? selectedMinutes + 1440
      : selectedMinutes;

  if (logicalMinutes < 4 * 60 || logicalMinutes > 26 * 60) {
    alert("❌ Booking allowed only between 4:00 AM and 2:00 AM");

    // force reset to 4:00 AM
    vcHour = 4;
    vcMinute = 0;
    vcIsPM = false;
    vcUpdateTimeDisplay();

    return; // stop booking
  }
  /* ---------- END RANGE CHECK ---------- */

  let hour24 = vcHour % 12;
  if (vcIsPM) hour24 += 12;

  const selectedDateTime = new Date(date);
  selectedDateTime.setHours(hour24, vcMinute, 0, 0);

  if (selectedDateTime <= new Date()) {
    alert("❌ Selected time already passed");
    return;
  }

  const timeText =
    `${vcHour < 10 ? "0" : ""}${vcHour}:` +
    `${vcMinute < 10 ? "0" : ""}${vcMinute} ` +
    `${vcIsPM ? "PM" : "AM"}`;

  // Determine Price
  let amount = "&#8377;499";
  if (vcSelectedDuration == 90) {
    amount = "&#8377;699";
  }

  // Confirmation Alert
  const confirmMsg =
    `Please confirm your booking details:

👤 Name: ${name}
📧 Email: ${email}
📞 Mobile: ${mobile}
📅 Date: ${date}
⏰ Time: ${timeText}
⏳ Duration: ${vcSelectedDuration} Minutes
💰 Amount: ${amount}

Click OK to proceed to WhatsApp.`;

  if (!confirm(confirmMsg)) {
    return;
  }

  const msg =
    `🅃🄵🄶 Hello Tax Filing Guru,
📹 Video Consultation Booking
👤 Name: ${name}
📧 Email: ${email}
📞 Mobile: ${mobile}
📅 Date: ${date}
⏰ Time: ${timeText}
⏳ Duration: ${vcSelectedDuration} Minutes
💰 Amount: ${amount}`;

  window.location.href =
    `whatsapp://send?phone=919811945176&text=${encodeURIComponent(msg)}`;
}

/* ================================
   INIT
================================ */
vcSetMinDate();
vcSelectDuration(45);
vcUpdateTimeDisplay();

function setUserType(type) {
  localStorage.setItem("loginType", type);
}

function togglePackage(button) {
  const card = button.closest('.package-card');

  const packageName = card.querySelector('h3').textContent.trim();
  let packageRate = card.querySelector('.rate').textContent.trim();
  const desc = card.querySelector('.package-desc').textContent.trim();

  const packageFeatures = Array.from(
    card.querySelectorAll('.package-features li')
  ).map(el => el.textContent.trim());

  // Check if NRI page and append / Filing if missing
  const isNRI = window.location.pathname.endsWith("nri.html");
  if (isNRI && !packageRate.includes("/ Filing")) {
    packageRate += " / Filing";
  }

  // STORE FIRST
  localStorage.setItem(
    "selectedPackage",
    JSON.stringify({
      name: packageName,
      description: desc,
      rate: packageRate,
      features: packageFeatures
    })
  );
  // REDIRECT LAST
  if (isNRI) {
    window.location.href = "reg.html?type=nri";
  } else {
    window.location.href = "reg.html";
  }
}

/* ===============================
   MAKE PAYMENT CLICK
================================ */
function makePayment() {
  // Store payment start time
  localStorage.setItem("paymentStartedAt", Date.now());

  // Continue your payment logic here
  // Razorpay / API / redirect etc.
  console.log("Payment initiated");
}

/* ===============================
   AUTO CLEAR AFTER 5 MINUTES
   (Runs on every page load)
================================ */
(function autoClearAfter5Minutes() {
  const startedAt = localStorage.getItem("paymentStartedAt");
  if (!startedAt) return;

  const FIVE_MIN = 5 * 60 * 1000;
  const now = Date.now();

  if (now - startedAt >= FIVE_MIN) {
    localStorage.removeItem("selectedPackage");
    localStorage.removeItem("paymentStartedAt");
    console.log("⏱ Local data cleared after 5 minutes");
  }
})();

// Initialize free consultation time display on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    updateTimeDisplay();
  });
} else {
  updateTimeDisplay();
}
function scrollPackages(button, direction) {
  const container = button
    .parentElement
    .querySelector('[data-scroll-container]');

  const card = container.querySelector('div');
  const gap = 24; // Tailwind gap-6
  const scrollAmount = card.offsetWidth + gap;

  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

/* ===============================
   ACTIVE LINK HIGHLIGHTING & AUTO-OPEN
=============================== */
function highlightActiveLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a, #mobileMenu a");

  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPath) {
      link.classList.add("text-blue-600", "font-bold");
      link.classList.remove("text-gray-700");

      // Check if inside mobile submenu (e.g., Tools dropdown)
      const submenu = link.closest('div[id$="Submenu"]');
      if (submenu) {
        // Auto-open the submenu
        submenu.classList.remove("hidden");

        // Rotate the arrow icon in the button
        const btn = submenu.previousElementSibling;
        if (btn) {
          btn.classList.add("text-blue-600", "font-bold");
          btn.classList.remove("text-gray-700");
          const icon = btn.querySelector("svg");
          if (icon) icon.classList.add("rotate-180");
        }
      }
    }
  });
}

/* ===============================
   MOBILE SUBMENU TOGGLE
=============================== */
function toggleMobileSubmenu(id) {
  const submenu = document.getElementById(id);
  if (submenu) {
    submenu.classList.toggle("hidden");
    const icon = submenu.previousElementSibling.querySelector("svg");
    if (icon) icon.classList.toggle("rotate-180");
  }
}

// Run on load
document.addEventListener("DOMContentLoaded", highlightActiveLink);

/* ===============================
   SERVICE CARD DATA
   -----------------------------
   Edit the details below to change the Service Name, Rate, Description, and Features
   displayed on the Registration Page (reg.html).
=============================== */
const servicesData = {
  "AdvanceTaxCalculation": {
    name: "Advance Tax Calculation",
    rate: "&#8377; 2,499",
    description: "Accurate calculation and timely planning of your advance tax liabilities to avoid interest under section 234B/C.",
    features: [
      "Quarterly Liability Estimation",
      "Challan Generation Support",
      "Interest Saving Strategies",
      "Detailed Report"
    ],
    icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  },
  "TaxConsultation": {
    name: "Tax Consultation",
    rate: "&#8377; 999",
    description: "One-on-one consultation with our tax experts to resolve your specific queries and optimize your tax planning.",
    features: [
      "30-Minute Video Call",
      "Personalized Tax Simplification",
      "Investment Proof Review",
      "Notice Discussion"
    ],
    icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
  },
  "GSTCompliance": {
    name: "GST Compliance",
    rate: "&#8377; 1,299 / Month",
    description: "End-to-end GST support for freelancers and small businesses including registration and monthly returns.",
    features: [
      "GST Registration",
      "GSTR-1 & GSTR-3B Filing",
      "Input Tax Credit Reconciliation",
      "LUT Filing for Exports"
    ],
    icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  },
  "TaxNotice": {
    name: "Tax Notice",
    rate: "&#8377; 1,499",
    description: "Expert assistance in drafting and filing responses to Income Tax Notices.",
    features: [
      "Notice Analysis",
      "Response Drafting",
      "Rectification Requests",
      "Expert Representation"
    ],
    icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 3v4a1 1 0 001 1h4"></path></svg>`
  }
};

/* ===============================
   SELECT SERVICE & REDIRECT
=============================== */
function selectService(serviceId) {
  const data = servicesData[serviceId];
  if (data) {
    // Save selected service data to LocalStorage
    localStorage.setItem("selectedService", JSON.stringify(data));

    // Clear any selected package to avoid conflicts
    localStorage.removeItem("selectedPackage");

    // Redirect to registration page with type param for Hero Text customization
    window.location.href = `reg.html?type=${serviceId}`;
  } else {
    console.error("Service ID not found:", serviceId);
  }

}

/* ===============================
   DYNAMIC FAQ SYSTEM
   -----------------------------
   Renders FAQs based on page type (Resident, NRI, Service)
=============================== */
const faqData = {
  // DEFAULT / RESIDENT
  "resident": [
    { q: "Is it mandatory to file ITR?", a: "It is mandatory if your income exceeds &#8377;2.5 Lakh (Old Regime) or &#8377;3 Lakh (New Regime). However, filing is recommended even for lower income to tackle future notices, claim refunds, and for loan/visa approvals." },
    { q: "What documents are required?", a: "Typically, you need your PAN, Aadhaar, Form 16 (from employer), and bank statements. For capital gains or business income, additional statements like P&L or broker reports are needed." },
    { q: "How long does it take to get a refund?", a: "Once filed and verified, refunds usually process within 15-45 days, depending on the Income Tax Department's processing speed." },
    { q: "Can I switch between Old and New Regime?", a: "Yes. Salaried individuals can choose the beneficial regime every year. Business owners (non-salaried) can switch once in a lifetime." }
  ],
  // NRI
  "nri": [
    { q: "Do NRIs need to file ITR in India?", a: "Yes, if your income accrued or received in India exceeds the basic exemption limit (&#8377;2.5L). This includes rental income, interest, or capital gains." },
    { q: "What is DTAA benefit?", a: "Double Taxation Avoidance Agreement (DTAA) prevents you from paying tax on the same income in both India and your country of residence. We help you claim this relief." },
    { q: "Can I repatriate my funds abroad?", a: "Yes, NRIs can repatriate funds (NRO to NRE/Foreign Account) up to $1 Million USD per financial year by submitting Form 15CA/CB, which we assist with." },
    { q: "Is Aadhaar mandatory for NRIs?", a: "Aadhaar is not mandatory for NRIs, but PAN is essential for filing taxes." }
  ],
  // SERVICES
  "AdvanceTaxCalculation": [
    { q: "Who needs to pay Advance Tax?", a: "If your tax liability for the year exceeds &#8377;10,000, you are required to pay Advance Tax in quarterly installments (15%, 45%, 75%, 100%)." },
    { q: "What happens if I miss a deadline?", a: "Missing deadlines attracts interest under Section 234B and 234C of the Income Tax Act. Our service helps you calculate and pay on time to save this interest." },
    { q: "Can I pay all at once?", a: "Yes, but paying after the deadlines will still incur interest for the deferred period." }
  ],
  "TaxConsultation": [
    { q: "How does the consultation work?", a: "You can book a 30-minute video slot. Our expert will review your specific case, answer queries, and provide a written summary of the advice." },
    { q: "Can you help with tax planning?", a: "Absolutely. We analyze your investments and expenses to suggest legal ways to minimize your tax liability for the current and future years." }
  ],
  "GSTCompliance": [
    { q: "When is GST registration mandatory?", a: "If your turnover exceeds &#8377;20 Lakhs (Service) or &#8377;40 Lakhs (Goods), or if you sell across state lines (Inter-state), GST registration is mandatory." },
    { q: "Do I need to file nil returns?", a: "Yes, even if you have no business transaction in a month, filing a Nil GSTR-1 and GSTR-3B is mandatory to avoid late fees." },
    { q: "Can I claim Input Tax Credit (ITC)?", a: "Yes, you can claim ITC on business purchases if your vendor has filed their return. We reconcile this for you to ensure you don't lose money." }
  ],
  "TaxNotice": [
    { q: "Why did I get a tax notice?", a: "Notices can be for data mismatch (Section 143(1)), non-filing, or high-value transactions. Do not ignore it; most can be resolved with a simple online response." },
    { q: "Do I need to visit the tax office?", a: "No. The entire process is now 'Faceless'. We draft and file the response online on your behalf." },
    { q: "What if the demand is incorrect?", a: "We can file a rectification request or an appeal to correct the demand if the assessing officer has made an error." }
  ]
};

function renderDynamicFaq(type) {
  // Normalize type
  if (!type || type === 'undefined') type = 'resident';

  // Fallback to resident if specific key doesn't exist
  const data = faqData[type] || faqData['resident'];

  const container = document.getElementById("dynamic-faq-container");
  if (!container) return;

  container.innerHTML = data.map((item, index) => `
    <div class="faq-item bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
      <button class="w-full flex justify-between items-center p-5 text-left focus:outline-none" onclick="toggleFaq(this)">
        <span class="text-base md:text-lg font-semibold text-gray-800">${item.q}</span>
        <span class="icon-wrapper w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform duration-300">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      <div class="faq-answer hidden px-6 pb-6 pt-2 border-t border-gray-50">
        <p class="text-gray-600 leading-relaxed text-sm md:text-base">${item.a}</p>
      </div>
    </div>
  `).join("");
}

function scrollPackages(button, direction) {
  const container = button
    .parentElement
    .querySelector('[data-scroll-container]');

  if (container) {
    const card = container.querySelector('div');
    const gap = 24;
    let scrollAmount = 300; // Default
    if (card) {
      scrollAmount = card.offsetWidth + gap;
    }

    container.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }
}

function togglePackageSection(header) {
  const container = header.parentElement;
  const content = container.querySelector('.package-content');
  const icon = header.querySelector('.toggle-icon');

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    if (icon) icon.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    if (icon) icon.classList.remove('rotate-180');
  }
}

