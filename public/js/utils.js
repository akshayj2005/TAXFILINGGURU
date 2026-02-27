/* ===============================
   UI UTILS
=============================== */

function toggleFaqRaw(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.icon-wrapper');

    document.querySelectorAll('.faq-answer').forEach(el => {
        if (el !== answer) {
            el.classList.add('hidden');
            const otherIcon = el.previousElementSibling.querySelector('.icon-wrapper');
            if (otherIcon) {
                otherIcon.classList.remove('rotate-180', 'bg-blue-600', 'text-white');
                otherIcon.classList.add('bg-blue-50', 'text-blue-600');
            }
        }
    });

    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        if (icon) {
            icon.classList.add('rotate-180', 'bg-blue-600', 'text-white');
            icon.classList.remove('bg-blue-50', 'text-blue-600');
        }
    } else {
        answer.classList.add('hidden');
        if (icon) {
            icon.classList.remove('rotate-180', 'bg-blue-600', 'text-white');
            icon.classList.add('bg-blue-50', 'text-blue-600');
        }
    }
}

// Global wrap for toggleFaq to match existing HTML calls
window.toggleFaq = toggleFaqRaw;

function scrollPackages(button, direction) {
    const container = button.parentElement.querySelector('[data-scroll-container]');
    if (container) {
        const card = container.querySelector('div');
        const gap = 24;
        let scrollAmount = 300;
        if (card) scrollAmount = card.offsetWidth + gap;
        container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
}

function renderDynamicFaq(type) {
    if (!type || type === 'undefined') type = 'resident';
    const data = (typeof faqData !== 'undefined') ? (faqData[type] || faqData['resident']) : [];
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

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll("nav a, #mobileMenu a");
    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        if (linkHref === currentPath || (currentPath === "/" && linkHref === "/")) {
            link.classList.add("text-blue-600", "font-bold");
            link.classList.remove("text-gray-700");
            const submenu = link.closest('div[id$="Submenu"]');
            if (submenu) {
                submenu.classList.remove("hidden");
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

function toggleMobileSubmenu(id) {
    const submenu = document.getElementById(id);
    if (submenu) {
        submenu.classList.toggle("hidden");
        const icon = submenu.previousElementSibling.querySelector("svg");
        if (icon) icon.classList.toggle("rotate-180");
    }
}

/* ===============================
   AUTH & PAYMENT UTILS
=============================== */

function setUserType(type) {
    localStorage.setItem("loginType", type);
}

function togglePackage(button) {
    const card = button.closest('.package-card');
    const packageName = card.querySelector('h3').textContent.trim();
    let packageRate = card.querySelector('.rate').textContent.trim();
    const desc = card.querySelector('.package-desc').textContent.trim();
    const packageFeatures = Array.from(card.querySelectorAll('.package-features li')).map(el => el.textContent.trim());

    const isNRI = window.location.pathname.includes("/nri");
    if (isNRI && !packageRate.includes("/ Filing")) packageRate += " / Filing";

    localStorage.setItem("selectedPackage", JSON.stringify({
        name: packageName,
        description: desc,
        rate: packageRate,
        features: packageFeatures
    }));

    window.location.href = isNRI ? "/reg?type=nri" : "/reg";
}

function selectService(serviceId) {
    const data = typeof servicesData !== 'undefined' ? servicesData[serviceId] : null;
    if (data) {
        localStorage.setItem("selectedService", JSON.stringify(data));
        localStorage.removeItem("selectedPackage");
        window.location.href = `/reg?type=${serviceId}`;
    }
}

function makePayment() {
    localStorage.setItem("paymentStartedAt", Date.now());
    console.log("Payment initiated");
}

(function autoClearAfter5Minutes() {
    const startedAt = localStorage.getItem("paymentStartedAt");
    if (!startedAt) return;
    const FIVE_MIN = 5 * 60 * 1000;
    if (Date.now() - startedAt >= FIVE_MIN) {
        localStorage.removeItem("selectedPackage");
        localStorage.removeItem("paymentStartedAt");
    }
})();

/* ===============================
   TRACKING UTILS
=============================== */

async function trackWhatsAppClick(category, text, metadata = {}) {
    try {
        await fetch('/api/log-interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'whatsapp_click',
                category: category,
                text: text,
                metadata: metadata
            })
        });
    } catch (err) {
        console.error('Failed to log WhatsApp interaction:', err);
    }
}

/* ===============================
   CUSTOM POPUP CONTROLLER
=============================== */

let popupCallback = null;

function showPopup({ title = '', message = '', type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false, callback = null }) {
    const popup = document.getElementById('tfgPopup');
    const content = document.getElementById('popupContent');
    const icon = document.getElementById('popupIcon');
    const titleEl = document.getElementById('popupTitle');
    const messageEl = document.getElementById('popupMessage');
    const confirmBtn = document.getElementById('popupConfirmBtn');
    const cancelBtn = document.getElementById('popupCancelBtn');

    // Set content
    titleEl.innerText = title;
    messageEl.innerText = message;
    confirmBtn.innerText = confirmText;
    cancelBtn.innerText = cancelText;
    
    // Set type-specific icon/styling
    icon.className = 'w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full text-3xl ';
    confirmBtn.className = 'flex-1 px-6 py-3 rounded-xl text-white font-bold transition-shadow shadow-lg ';
    
    if (type === 'success') {
        icon.innerHTML = '✅';
        icon.classList.add('bg-green-50', 'text-green-600');
        confirmBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'shadow-green-500/20');
    } else if (type === 'error') {
        icon.innerHTML = '❌';
        icon.classList.add('bg-red-50', 'text-red-600');
        confirmBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'shadow-red-500/20');
    } else if (type === 'warning') {
        icon.innerHTML = '⚠️';
        icon.classList.add('bg-yellow-50', 'text-yellow-600');
        confirmBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700', 'shadow-yellow-500/20');
    } else {
        icon.innerHTML = 'ℹ️';
        icon.classList.add('bg-blue-50', 'text-blue-600');
        confirmBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'shadow-blue-500/20');
    }

    // Toggle cancel button
    if (showCancel) {
        cancelBtn.classList.remove('hidden');
    } else {
        cancelBtn.classList.add('hidden');
    }

    popupCallback = callback;

    // Show popup
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('show'), 10);
}

function closePopup() {
    const popup = document.getElementById('tfgPopup');
    popup.classList.remove('show');
    
    // If it was a confirm and closed without handlePopupConfirm, it's a cancel
    if (popupCallback) {
        popupCallback(false);
    }

    setTimeout(() => {
        popup.classList.add('hidden');
        popupCallback = null;
    }, 300);
}

function handlePopupConfirm() {
    const cb = popupCallback;
    popupCallback = null; // Clear so closePopup doesn't trigger it with false
    if (cb) {
        cb(true);
    }
    closePopup();
}

/* ===============================
   INIT UI
=============================== */
document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // Position client login button
    positionClientLoginButton();
    window.addEventListener('scroll', positionClientLoginButton);
    window.addEventListener('resize', positionClientLoginButton);
});

function positionClientLoginButton() {
    const loginButton = document.querySelector('a[href="/client-login"]');
    const header = document.querySelector('header');
    if (loginButton && header) {
        const headerRect = header.getBoundingClientRect();
        const headerHeight = headerRect.height;
        const headerTop = headerRect.top;
        if (headerTop <= 0) {
            loginButton.style.top = `${headerHeight / 2}px`;
            loginButton.style.transform = 'translateY(-50%)';
        } else {
            loginButton.style.top = `${headerTop + (headerHeight / 2)}px`;
            loginButton.style.transform = 'translateY(-50%)';
        }
    }
}
