/**
 * SheetLogger PWA - App Logic
 */

// ============================================
// Constants & Categories
// ============================================

const CATEGORIES = [
    { id: 1, name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
    { id: 2, name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
    { id: 3, name: 'Market', icon: '🛒', color: '#45B7D1' },
    { id: 4, name: 'Faturalar', icon: '💡', color: '#96CEB4' },
    { id: 5, name: 'Eğlence', icon: '🎬', color: '#FFEAA7' },
    { id: 6, name: 'Giyim', icon: '👕', color: '#DDA0DD' },
    { id: 7, name: 'Sağlık', icon: '💊', color: '#98D8C8' },
    { id: 8, name: 'Eğitim', icon: '📚', color: '#F7DC6F' },
    { id: 9, name: 'Kira', icon: '🏠', color: '#BB8FCE' },
    { id: 10, name: 'Diğer', icon: '💰', color: '#85C1E9' }
];

const STORAGE_KEYS = {
    WEBHOOK_URL: 'sheetlogger_webhook_url',
    SETTINGS: 'sheetlogger_settings',
    PASSWORD_HASH: 'sheetlogger_password_hash',
    SESSION_TOKEN: 'sheetlogger_session_token',
    REMEMBER_ME: 'sheetlogger_remember_me'
};

// Default webhook URL kaldırıldı - güvenlik için kullanıcı ayarlardan girmeli
const DEFAULT_WEBHOOK_URL = '';

// ============================================
// State
// ============================================

let state = {
    currentPage: 'dashboard',
    selectedCategory: null,
    expenses: [],
    summary: null,
    filter: null,
    webhookUrl: DEFAULT_WEBHOOK_URL
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Login
    loginScreen: document.getElementById('login-screen'),
    loginForm: document.getElementById('login-form'),
    passwordInput: document.getElementById('password-input'),
    togglePassword: document.getElementById('toggle-password'),
    rememberMe: document.getElementById('remember-me'),
    loginError: document.getElementById('login-error'),
    loginBtn: document.getElementById('login-btn'),
    setupPasswordBtn: document.getElementById('setup-password-btn'),
    setupModal: document.getElementById('setup-modal'),
    newPassword: document.getElementById('new-password'),
    confirmPassword: document.getElementById('confirm-password'),
    setupError: document.getElementById('setup-error'),
    cancelSetup: document.getElementById('cancel-setup'),
    savePasswordBtn: document.getElementById('save-password-btn'),

    loadingScreen: document.getElementById('loading-screen'),
    mainContainer: document.getElementById('main-container'),
    pageTitle: document.getElementById('page-title'),
    pagesContainer: document.getElementById('pages-container'),
    toast: document.getElementById('toast'),

    // Dashboard
    currentMonth: document.getElementById('current-month'),
    totalAmount: document.getElementById('total-amount'),
    expenseCount: document.getElementById('expense-count'),
    categoryCount: document.getElementById('category-count'),
    avgAmount: document.getElementById('avg-amount'),
    categoryChart: document.getElementById('category-chart'),
    recentExpenses: document.getElementById('recent-expenses'),

    // Expenses
    categoryFilters: document.getElementById('category-filters'),
    allExpenses: document.getElementById('all-expenses'),

    // Add Form
    amountInput: document.getElementById('amount-input'),
    descriptionInput: document.getElementById('description-input'),
    dateInput: document.getElementById('date-input'),
    categorySelector: document.getElementById('category-selector'),
    saveExpenseBtn: document.getElementById('save-expense-btn'),

    // Settings
    webhookUrlInput: document.getElementById('webhook-url-input'),
    saveWebhookBtn: document.getElementById('save-webhook-btn'),
    webhookStatus: document.getElementById('webhook-status'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    settingsBtn: document.getElementById('settings-btn'),

    // Password Change
    currentPasswordInput: document.getElementById('current-password-input'),
    newPasswordInput: document.getElementById('new-password-input'),
    confirmNewPasswordInput: document.getElementById('confirm-new-password-input'),
    changePasswordBtn: document.getElementById('change-password-btn'),
    logoutBtn: document.getElementById('logout-btn')
};

// ============================================
// Authentication Functions
// ============================================

// SHA-256 hash function using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate session token
function generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Check if password is set
function isPasswordSet() {
    return localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH) !== null;
}

// Check if user is authenticated
function isAuthenticated() {
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const rememberedToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    return sessionToken !== null || rememberedToken !== null;
}

// Authenticate user
async function authenticate(password) {
    const storedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
    const inputHash = await hashPassword(password);

    if (inputHash === storedHash) {
        const token = generateSessionToken();
        sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);

        if (elements.rememberMe.checked) {
            localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
        }

        return true;
    }
    return false;
}

// Set new password
async function setPassword(password) {
    const hash = await hashPassword(password);
    localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash);
}

// Logout
function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    location.reload();
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', initAuth);

async function initAuth() {
    setupLoginUI();

    // Check authentication state
    if (isPasswordSet()) {
        if (isAuthenticated()) {
            // User is authenticated, show app
            showApp();
        } else {
            // Show login screen
            elements.loginScreen.classList.remove('hidden');
        }
    } else {
        // First time user - show login with setup prompt
        elements.loginScreen.classList.remove('hidden');
        elements.loginBtn.disabled = true;
        elements.passwordInput.placeholder = 'Önce şifre oluşturmalısınız';
        elements.passwordInput.disabled = true;
    }
}

function setupLoginUI() {
    // Login form submit
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = elements.passwordInput.value;
        if (!password) return;

        elements.loginBtn.disabled = true;
        elements.loginBtn.innerHTML = '<span class="login-btn-text">Doğrulanıyor...</span>';

        const success = await authenticate(password);

        if (success) {
            elements.loginError.classList.add('hidden');
            showApp();
        } else {
            elements.loginError.textContent = '❌ Yanlış şifre! Tekrar deneyin.';
            elements.loginError.classList.remove('hidden');
            elements.loginBtn.disabled = false;
            elements.loginBtn.innerHTML = '<span class="login-btn-text">Giriş Yap</span><span class="login-btn-icon">→</span>';
            elements.passwordInput.value = '';
            elements.passwordInput.focus();
        }
    });

    // Toggle password visibility
    elements.togglePassword.addEventListener('click', () => {
        const type = elements.passwordInput.type === 'password' ? 'text' : 'password';
        elements.passwordInput.type = type;
        elements.togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Setup password button
    elements.setupPasswordBtn.addEventListener('click', () => {
        elements.setupModal.classList.remove('hidden');
    });

    // Cancel setup
    elements.cancelSetup.addEventListener('click', () => {
        elements.setupModal.classList.add('hidden');
        elements.newPassword.value = '';
        elements.confirmPassword.value = '';
        elements.setupError.classList.add('hidden');
    });

    // Save new password
    elements.savePasswordBtn.addEventListener('click', async () => {
        const newPass = elements.newPassword.value;
        const confirmPass = elements.confirmPassword.value;

        if (newPass.length < 4) {
            elements.setupError.textContent = 'Şifre en az 4 karakter olmalı!';
            elements.setupError.classList.remove('hidden');
            return;
        }

        if (newPass !== confirmPass) {
            elements.setupError.textContent = 'Şifreler eşleşmiyor!';
            elements.setupError.classList.remove('hidden');
            return;
        }

        await setPassword(newPass);
        elements.setupModal.classList.add('hidden');

        // Enable login
        elements.passwordInput.disabled = false;
        elements.passwordInput.placeholder = 'Şifrenizi girin';
        elements.loginBtn.disabled = false;
        elements.passwordInput.focus();

        showToast('Şifre başarıyla oluşturuldu! ✅', 'success');
    });
}

async function showApp() {
    elements.loginScreen.classList.add('hidden');
    elements.loadingScreen.classList.remove('hidden');

    // Load saved settings
    await loadSettings();

    // Setup UI
    setupNavigation();
    setupCategorySelector();
    setupQuickAmounts();
    setupFormValidation();
    setupSettings();
    setupPasswordChange();

    // Set today's date
    elements.dateInput.value = new Date().toISOString().split('T')[0];

    // Load initial data
    await loadDashboardData();

    // Hide loading screen
    setTimeout(() => {
        elements.loadingScreen.classList.add('hidden');
        elements.mainContainer.classList.remove('hidden');
    }, 500);
}

// ============================================
// Password Change (Settings)
// ============================================

function setupPasswordChange() {
    elements.changePasswordBtn?.addEventListener('click', async () => {
        const currentPass = elements.currentPasswordInput.value;
        const newPass = elements.newPasswordInput.value;
        const confirmPass = elements.confirmNewPasswordInput.value;

        if (!currentPass || !newPass || !confirmPass) {
            showToast('Tüm alanları doldurun!', 'error');
            return;
        }

        // Verify current password
        const currentHash = await hashPassword(currentPass);
        const storedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);

        if (currentHash !== storedHash) {
            showToast('Mevcut şifre yanlış!', 'error');
            return;
        }

        if (newPass.length < 4) {
            showToast('Yeni şifre en az 4 karakter olmalı!', 'error');
            return;
        }

        if (newPass !== confirmPass) {
            showToast('Yeni şifreler eşleşmiyor!', 'error');
            return;
        }

        await setPassword(newPass);

        elements.currentPasswordInput.value = '';
        elements.newPasswordInput.value = '';
        elements.confirmNewPasswordInput.value = '';

        showToast('Şifre başarıyla değiştirildi! ✅', 'success');
    });

    elements.logoutBtn?.addEventListener('click', () => {
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            logout();
        }
    });
}

// ============================================
// Settings & Storage
// ============================================

async function loadSettings() {
    state.webhookUrl = localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || DEFAULT_WEBHOOK_URL;
    elements.webhookUrlInput.value = state.webhookUrl;
}

function saveWebhookUrl(url) {
    state.webhookUrl = url;
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
}

// ============================================
// Navigation
// ============================================

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });

    elements.settingsBtn.addEventListener('click', () => {
        navigateTo('settings');
    });
}

function navigateTo(page) {
    state.currentPage = page;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        expenses: 'Harcamalar',
        add: 'Yeni Harcama',
        settings: 'Ayarlar'
    };
    elements.pageTitle.textContent = titles[page];

    // Load page-specific data
    if (page === 'dashboard') {
        loadDashboardData();
    } else if (page === 'expenses') {
        loadExpenses();
    } else if (page === 'add') {
        resetAddForm();
    }
}

// ============================================
// API Functions
// ============================================

async function apiRequest(method, params = {}) {
    if (!state.webhookUrl) {
        showToast('Webhook URL ayarlanmamış!', 'error');
        return { success: false, error: 'Webhook URL ayarlanmamış' };
    }

    try {
        let response;

        if (method === 'GET') {
            const queryParams = new URLSearchParams(params).toString();
            response = await fetch(`${state.webhookUrl}?${queryParams}`);
        } else {
            response = await fetch(state.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(params)
            });
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// Dashboard
// ============================================

async function loadDashboardData() {
    const now = new Date();
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    elements.currentMonth.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    if (!state.webhookUrl) {
        renderEmptyState(elements.categoryChart, 'Webhook URL ayarlanmamış', 'Ayarlar sayfasından ekleyin');
        renderEmptyState(elements.recentExpenses, 'Henüz harcama yok', '');
        return;
    }

    // Load summary
    const summaryResult = await apiRequest('GET', {
        action: 'summary',
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });

    if (summaryResult.success && summaryResult.data) {
        state.summary = summaryResult.data;
        renderSummary(summaryResult.data);
    }

    // Load recent expenses
    const expensesResult = await apiRequest('GET', {
        action: 'list',
        limit: 5
    });

    if (expensesResult.success && expensesResult.data) {
        renderRecentExpenses(expensesResult.data);
    }
}

function renderSummary(data) {
    elements.totalAmount.textContent = formatCurrency(data.totalAmount);
    elements.expenseCount.textContent = data.expenseCount;
    elements.categoryCount.textContent = data.categoryBreakdown?.length || 0;
    elements.avgAmount.textContent = data.expenseCount > 0
        ? formatNumber(data.totalAmount / data.expenseCount)
        : '0';

    renderCategoryChart(data.categoryBreakdown || []);
}

function renderCategoryChart(breakdown) {
    if (!breakdown.length) {
        elements.categoryChart.innerHTML = '<p class="empty-state-text">Henüz harcama yok</p>';
        return;
    }

    const maxAmount = Math.max(...breakdown.map(b => b.amount));

    elements.categoryChart.innerHTML = breakdown.slice(0, 5).map(item => {
        const category = CATEGORIES.find(c => c.name === item.category) || { icon: '💰', color: '#85C1E9' };
        const percentage = (item.amount / maxAmount) * 100;

        return `
            <div class="category-bar">
                <div class="category-bar-header">
                    <span class="category-bar-name">
                        ${category.icon} ${item.category}
                    </span>
                    <span class="category-bar-amount">${formatCurrency(item.amount)} (${item.percentage}%)</span>
                </div>
                <div class="category-bar-track">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${category.color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRecentExpenses(expenses) {
    if (!expenses.length) {
        renderEmptyState(elements.recentExpenses, 'Henüz harcama yok', '+ butonuna tıklayarak ekleyin');
        return;
    }

    elements.recentExpenses.innerHTML = expenses.map(expense => renderExpenseCard(expense)).join('');
}

// ============================================
// Expenses List
// ============================================

async function loadExpenses() {
    renderCategoryFilters();

    if (!state.webhookUrl) {
        renderEmptyState(elements.allExpenses, 'Webhook URL ayarlanmamış', '');
        return;
    }

    const params = { action: 'list' };
    if (state.filter) {
        params.category = state.filter;
    }

    const result = await apiRequest('GET', params);

    if (result.success && result.data) {
        state.expenses = result.data;
        renderAllExpenses(result.data);
    }
}

function renderCategoryFilters() {
    const filters = [
        { name: 'Tümü', icon: '📊', value: null },
        ...CATEGORIES.map(c => ({ name: c.name, icon: c.icon, value: c.name }))
    ];

    elements.categoryFilters.innerHTML = filters.map(f => `
        <button class="filter-chip ${state.filter === f.value ? 'active' : ''}" data-filter="${f.value || ''}">
            ${f.icon} ${f.name}
        </button>
    `).join('');

    elements.categoryFilters.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            state.filter = chip.dataset.filter || null;
            loadExpenses();
        });
    });
}

function renderAllExpenses(expenses) {
    if (!expenses.length) {
        const message = state.filter
            ? `"${state.filter}" kategorisinde harcama yok`
            : 'Henüz harcama yok';
        renderEmptyState(elements.allExpenses, message, '');
        return;
    }

    elements.allExpenses.innerHTML = expenses.map(expense =>
        renderExpenseCard(expense, true)
    ).join('');

    // Add delete handlers
    elements.allExpenses.querySelectorAll('.expense-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
                await deleteExpense(id);
            }
        });
    });
}

function renderExpenseCard(expense, showDelete = false) {
    const category = CATEGORIES.find(c => c.name === expense.category) || { icon: '💰', color: '#85C1E9' };

    return `
        <div class="expense-card">
            <div class="expense-icon" style="background: ${category.color}20">
                ${category.icon}
            </div>
            <div class="expense-content">
                <div class="expense-description">${expense.description || expense.category}</div>
                <div class="expense-meta">
                    <span class="expense-category" style="background: ${category.color}20; color: ${category.color}">
                        ${category.icon} ${expense.category}
                    </span>
                    <span class="expense-date">${formatDate(expense.date)}</span>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            ${showDelete ? `<button class="expense-delete" data-id="${expense.id}">🗑️</button>` : ''}
        </div>
    `;
}

async function deleteExpense(id) {
    const result = await apiRequest('POST', { action: 'delete', id });

    if (result.success) {
        showToast('Harcama silindi', 'success');
        loadExpenses();
        loadDashboardData();
    } else {
        showToast('Silme başarısız: ' + result.error, 'error');
    }
}

// ============================================
// Add Expense Form
// ============================================

function setupCategorySelector() {
    elements.categorySelector.innerHTML = CATEGORIES.map(cat => `
        <button type="button" class="category-btn" data-category="${cat.name}">
            <span class="category-btn-icon">${cat.icon}</span>
            <span class="category-btn-name">${cat.name}</span>
        </button>
    `).join('');

    elements.categorySelector.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categorySelector.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedCategory = btn.dataset.category;
            validateForm();
        });
    });
}

function setupQuickAmounts() {
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.amountInput.value = btn.dataset.amount;
            validateForm();
        });
    });
}

function setupFormValidation() {
    elements.amountInput.addEventListener('input', validateForm);

    elements.saveExpenseBtn.addEventListener('click', saveExpense);
}

function validateForm() {
    const amount = parseFloat(elements.amountInput.value) || 0;
    const isValid = amount > 0 && state.selectedCategory;
    elements.saveExpenseBtn.disabled = !isValid;
}

function resetAddForm() {
    elements.amountInput.value = '';
    elements.descriptionInput.value = '';
    elements.dateInput.value = new Date().toISOString().split('T')[0];
    state.selectedCategory = null;
    elements.categorySelector.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    elements.saveExpenseBtn.disabled = true;
}

async function saveExpense() {
    const amount = parseFloat(elements.amountInput.value);
    const description = elements.descriptionInput.value.trim();
    const date = elements.dateInput.value;
    const category = state.selectedCategory;

    if (!amount || !category) {
        showToast('Lütfen tutar ve kategori girin', 'error');
        return;
    }

    elements.saveExpenseBtn.disabled = true;
    elements.saveExpenseBtn.textContent = 'Kaydediliyor...';

    const result = await apiRequest('POST', {
        action: 'add',
        amount,
        category,
        description,
        date
    });

    elements.saveExpenseBtn.textContent = 'Harcamayı Kaydet';

    if (result.success) {
        showToast('Harcama başarıyla eklendi! ✅', 'success');
        resetAddForm();
        navigateTo('dashboard');
    } else {
        showToast('Hata: ' + result.error, 'error');
        elements.saveExpenseBtn.disabled = false;
    }
}

// ============================================
// Settings
// ============================================

function setupSettings() {
    elements.saveWebhookBtn.addEventListener('click', async () => {
        const url = elements.webhookUrlInput.value.trim();

        if (!url) {
            showWebhookStatus('Lütfen URL girin', 'error');
            return;
        }

        if (!url.startsWith('https://script.google.com/')) {
            showWebhookStatus('Geçersiz URL. "https://script.google.com/" ile başlamalı', 'error');
            return;
        }

        elements.saveWebhookBtn.disabled = true;
        elements.saveWebhookBtn.textContent = 'Doğrulanıyor...';

        // Save and test
        saveWebhookUrl(url);

        const result = await apiRequest('GET', { action: 'categories' });

        elements.saveWebhookBtn.disabled = false;
        elements.saveWebhookBtn.textContent = 'Kaydet ve Doğrula';

        if (result.success) {
            showWebhookStatus('✓ Webhook doğrulandı ve kaydedildi!', 'success');
            showToast('Webhook başarıyla kaydedildi', 'success');
        } else {
            showWebhookStatus('Doğrulama başarısız. URL\'yi kontrol edin.', 'error');
        }
    });

    elements.clearDataBtn.addEventListener('click', () => {
        if (confirm('Tüm ayarları silmek istediğinize emin misiniz?')) {
            localStorage.clear();
            state.webhookUrl = '';
            elements.webhookUrlInput.value = '';
            showToast('Tüm ayarlar temizlendi', 'success');
            showWebhookStatus('', '');
        }
    });
}

function showWebhookStatus(message, type) {
    elements.webhookStatus.textContent = message;
    elements.webhookStatus.className = `webhook-status ${type}`;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0) + ' ₺';
}

function formatNumber(num) {
    return new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0
    }).format(num || 0);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) return 'Bugün';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Dün';

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function renderEmptyState(container, title, message) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-text">${message}</div>
        </div>
    `;
}

function showToast(message, type = '') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Service Worker Registration
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}
