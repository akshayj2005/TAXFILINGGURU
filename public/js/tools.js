/* ===============================
   TRADER TURNOVER CALCULATOR
=============================== */
let tradeCount = 0;

function addTradeRow() {
    tradeCount++;
    const tbody = document.querySelector('#tradeTable tbody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.className = "group hover:bg-blue-50/30 transition-colors";
    row.innerHTML = `
      <td class="p-6">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                #${tradeCount}
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry</span>
        </div>
      </td>
      <td class="p-6">
        <div class="relative group/input">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-500 transition-colors">
                <i class="fa-solid fa-indian-rupee-sign text-xs"></i>
            </span>
            <input type="number" placeholder="Profit (+) or Loss (-)" class="trade-input w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all font-medium text-gray-900">
        </div>
      </td>
      <td class="p-6 text-center">
        <button onclick="this.parentElement.parentElement.remove()" class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
            <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
}

async function calculateTraderTurnover() {
    const inputs = document.querySelectorAll('.trade-input');
    const trades = [];
    inputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            trades.push(val >= 0 ? { profit: val, loss: 0 } : { profit: 0, loss: Math.abs(val) });
        }
    });

    if (trades.length === 0) { 
        showPopup({ title: 'No Data', message: 'Please enter at least one trade value to calculate.', type: 'warning' });
        return; 
    }

    const response = await fetch('/api/calculate-trader-turnover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades })
    });
    const data = await response.json();
    if (data.error) { 
        showPopup({ title: 'Error', message: data.error, type: 'error' });
        return; 
    }

    const resEl = document.getElementById('result');
    if (resEl) resEl.classList.remove('hidden');
    const tv = document.getElementById('turnoverValue');
    if (tv) tv.innerText = '₹' + data.absoluteTurnover.toLocaleString('en-IN');

    const auditBox = document.getElementById('auditBox');
    const auditStatus = document.getElementById('auditStatus');
    const auditReason = document.getElementById('auditReason');

    if (data.needsAudit) {
        if (auditBox) auditBox.className = "p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center";
        if (auditStatus) { auditStatus.className = "text-xl font-bold text-red-700 mb-1"; auditStatus.innerText = "Audit Required!"; }
        if (auditReason) { auditReason.className = "text-sm text-red-600"; auditReason.innerText = "Turnover exceeds ₹10 Crores limit."; }
    } else {
        if (auditBox) auditBox.className = "p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center";
        if (auditStatus) { auditStatus.className = "text-xl font-bold text-green-700 mb-1"; auditStatus.innerText = "Audit Not Required"; }
        if (auditReason) { auditReason.className = "text-sm text-green-600"; auditReason.innerText = "Turnover is within limits."; }
    }
}

/* ===============================
   REGIME COMPARISON
=============================== */
async function compareTaxRegimes(e) {
    if (e) e.preventDefault();
    const income = document.getElementById('income').value;
    const deductions = document.getElementById('deductions').value;

    const response = await fetch('/api/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, deductions })
    });
    const data = await response.json();
    if (data.error) { 
        showPopup({ title: 'Calculation Error', message: data.error, type: 'error' });
        return; 
    }

    const ph = document.getElementById('placeholder'); if (ph) ph.classList.add('hidden');
    const res = document.getElementById('results'); if (res) res.classList.remove('hidden');
    const tc = document.getElementById('table-container'); if (tc) tc.classList.remove('hidden');

    const fmt = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

    const update = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = fmt(val); };

    update('tax-old', data.old.totalTax);
    update('taxable-old', data.old.taxableIncome);
    update('ded-old', data.old.standardDeduction + parseFloat(deductions));
    update('tax-24', data.new_24_25.totalTax);
    update('taxable-24', data.new_24_25.taxableIncome);
    update('tax-25', data.new_25_26.totalTax);
    update('taxable-25', data.new_25_26.taxableIncome);
    update('base-old', data.old.baseTax);
    update('base-25', data.new_25_26.baseTax);
    update('cess-old', data.old.cess);
    update('cess-25', data.new_25_26.cess);
    update('total-old', data.old.totalTax);
    update('total-25', data.new_25_26.totalTax);
}

/* ===============================
   REFUND MAXIMIZER
=============================== */
let quizAnswers = {};

function nextQuizStep(current) {
    const currEl = document.getElementById('step-' + current);
    const nextEl = document.getElementById('step-' + (current + 1));
    if (currEl) currEl.classList.add('hidden');
    if (nextEl) nextEl.classList.remove('hidden');
}

function setQuizAnswer(key, value) {
    quizAnswers[key] = value;
}

function showQuizResults() {
    const s5 = document.getElementById('step-5'); if (s5) s5.classList.add('hidden');
    const res = document.getElementById('results'); if (res) res.classList.remove('hidden');

    const checklist = document.getElementById('checklist');
    if (!checklist) return;
    checklist.innerHTML = '';

    const recommendations = [];
    if (quizAnswers.paysRent) recommendations.push({ title: "House Rent Allowance (HRA) / 80GG", desc: "Since you pay rent, you can claim HRA (if salaried) or Section 80GG (up to ₹60,000 if not getting HRA).", icon: "fa-house-chimney", color: "blue" });
    if (quizAnswers.healthIns) recommendations.push({ title: "Medical Insurance (80D)", desc: "You can claim up to ₹25,000 for self/family and an extra ₹50,000 for senior citizen parents. Preventive checkups up to ₹5,000 also included.", icon: "fa-heart-pulse", color: "pink" });
    if (quizAnswers.homeLoan) recommendations.push({ title: "Home Loan Interest (Section 24)", desc: "Interest on home loans is deductible up to ₹2 Lakhs per year. This is one of the biggest tax savers.", icon: "fa-key", color: "orange" });
    if (quizAnswers.donations) recommendations.push({ title: "Charity & Donations (80G)", desc: "Donations to certain relief funds and charitable institutions are 50% or 100% deductible. Ensure you have the 80G receipt.", icon: "fa-hands-holding-heart", color: "red" });
    if (quizAnswers.schoolFees) recommendations.push({ title: "Children's Tuition Fees (80C)", desc: "The tuition fee portion of school fees for up to 2 children is eligible for deduction under Section 80C.", icon: "fa-graduation-cap", color: "indigo" });

    if (recommendations.length === 0) {
        checklist.innerHTML = `
          <div class="p-10 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200 text-center animate-[fadeInUp_0.5s_ease-out]">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fa-solid fa-shield-check text-gray-400 text-2xl"></i>
            </div>
            <p class="text-gray-500 font-bold text-lg">Your portfolio looks optimized!</p>
            <p class="text-gray-400 text-sm mt-1">You seem to have all bases covered. Contact us for a deeper analysis.</p>
          </div>`;
    } else {
        recommendations.forEach(rec => {
            checklist.innerHTML += `
          <div class="flex items-start space-x-6 p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div class="w-16 h-16 bg-${rec.color}-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <i class="fa-solid ${rec.icon} text-${rec.color}-600 text-2xl"></i>
            </div>
            <div>
              <h4 class="text-xl font-black text-gray-900 tracking-tight">${rec.title}</h4>
              <p class="text-gray-500 mt-2 font-medium leading-relaxed">${rec.desc}</p>
            </div>
          </div>
        `;
        });
    }
}

/* ===============================
   INIT TOOLS
=============================== */
document.addEventListener('DOMContentLoaded', () => {
    // Trader Turnover Init
    if (document.getElementById('tradeTable')) { addTradeRow(); addTradeRow(); addTradeRow(); }

    // Tax Form Init
    const tf = document.getElementById('taxForm');
    if (tf) tf.addEventListener('submit', compareTaxRegimes);
});
