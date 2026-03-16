// ── Sidebar toggle ───────────────────────────────────────────
const menuToggle = document.getElementById('menu-toggle');
const sidebar    = document.querySelector('.sidebar');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ── Toast notifications ───────────────────────────────────────
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type]} toast-icon"></i>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

let popupCallback = null;
let popupMode = 'alert';

function showPopup({
  title = 'Notice',
  message = '',
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  showInput = false,
  inputValue = '',
  inputPlaceholder = '',
  inputType = 'text',
  callback = null
} = {}) {
  const popup = document.getElementById('app-popup');
  if (!popup) {
    showToast(message || title, type === 'error' ? 'error' : 'info');
    if (callback) callback(showInput ? null : true);
    return;
  }

  const icon = document.getElementById('app-popup-icon');
  const titleEl = document.getElementById('app-popup-title');
  const messageEl = document.getElementById('app-popup-message');
  const confirmBtn = document.getElementById('app-popup-confirm');
  const cancelBtn = document.getElementById('app-popup-cancel');
  const inputWrap = document.getElementById('app-popup-input-wrap');
  const input = document.getElementById('app-popup-input');
  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  popupMode = showInput ? 'prompt' : (showCancel ? 'confirm' : 'alert');
  popupCallback = callback;

  titleEl.textContent = title;
  messageEl.textContent = message;
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  cancelBtn.style.display = showCancel ? '' : 'none';

  icon.className = `popup-icon ${type}`;
  icon.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.info}"></i>`;

  inputWrap.classList.toggle('hidden', !showInput);
  input.value = inputValue;
  input.placeholder = inputPlaceholder;
  input.type = inputType;

  openModal('app-popup');
  if (showInput) {
    setTimeout(() => input.focus(), 30);
  }
}

function closePopup() {
  const popup = document.getElementById('app-popup');
  if (!popup) return;

  closeModal('app-popup');

  const cb = popupCallback;
  const mode = popupMode;
  popupCallback = null;
  popupMode = 'alert';

  if (cb) {
    cb(mode === 'prompt' ? null : false);
  }
}

function handlePopupConfirm() {
  const popup = document.getElementById('app-popup');
  if (!popup) return;

  const cb = popupCallback;
  const mode = popupMode;
  const input = document.getElementById('app-popup-input');
  const value = input ? input.value : '';

  popupCallback = null;
  popupMode = 'alert';
  closeModal('app-popup');

  if (cb) {
    cb(mode === 'prompt' ? value : true);
  }
}

function confirmPopup(options = {}) {
  return new Promise(resolve => {
    showPopup({
      title: options.title || 'Please Confirm',
      message: options.message || '',
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
      callback: resolve
    });
  });
}

function promptPopup(options = {}) {
  return new Promise(resolve => {
    showPopup({
      title: options.title || 'Enter Value',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'Save',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
      showInput: true,
      inputValue: options.inputValue || '',
      inputPlaceholder: options.inputPlaceholder || '',
      inputType: options.inputType || 'text',
      callback: resolve
    });
  });
}

// ── Modal helpers ─────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
// close on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    if (e.target.id === 'app-popup') {
      closePopup();
      return;
    }
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Multi-Filter Logic ────────────────────────────────────────
function updateRowVisibility(row) {
  const isHidden = row.dataset.hideBySearch === 'true' || 
                   row.dataset.hideByType === 'true' ||
                   row.dataset.hideByStatus === 'true' ||
                   row.dataset.hideByPayment === 'true';
  row.style.display = isHidden ? 'none' : '';
}

function filterTable(inputId, tableId, colIndexes) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
      const text = colIndexes.map(i => (row.cells[i]?.textContent || '').toLowerCase()).join(' ');
      row.dataset.hideBySearch = (q && !text.includes(q)) ? 'true' : 'false';
      updateRowVisibility(row);
    });
  });
}

function filterBySelect(selectId, tableId, colIndex, filterKey = 'type') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const dataKey = `hideBy${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`;
  sel.addEventListener('change', () => {
    const val = sel.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
      const cell = (row.cells[colIndex]?.textContent || '').toLowerCase();
      row.dataset[dataKey] = (val && !cell.includes(val)) ? 'true' : 'false';
      updateRowVisibility(row);
    });
  });
}

// ── Confirm delete (generic) ──────────────────────────────────
async function confirmDelete(url, label) {
  const { isConfirmed } = await Swal.fire({
    title: 'Delete Confirmation',
    text: `Are you sure you want to delete ${label || 'this record'}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      Swal.fire('Deleted!', data.message || 'Deleted successfully', 'success');
      setTimeout(() => location.reload(), 900);
    } else {
      Swal.fire('Error', data.error || 'Delete failed', 'error');
    }
  } catch {
    Swal.fire('Error', 'Network error', 'error');
  }
}

// ── Generic API Form submit ───────────────────────────────────
async function submitForm(formId, method, url, successMsg, onSuccess) {
  const form = document.getElementById(formId);
  if (!form) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  // handle multi-value (checkboxes / multi-select)
  const fd = new FormData(form);
  const payload = {};
  for (const [k, v] of fd.entries()) {
    if (payload[k]) {
      payload[k] = [].concat(payload[k], v);
    } else { payload[k] = v; }
  }
  try {
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok) {
      showToast(successMsg || json.message || 'Saved!', 'success');
      form.reset();
      if (onSuccess) onSuccess(json);
    } else showToast(json.error || 'Something went wrong', 'error');
  } catch { showToast('Network error', 'error'); }
}

// ── Relative time helper ──────────────────────────────────────
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
