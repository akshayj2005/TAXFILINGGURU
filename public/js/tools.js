/* ===============================
   TRADER TURNOVER CALCULATOR
=============================== */
let tradeCount = 0;

function addTradeRow() {
    tradeCount++;
    const tbody = document.querySelector('#tradeTable tbody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-4 text-gray-500">Trade #${tradeCount}</td>
      <td class="p-4">
        <input type="number" placeholder="Enter Amount (+ for Profit, - for Loss)" class="trade-input w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none">
      </td>
      <td class="p-4 text-center">
        <button onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-600 font-bold text-xl">&times;</button>
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
    if (quizAnswers.paysRent) recommendations.push({ title: "House Rent Allowance (HRA) / 80GG", desc: "Since you pay rent, you can claim HRA (if salaried) or Section 80GG (up to ₹60,000 if not getting HRA).", icon: "🏠" });
    if (quizAnswers.healthIns) recommendations.push({ title: "Medical Insurance (80D)", desc: "You can claim up to ₹25,000 for self/family and an extra ₹50,000 for senior citizen parents. Preventive checkups up to ₹5,000 also included.", icon: "🩺" });
    if (quizAnswers.homeLoan) recommendations.push({ title: "Home Loan Interest (Section 24)", desc: "Interest on home loans is deductible up to ₹2 Lakhs per year. This is one of the biggest tax savers.", icon: "🔑" });
    if (quizAnswers.donations) recommendations.push({ title: "Charity & Donations (80G)", desc: "Donations to certain relief funds and charitable institutions are 50% or 100% deductible. Ensure you have the 80G receipt.", icon: "💖" });
    if (quizAnswers.schoolFees) recommendations.push({ title: "Children's Tuition Fees (80C)", desc: "The tuition fee portion of school fees for up to 2 children is eligible for deduction under Section 80C.", icon: "🎓" });

    if (recommendations.length === 0) {
        checklist.innerHTML = `<div class="p-6 bg-gray-50 rounded-xl text-center"><p class="text-gray-500">You seem to have all bases covered! Contact us for a deep-dive analysis of your investments.</p></div>`;
    } else {
        recommendations.forEach(rec => {
            checklist.innerHTML += `
          <div class="flex items-start space-x-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div class="text-4xl">${rec.icon}</div>
            <div>
              <h4 class="text-xl font-bold text-gray-800">${rec.title}</h4>
              <p class="text-gray-600 mt-1">${rec.desc}</p>
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
