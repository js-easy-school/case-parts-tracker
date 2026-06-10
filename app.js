/* ==========================================================================
   PartFlow Modern JavaScript Application Logic
   ========================================================================== */

// --- Default Mock Data ---
const DEFAULT_PARTS = [
    {
        id: "part-1",
        name: "Передняя панель ATX-02 (черная)",
        material: "Алюминий",
        category: "Панели",
        target: 20,
        stock: 5,
        done: 8,
        description: "Чертеж №A-102. После фрезеровки отправить на пескоструйную обработку и черное анодирование.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "part-2",
        name: "Боковая стенка левая (акрил 4мм)",
        material: "Акрил",
        category: "Крышки",
        target: 10,
        stock: 10,
        done: 10,
        description: "Лазерная резка. Отверстия под крепеж M4 и вентиляционную решетку 120мм.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "part-3",
        name: "Кронштейн блока питания SFX",
        material: "Сталь",
        category: "Кронштейны",
        target: 30,
        stock: 0,
        done: 0,
        description: "Сталь 1.5мм, гибка на станке по развертке SFX-B. Порошковая покраска в серый цвет.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "part-4",
        name: "Крышка верхняя с перфорацией",
        material: "Алюминий",
        category: "Крышки",
        target: 15,
        stock: 3,
        done: 6,
        description: "Перфорация в виде гексагонов. Важно следить за качеством реза на углах.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
];

const DEFAULT_LOGS = [
    {
        id: "log-1",
        partId: "part-2",
        partName: "Боковая стенка левая (акрил 4мм)",
        type: "success",
        text: "Завершено производство по плану: изготовлено 10 шт.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "log-2",
        partId: "part-1",
        partName: "Передняя панель ATX-02 (черная)",
        type: "info",
        text: "В наличии на складе добавлено 5 шт. готовой продукции.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "log-3",
        partId: "part-4",
        partName: "Крышка верхняя с перфорацией",
        type: "success",
        text: "Произведено деталей: +3 шт. (Всего готово: 6 из 15)",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "log-4",
        partId: null,
        partName: null,
        type: "info",
        text: "Приложение успешно инициализировано с демонстрационными данными.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// --- State Management ---
let state = {
    parts: [],
    logs: []
};

// --- DOM Cache ---
const DOM = {
    // Form Elements
    partForm: document.getElementById('part-form'),
    partIdInput: document.getElementById('part-id'),
    partNameInput: document.getElementById('part-name'),
    partMaterialSelect: document.getElementById('part-material'),
    partCategorySelect: document.getElementById('part-category'),
    partTargetInput: document.getElementById('part-target'),
    partStockInput: document.getElementById('part-stock'),
    partDoneInput: document.getElementById('part-done'),
    partDescTextarea: document.getElementById('part-description'),
    formTitle: document.getElementById('form-title'),
    submitBtn: document.getElementById('submit-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    
    // Theme
    toggleThemeBtn: document.getElementById('toggle-theme-btn'),
    themeText: document.getElementById('theme-text'),
    
    // Stats Elements
    statTotalTypes: document.getElementById('stat-total-types'),
    statTotalTarget: document.getElementById('stat-total-target'),
    statTotalDone: document.getElementById('stat-total-done'),
    statProgressPercent: document.getElementById('stat-progress-percent'),
    statTotalRemaining: document.getElementById('stat-total-remaining'),
    progressRingCircle: document.querySelector('.progress-ring__circle'),
    
    // Filters & Search
    searchInput: document.getElementById('search-input'),
    filterMaterial: document.getElementById('filter-material'),
    filterStatus: document.getElementById('filter-status'),
    sortBy: document.getElementById('sort-by'),
    
    // Grid Container
    partsContainer: document.getElementById('parts-container'),
    partsEmptyState: document.getElementById('parts-empty-state'),
    
    // Modals
    logsModal: document.getElementById('logs-modal'),
    viewLogsBtn: document.getElementById('view-logs-btn'),
    closeLogsModal: document.getElementById('close-logs-modal'),
    logsTimelineContainer: document.getElementById('logs-timeline-container'),
    clearLogsBtn: document.getElementById('clear-logs-btn'),
    
    backupModal: document.getElementById('backup-modal'),
    exportImportBtn: document.getElementById('export-import-btn'),
    closeBackupModal: document.getElementById('close-backup-modal'),
    btnExportData: document.getElementById('btn-export-data'),
    importFileInput: document.getElementById('import-file-input'),
    importFilenameStatus: document.getElementById('import-filename-status'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();
    initTheme();
    setupEventListeners();
    renderApp();
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('partflow-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        updateThemeUI(true);
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        updateThemeUI(false);
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme', !isLight);
    localStorage.setItem('partflow-theme', isLight ? 'light' : 'dark');
    updateThemeUI(isLight);
    showToast(`Тема изменена на ${isLight ? 'светлую' : 'темную'}`, 'info');
}

function updateThemeUI(isLight) {
    const sunIcon = DOM.toggleThemeBtn.querySelector('.sun-icon');
    const moonIcon = DOM.toggleThemeBtn.querySelector('.moon-icon');
    if (isLight) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        DOM.themeText.textContent = 'Темная тема';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        DOM.themeText.textContent = 'Светлая тема';
    }
}

// --- LocalStorage & State Synchronization ---
function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('partflow-data');
    if (savedState) {
        try {
            state = JSON.parse(savedState);
            // Ensure compatibility/default arrays
            if (!Array.isArray(state.parts)) state.parts = [];
            if (!Array.isArray(state.logs)) state.logs = [];
        } catch (e) {
            console.error('Ошибка при чтении LocalStorage. Сброс к дефолтным данным.', e);
            loadDemoData();
        }
    } else {
        loadDemoData();
    }
}

function saveStateToLocalStorage() {
    localStorage.setItem('partflow-data', JSON.stringify(state));
}

function loadDemoData() {
    state.parts = [...DEFAULT_PARTS];
    state.logs = [...DEFAULT_LOGS];
    saveStateToLocalStorage();
}

// --- Activity Logging System ---
function logActivity(text, type = 'info', partId = null, partName = null) {
    const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        partId,
        partName,
        type,
        text,
        timestamp: new Date().toISOString()
    };
    state.logs.unshift(newLog); // Prepend to show newest first
    
    // Cap logs to 100 entries to prevent local storage bloat
    if (state.logs.length > 100) {
        state.logs = state.logs.slice(0, 100);
    }
    
    saveStateToLocalStorage();
}

// --- Toast System ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Select Icon based on type
    let icon = '';
    if (type === 'success') {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span class="toast-icon" style="display: flex;">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Trigger slide-in
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Close button event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Auto remove after 4.5 seconds
    setTimeout(() => removeToast(toast), 4500);
}

function removeToast(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Form Actions
    DOM.partForm.addEventListener('submit', handleFormSubmit);
    DOM.cancelBtn.addEventListener('click', resetForm);
    
    // Validation on the fly
    DOM.partNameInput.addEventListener('input', () => validateField(DOM.partNameInput, 'name-error'));
    DOM.partTargetInput.addEventListener('input', () => validateField(DOM.partTargetInput, 'target-error', val => parseInt(val) > 0));
    DOM.partStockInput.addEventListener('input', () => validateField(DOM.partStockInput, 'stock-error', val => parseInt(val) >= 0));
    DOM.partDoneInput.addEventListener('input', () => validateField(DOM.partDoneInput, 'done-error', val => parseInt(val) >= 0));

    // Theme Switch
    DOM.toggleThemeBtn.addEventListener('click', toggleTheme);
    
    // Modals
    DOM.viewLogsBtn.addEventListener('click', () => openModal(DOM.logsModal, renderLogsTimeline));
    DOM.closeLogsModal.addEventListener('click', () => closeModal(DOM.logsModal));
    DOM.clearLogsBtn.addEventListener('click', handleClearLogs);
    
    DOM.exportImportBtn.addEventListener('click', () => openModal(DOM.backupModal));
    DOM.closeBackupModal.addEventListener('click', () => closeModal(DOM.backupModal));
    DOM.btnExportData.addEventListener('click', handleDataExport);
    DOM.importFileInput.addEventListener('change', handleDataImport);
    
    // Filters & Sorting Input
    DOM.searchInput.addEventListener('input', renderPartsList);
    DOM.filterMaterial.addEventListener('change', renderPartsList);
    DOM.filterStatus.addEventListener('change', renderPartsList);
    DOM.sortBy.addEventListener('change', renderPartsList);
    
    // Close Modals on click outside
    window.addEventListener('click', (e) => {
        if (e.target === DOM.logsModal) closeModal(DOM.logsModal);
        if (e.target === DOM.backupModal) closeModal(DOM.backupModal);
    });
}

// --- Modal Management ---
function openModal(modalElement, callback = null) {
    modalElement.classList.add('active');
    if (callback) callback();
}

function closeModal(modalElement) {
    modalElement.classList.remove('active');
}

// --- Form Validation & Submission ---
function validateField(inputElement, errorElementId, customValidationFn = null) {
    const errorEl = document.getElementById(errorElementId);
    let isValid = inputElement.value.trim() !== '';
    
    if (isValid && customValidationFn) {
        isValid = customValidationFn(inputElement.value);
    }
    
    if (isValid) {
        errorEl.style.display = 'none';
        inputElement.style.borderColor = 'var(--border-color)';
    } else {
        errorEl.style.display = 'block';
        inputElement.style.borderColor = 'var(--danger)';
    }
    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Run all validations
    const isNameValid = validateField(DOM.partNameInput, 'name-error');
    const isTargetValid = validateField(DOM.partTargetInput, 'target-error', val => parseInt(val) > 0);
    const isStockValid = validateField(DOM.partStockInput, 'stock-error', val => parseInt(val) >= 0);
    const isDoneValid = validateField(DOM.partDoneInput, 'done-error', val => parseInt(val) >= 0);
    
    if (!isNameValid || !isTargetValid || !isStockValid || !isDoneValid) {
        showToast('Пожалуйста, исправьте ошибки заполнения формы', 'error');
        return;
    }
    
    const id = DOM.partIdInput.value;
    const name = DOM.partNameInput.value.trim();
    const material = DOM.partMaterialSelect.value;
    const category = DOM.partCategorySelect.value;
    const target = parseInt(DOM.partTargetInput.value);
    const stock = parseInt(DOM.partStockInput.value);
    const done = parseInt(DOM.partDoneInput.value);
    const description = DOM.partDescTextarea.value.trim();
    
    if (id) {
        // Edit Existing Part
        const partIdx = state.parts.findIndex(p => p.id === id);
        if (partIdx !== -1) {
            const oldPart = state.parts[partIdx];
            state.parts[partIdx] = {
                ...oldPart,
                name,
                material,
                category,
                target,
                stock,
                done,
                description,
                updatedAt: new Date().toISOString()
            };
            
            // Log changes
            let logMsg = `Обновлена деталь: "${name}". Изменения: `;
            const changes = [];
            if (oldPart.name !== name) changes.push(`название`);
            if (oldPart.material !== material) changes.push(`материал (${oldPart.material} -> ${material})`);
            if (oldPart.target !== target) changes.push(`план (${oldPart.target} -> ${target})`);
            if (oldPart.stock !== stock) changes.push(`в наличии (${oldPart.stock} -> ${stock})`);
            if (oldPart.done !== done) changes.push(`произведено (${oldPart.done} -> ${done})`);
            
            logMsg += changes.length > 0 ? changes.join(', ') : 'без изменений параметров';
            logActivity(logMsg, 'info', id, name);
            showToast('Деталь успешно обновлена', 'success');
        }
    } else {
        // Add New Part
        const newPart = {
            id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            material,
            category,
            target,
            stock,
            done,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        state.parts.push(newPart);
        logActivity(`Добавлена новая корпусная деталь: "${name}" (План: ${target} шт.)`, 'success', newPart.id, name);
        showToast('Деталь успешно добавлена в каталог', 'success');
    }
    
    saveStateToLocalStorage();
    resetForm();
    renderApp();
}

function resetForm() {
    DOM.partForm.reset();
    DOM.partIdInput.value = '';
    
    // Clear validation borders/errors
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    DOM.partNameInput.style.borderColor = 'var(--border-color)';
    DOM.partTargetInput.style.borderColor = 'var(--border-color)';
    DOM.partStockInput.style.borderColor = 'var(--border-color)';
    DOM.partDoneInput.style.borderColor = 'var(--border-color)';
    
    // Restore default layout
    DOM.formTitle.textContent = 'Добавить деталь';
    DOM.submitBtn.querySelector('span').textContent = 'Сохранить';
    DOM.cancelBtn.style.display = 'none';
}

// --- Editing & Deletion Logic ---
function editPart(partId) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;
    
    DOM.partIdInput.value = part.id;
    DOM.partNameInput.value = part.name;
    DOM.partMaterialSelect.value = part.material;
    DOM.partCategorySelect.value = part.category;
    DOM.partTargetInput.value = part.target;
    DOM.partStockInput.value = part.stock;
    DOM.partDoneInput.value = part.done;
    DOM.partDescTextarea.value = part.description;
    
    DOM.formTitle.textContent = 'Редактировать деталь';
    DOM.submitBtn.querySelector('span').textContent = 'Обновить';
    DOM.cancelBtn.style.display = 'block';
    
    // Scroll sidebar into view on mobile
    DOM.partForm.scrollIntoView({ behavior: 'smooth' });
}

function deletePart(partId) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;
    
    if (confirm(`Вы уверены, что хотите полностью удалить деталь "${part.name}" из базы данных?`)) {
        state.parts = state.parts.filter(p => p.id !== partId);
        logActivity(`Удалена деталь: "${part.name}"`, 'danger', partId, part.name);
        
        // If we were editing this part, reset the form
        if (DOM.partIdInput.value === partId) {
            resetForm();
        }
        
        saveStateToLocalStorage();
        showToast('Деталь удалена', 'warning');
        renderApp();
    }
}

// --- Quick Inventory Increments (+/-) ---
function adjustStock(partId, amount) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;
    
    const oldStock = part.stock;
    const newStock = Math.max(0, oldStock + amount);
    
    if (oldStock !== newStock) {
        part.stock = newStock;
        part.updatedAt = new Date().toISOString();
        
        const delta = newStock - oldStock;
        const msg = `Изменено наличие детали "${part.name}": ${delta > 0 ? '+' : ''}${delta} шт. (Текущий склад: ${newStock} шт.)`;
        logActivity(msg, 'info', partId, part.name);
        saveStateToLocalStorage();
        renderApp();
        showToast(`Склад обновлен: ${newStock} шт.`, 'success');
    }
}

function adjustDone(partId, amount) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;
    
    const oldDone = part.done;
    const newDone = Math.max(0, oldDone + amount);
    
    if (oldDone !== newDone) {
        part.done = newDone;
        part.updatedAt = new Date().toISOString();
        
        const delta = newDone - oldDone;
        const msg = `${delta > 0 ? 'Изготовлено деталей' : 'Списан брак/производство'}: "${part.name}" ${delta > 0 ? '+' : ''}${delta} шт. (Всего произведено: ${newDone}/${part.target})`;
        
        let type = 'info';
        if (newDone >= part.target && oldDone < part.target) {
            type = 'success';
        }
        
        logActivity(msg, type, partId, part.name);
        saveStateToLocalStorage();
        renderApp();
        
        if (newDone >= part.target && oldDone < part.target) {
            showToast(`🎉 Производство детали "${part.name}" завершено!`, 'success');
        } else {
            showToast(`Производство: ${newDone} шт.`, 'success');
        }
    }
}

// --- Render Operations ---
function renderApp() {
    renderStats();
    renderPartsList();
}

function renderStats() {
    const totalTypes = state.parts.length;
    let totalTarget = 0;
    let totalDone = 0;
    
    state.parts.forEach(part => {
        totalTarget += part.target;
        // Cap done in overall stats calculation if we just want target coverage,
        // or calculate absolute production. Let's calculate actual progress coverage.
        totalDone += Math.min(part.target, part.done);
    });
    
    // Total raw done (which can theoretically exceed target)
    let absoluteDone = state.parts.reduce((sum, p) => sum + p.done, 0);
    
    DOM.statTotalTypes.textContent = totalTypes;
    DOM.statTotalTarget.textContent = totalTarget;
    DOM.statTotalDone.textContent = absoluteDone;
    
    const progressPercent = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
    DOM.statProgressPercent.textContent = `${progressPercent}%`;
    
    const remaining = Math.max(0, totalTarget - totalDone);
    DOM.statTotalRemaining.textContent = `Осталось сделать: ${remaining} шт.`;
    
    // Update SVG Circle Ring
    const circumference = 201; // 2 * PI * r = 2 * 3.14159 * 32
    const offset = circumference - (progressPercent / 100) * circumference;
    DOM.progressRingCircle.style.strokeDashoffset = offset;
}

function renderPartsList() {
    const searchVal = DOM.searchInput.value.toLowerCase().trim();
    const materialVal = DOM.filterMaterial.value;
    const statusVal = DOM.filterStatus.value;
    const sortVal = DOM.sortBy.value;
    
    // Filter
    let filteredParts = state.parts.filter(part => {
        // Search
        const matchesSearch = part.name.toLowerCase().includes(searchVal) || 
                              part.description.toLowerCase().includes(searchVal);
                              
        // Material
        // Match specific material, or handle Plastic subset
        let matchesMaterial = true;
        if (materialVal !== 'all') {
            if (materialVal === 'Пластик (ABS/PLA)') {
                matchesMaterial = part.material.startsWith('Пластик');
            } else {
                matchesMaterial = part.material === materialVal;
            }
        }
        
        // Status
        let matchesStatus = true;
        if (statusVal === 'completed') {
            matchesStatus = part.done >= part.target;
        } else if (statusVal === 'in-progress') {
            matchesStatus = part.done > 0 && part.done < part.target;
        } else if (statusVal === 'not-started') {
            matchesStatus = part.done === 0;
        }
        
        return matchesSearch && matchesMaterial && matchesStatus;
    });
    
    // Sort
    filteredParts.sort((a, b) => {
        if (sortVal === 'date-desc') {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else if (sortVal === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (sortVal === 'progress-asc') {
            const ratioA = a.target > 0 ? (a.done / a.target) : 0;
            const ratioB = b.target > 0 ? (b.done / b.target) : 0;
            return ratioA - ratioB;
        } else if (sortVal === 'progress-desc') {
            const ratioA = a.target > 0 ? (a.done / a.target) : 0;
            const ratioB = b.target > 0 ? (b.done / b.target) : 0;
            return ratioB - ratioA;
        } else if (sortVal === 'target-desc') {
            return b.target - a.target;
        }
        return 0;
    });
    
    // Render
    DOM.partsContainer.innerHTML = '';
    
    if (filteredParts.length === 0) {
        DOM.partsEmptyState.style.display = 'flex';
        DOM.partsContainer.style.display = 'none';
        return;
    }
    
    DOM.partsEmptyState.style.display = 'none';
    DOM.partsContainer.style.display = 'grid';
    
    filteredParts.forEach(part => {
        const card = document.createElement('div');
        const progressPercent = part.target > 0 ? Math.min(100, Math.round((part.done / part.target) * 100)) : 0;
        
        let statusClass = 'status-not-started';
        if (part.done >= part.target) {
            statusClass = 'status-completed';
        } else if (part.done > 0) {
            statusClass = 'status-in-progress';
        }
        
        card.className = `part-card ${statusClass}`;
        card.innerHTML = `
            <div class="part-card-header">
                <h3 class="part-card-title">${escapeHTML(part.name)}</h3>
                <div class="part-badges">
                    <span class="badge badge-material">${escapeHTML(part.material)}</span>
                    <span class="badge badge-category">${escapeHTML(part.category)}</span>
                </div>
            </div>
            
            <p class="part-description" title="${escapeHTML(part.description)}">
                ${part.description ? escapeHTML(part.description) : '<i>Без описания</i>'}
            </p>
            
            <div class="part-metrics">
                <div class="metric-box">
                    <span class="metric-label">План</span>
                    <span class="metric-value">${part.target}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">В наличии</span>
                    <span class="metric-value">${part.stock}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">Сделано</span>
                    <span class="metric-value">${part.done}</span>
                </div>
            </div>
            
            <div class="part-progress-container">
                <div class="part-progress-header">
                    <span class="part-progress-label">Готовность</span>
                    <span class="part-progress-value">${progressPercent}%</span>
                </div>
                <div class="part-progress-track">
                    <div class="part-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            
            <div class="part-controls">
                <div class="control-row">
                    <span class="control-label">Склад (В наличии)</span>
                    <div class="incrementor">
                        <button class="inc-btn dec-stock" data-id="${part.id}">&minus;</button>
                        <span class="inc-value">${part.stock}</span>
                        <button class="inc-btn add-stock" data-id="${part.id}">&plus;</button>
                    </div>
                </div>
                <div class="control-row">
                    <span class="control-label">Производство</span>
                    <div class="incrementor">
                        <button class="inc-btn dec-done" data-id="${part.id}">&minus;</button>
                        <span class="inc-value">${part.done}</span>
                        <button class="inc-btn add-done" data-id="${part.id}">&plus;</button>
                    </div>
                </div>
            </div>
            
            <div class="part-card-footer">
                <button class="btn-card-action btn-edit-part" data-id="${part.id}" title="Редактировать">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-card-action btn-delete-part" data-id="${part.id}" title="Удалить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        `;
        
        // Increment & Action Handlers
        card.querySelector('.dec-stock').addEventListener('click', () => adjustStock(part.id, -1));
        card.querySelector('.add-stock').addEventListener('click', () => adjustStock(part.id, 1));
        card.querySelector('.dec-done').addEventListener('click', () => adjustDone(part.id, -1));
        card.querySelector('.add-done').addEventListener('click', () => adjustDone(part.id, 1));
        
        card.querySelector('.btn-edit-part').addEventListener('click', () => editPart(part.id));
        card.querySelector('.btn-delete-part').addEventListener('click', () => deletePart(part.id));
        
        DOM.partsContainer.appendChild(card);
    });
}

function renderLogsTimeline() {
    DOM.logsTimelineContainer.innerHTML = '';
    
    if (state.logs.length === 0) {
        DOM.logsTimelineContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px 0;">Лог активности пуст.</p>';
        return;
    }
    
    state.logs.forEach(log => {
        const item = document.createElement('div');
        item.className = `log-item log-${log.type}`;
        
        let iconSvg = '';
        if (log.type === 'success') {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (log.type === 'danger') {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        } else if (log.type === 'warning') {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>`;
        } else {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
        
        const logTime = formatTimestamp(log.timestamp);
        
        item.innerHTML = `
            <div class="log-icon">${iconSvg}</div>
            <div class="log-content">
                <span class="log-text">${escapeHTML(log.text)}</span>
                <span class="log-time">${logTime}</span>
            </div>
        `;
        DOM.logsTimelineContainer.appendChild(item);
    });
}

function handleClearLogs() {
    if (confirm('Вы уверены, что хотите полностью очистить всю историю активности?')) {
        state.logs = [];
        logActivity('Лог активности очищен пользователем', 'info');
        saveStateToLocalStorage();
        renderLogsTimeline();
        showToast('История очищена', 'warning');
    }
}

// --- Backup & Restore (JSON Export / Import) ---
function handleDataExport() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const formattedDate = new Date().toISOString().slice(0, 10);
    const filename = `partflow_backup_${formattedDate}.json`;
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    logActivity('Создана резервная копия базы данных (экспорт в файл)', 'info');
    saveStateToLocalStorage();
    showToast('Копия успешно скачана', 'success');
}

function handleDataImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    DOM.importFilenameStatus.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedData = JSON.parse(evt.target.result);
            
            // Basic validation
            if (importedData && Array.isArray(importedData.parts)) {
                state.parts = importedData.parts;
                state.logs = Array.isArray(importedData.logs) ? importedData.logs : [];
                
                // Add system log
                logActivity(`Импортированы данные из файла "${file.name}"`, 'success');
                
                saveStateToLocalStorage();
                renderApp();
                showToast('Данные успешно импортированы', 'success');
                closeModal(DOM.backupModal);
                
                // Reset file input value so same file can be uploaded again
                DOM.importFileInput.value = '';
                DOM.importFilenameStatus.textContent = 'Файл не выбран';
            } else {
                throw new Error('Некорректная структура файла данных');
            }
        } catch (err) {
            console.error(err);
            showToast('Ошибка импорта: невалидный формат JSON', 'error');
            DOM.importFilenameStatus.textContent = 'Ошибка загрузки';
        }
    };
    reader.readAsText(file);
}

// --- Helper Utilities ---
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString('ru-RU', timeOptions);
    
    if (date.toDateString() === today.toDateString()) {
        return `Сегодня, в ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Вчера, в ${timeStr}`;
    } else {
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return `${date.toLocaleDateString('ru-RU', dateOptions)} в ${timeStr}`;
    }
}
