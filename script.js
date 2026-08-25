/* ==========================================================================
   FRIEND MONEY TRACKER - CORE JAVASCRIPT APP LOGIC
   ========================================================================== */

(function () {
    'use strict';

    // ----------------------------------------------------------------------
    // 1. CONSTANTS & INITIAL STATE
    // ----------------------------------------------------------------------
    const STORAGE_KEY = 'friend_money_tracker_loans_v2';
    const THEME_KEY = 'friend_money_tracker_theme';
    const LANG_KEY = 'friend_money_tracker_lang';

    let loans = [];
    let currentDeleteId = null;
    let currentFriendNameProfile = null;
    let statusChartInstance = null;
    let debtorsChartInstance = null;

    // Helper to generate dates relative to today (YYYY-MM-DD)
    function getRelativeDate(daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
    }

    // 7 Realistic Sample College Student Loans for Demo
    const SAMPLE_LOANS = [
        {
            id: 'loan_1',
            name: 'Rahul Sharma',
            phone: '9876543210',
            amount: 1500,
            paidAmount: 500,
            dateLent: getRelativeDate(-12),
            dueDate: getRelativeDate(-2), // Overdue
            reason: 'Canteen bill & Lab Printout notes',
            notes: 'Promised to repay after receiving monthly allowance',
            payments: [
                { id: 'p1', amount: 500, date: getRelativeDate(-5), note: 'UPI via GPay' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_2',
            name: 'Priya Nair',
            phone: '9812345678',
            amount: 750,
            paidAmount: 0,
            dateLent: getRelativeDate(-10),
            dueDate: getRelativeDate(-1), // Overdue
            reason: 'Birthday Gift Group Share',
            notes: 'Split for Ananya\'s surprise party',
            payments: [],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_3',
            name: 'Ankit Kumar',
            phone: '9765432109',
            amount: 2500,
            paidAmount: 1000,
            dateLent: getRelativeDate(-4),
            dueDate: getRelativeDate(5), // Upcoming
            reason: 'Semester Exam Registration Fee',
            notes: 'Paid partially in cash',
            payments: [
                { id: 'p2', amount: 1000, date: getRelativeDate(-1), note: 'Cash' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_4',
            name: 'Sneha Patel',
            phone: '9654321098',
            amount: 450,
            paidAmount: 0,
            dateLent: getRelativeDate(-2),
            dueDate: getRelativeDate(3), // Upcoming
            reason: 'Coffee & Snacks at Campus Cafe',
            notes: '',
            payments: [],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_5',
            name: 'Vikram Singh',
            phone: '9988776655',
            amount: 1200,
            paidAmount: 1200,
            dateLent: getRelativeDate(-20),
            dueDate: getRelativeDate(-10),
            reason: 'Weekend Trip to Munnar',
            notes: 'Settled in full via PhonePe',
            payments: [
                { id: 'p3', amount: 1200, date: getRelativeDate(-10), note: 'PhonePe Transfer' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_6',
            name: 'Faisal Khan',
            phone: '9845012345',
            amount: 1800,
            paidAmount: 0,
            dateLent: getRelativeDate(-3),
            dueDate: getRelativeDate(12),
            reason: 'Engineering Mathematics Textbooks',
            notes: 'Will return after book grant arrives',
            payments: [],
            createdAt: new Date().toISOString()
        },
        {
            id: 'loan_7',
            name: 'Devika Pillai',
            phone: '9744112233',
            amount: 950,
            paidAmount: 300,
            dateLent: getRelativeDate(-15),
            dueDate: getRelativeDate(-4), // Overdue
            reason: 'Project Hardware Components (Arduino & Sensors)',
            notes: 'Partial payment made last week',
            payments: [
                { id: 'p4', amount: 300, date: getRelativeDate(-7), note: 'Paytm' }
            ],
            createdAt: new Date().toISOString()
        }
    ];

    // ----------------------------------------------------------------------
    // 2. MALAYALAM LOCALIZATION DICTIONARY (I18N)
    // ----------------------------------------------------------------------
    const TRANSLATIONS = {
        en: {
            nav_dashboard: 'Dashboard',
            nav_loans: 'Loans & Friends',
            nav_reminders: 'Reminders',
            nav_ai: 'AI Assistant',
            theme_dark: 'Dark Mode',
            btn_about: 'About Project (AI)',
            btn_backup: 'Backup & Restore',
            btn_add_loan: 'Add Loan',
            title_dashboard: 'Dashboard Overview',
            subtitle_dashboard: 'Track money lent, repayments, and overdue balances',
            stat_total_lent: 'Total Money Lent',
            stat_total_repaid: 'Total Repaid',
            stat_outstanding: 'Outstanding Amount',
            stat_debtors_count: 'Friends Who Owe',
            stat_overdue_amt: 'Overdue Amount',
            stat_upcoming_count: 'Upcoming Repayments',
            chart_status: 'Loan Status Breakdown',
            chart_debtors: 'Top Outstanding Balances',
            title_urgent: 'Urgent Overdue & Upcoming Repayments',
            btn_view_all_reminders: 'View All Reminders',
            ph_search: 'Search by friend\'s name or reason...',
            lbl_status: 'Status:',
            lbl_sort: 'Sort By:',
            empty_title: 'No loans found',
            empty_desc: 'There are no loans matching your search or filter options. Add a new loan to get started!',
            title_overdue_section: 'Overdue Repayments',
            title_upcoming_section: 'Upcoming Repayments (Next 7 Days)',
            title_ai_insights: 'AI Money Insights',
            title_ai_generator: 'AI Polite Reminder Generator',
            desc_ai_generator: 'Generate polite, non-aggressive reminder message templates tailored for college friends.',
            lbl_select_friend: 'Select Friend / Loan:',
            lbl_select_tone: 'Choose Message Tone:',
            btn_generate_msg: 'Generate Reminder Message',
            btn_copy_msg: 'Copy Message'
        },
        ml: {
            nav_dashboard: 'ഡാഷ്‌ബോർഡ്',
            nav_loans: 'വായ്‌പകളും സുഹൃത്തുക്കളും',
            nav_reminders: 'ഓർമ്മപ്പെടുത്തലുകൾ',
            nav_ai: 'AI അസിസ്റ്റന്റ്',
            theme_dark: 'ഡാർക്ക് മോഡ്',
            btn_about: 'പ്രോജക്റ്റ് വിവരം (AI)',
            btn_backup: 'ബാക്കപ്പും പുനഃസ്ഥാപനവും',
            btn_add_loan: 'വായ്‌പ ചേർക്കുക',
            title_dashboard: 'ഡാഷ്‌ബോർഡ് അവലോകനം',
            subtitle_dashboard: 'നൽകിയ പണം, തിരിച്ചടവുകൾ, കുടിശ്ശികകൾ എന്നിവ ട്രാക്ക് ചെയ്യുക',
            stat_total_lent: 'ആകെ നൽകിയ തുക',
            stat_total_repaid: 'തിരിച്ചു ലഭിച്ച തുക',
            stat_outstanding: 'ബാക്കി ലഭിക്കാനുള്ള തുക',
            stat_debtors_count: 'പണം തരാനുള്ള സുഹൃത്തുക്കൾ',
            stat_overdue_amt: 'കാലാവധി കഴിഞ്ഞ തുക',
            stat_upcoming_count: 'അടുത്ത തിരിച്ചടവുകൾ',
            chart_status: 'വായ്‌പ നിലയുടെ ചാർട്ട്',
            chart_debtors: 'കൂടുതൽ തുക തരാനുള്ളവർ',
            title_urgent: 'ഉടൻ തിരിച്ചടയ്ക്കേണ്ട വായ്പകൾ',
            btn_view_all_reminders: 'എല്ലാ ഓർമ്മപ്പെടുത്തലുകളും കാണുക',
            ph_search: 'പേരോ വിവരമോ തിരയുക...',
            lbl_status: 'സ്റ്റാറ്റസ്:',
            lbl_sort: 'ക്രമീകരിക്കുക:',
            empty_title: 'വായ്‌പകളൊന്നും കണ്ടെത്തിയില്ല',
            empty_desc: 'തിരഞ്ഞെടുത്ത വിവരങ്ങളുമായി പൊരുത്തപ്പെടുന്ന വായ്പകളില്ല.',
            title_overdue_section: 'കാലാവധി കഴിഞ്ഞ തിരിച്ചടവുകൾ',
            title_upcoming_section: 'വരാനിരിക്കുന്ന തിരിച്ചടവുകൾ (7 ദിവസത്തിനുള്ളിൽ)',
            title_ai_insights: 'AI ധനകാര്യ വിശകലനം',
            title_ai_generator: 'AI ഓർമ്മപ്പെടുത്തൽ സന്ദേശം',
            desc_ai_generator: 'സുഹൃത്തുക്കൾക്ക് അയക്കാൻ മാന്യമായ ഓർമ്മപ്പെടുത്തൽ സന്ദേശങ്ങൾ നിർമ്മിക്കുക.',
            lbl_select_friend: 'സുഹൃത്തിനെ തിരഞ്ഞെടുക്കുക:',
            lbl_select_tone: 'സന്ദേശത്തിന്റെ ശൈലി:',
            btn_generate_msg: 'സന്ദേശം തയ്യാറാക്കുക',
            btn_copy_msg: 'കോപ്പി ചെയ്യുക'
        }
    };

    let currentLang = 'en';

    // ----------------------------------------------------------------------
    // 3. HELPERS & FORMATTERS
    // ----------------------------------------------------------------------
    function formatRupee(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }

    function getDaysDiff(targetDateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(targetDateString);
        target.setHours(0, 0, 0, 0);
        const diffTime = target - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function getLoanStatus(loan) {
        const remaining = loan.amount - loan.paidAmount;
        if (remaining <= 0) return 'Paid';

        const days = getDaysDiff(loan.dueDate);
        if (days < 0) return 'Overdue';
        if (loan.paidAmount > 0) return 'Partially Paid';
        return 'Pending';
    }

    function getStatusBadgeHTML(status) {
        switch (status) {
            case 'Paid':
                return `<span class="badge badge-paid"><i class="fa-solid fa-circle-check"></i> Paid</span>`;
            case 'Partially Paid':
                return `<span class="badge badge-partially-paid"><i class="fa-solid fa-pie-chart"></i> Partially Paid</span>`;
            case 'Overdue':
                return `<span class="badge badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Overdue</span>`;
            default:
                return `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
        }
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'danger') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ----------------------------------------------------------------------
    // 4. LOCALSTORAGE MANAGEMENT
    // ----------------------------------------------------------------------
    function loadData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                loans = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse local storage loans', e);
                loans = [...SAMPLE_LOANS];
            }
        } else {
            loans = [...SAMPLE_LOANS];
            saveData();
        }

        currentLang = localStorage.getItem(LANG_KEY) || 'en';
        document.getElementById('lang-toggle-select').value = currentLang;
        applyLanguage(currentLang);
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
        renderApp();
    }

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        document.documentElement.setAttribute('data-lang', lang);

        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });

        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (dict[key]) el.placeholder = dict[key];
        });
    }

    // ----------------------------------------------------------------------
    // 5. MAIN RENDER CONTROLLER
    // ----------------------------------------------------------------------
    function renderApp() {
        updateDashboardStats();
        renderStatusChart();
        renderDebtorsChart();
        renderDashboardUrgentList();
        renderLoansGrid();
        renderRemindersTab();
        renderAIInsights();
        populateAIFriendDropdown();
    }

    // ----------------------------------------------------------------------
    // 6. DASHBOARD & CHARTS
    // ----------------------------------------------------------------------
    function updateDashboardStats() {
        let totalLent = 0;
        let totalReceived = 0;
        let totalOwed = 0;
        let overdueAmount = 0;
        let upcomingCount = 0;
        const activeDebtorsSet = new Set();

        loans.forEach(loan => {
            const status = getLoanStatus(loan);
            const remaining = loan.amount - loan.paidAmount;
            const days = getDaysDiff(loan.dueDate);

            totalLent += Number(loan.amount);
            totalReceived += Number(loan.paidAmount);
            totalOwed += Math.max(0, remaining);

            if (remaining > 0) {
                activeDebtorsSet.add(loan.name.trim().toLowerCase());
            }

            if (status === 'Overdue') {
                overdueAmount += Math.max(0, remaining);
            }

            if (remaining > 0 && days >= 0 && days <= 7 && status !== 'Overdue') {
                upcomingCount++;
            }
        });

        // DOM elements
        document.getElementById('stat-total-lent').textContent = formatRupee(totalLent);
        document.getElementById('stat-total-received').textContent = formatRupee(totalReceived);
        document.getElementById('stat-total-owed').textContent = formatRupee(totalOwed);
        document.getElementById('stat-active-debtors').textContent = activeDebtorsSet.size;
        document.getElementById('stat-overdue-amount').textContent = formatRupee(overdueAmount);
        document.getElementById('stat-upcoming-count').textContent = upcomingCount;
        
        const overdueLoansCount = loans.filter(l => getLoanStatus(l) === 'Overdue').length;
        document.getElementById('overdue-badge').textContent = overdueLoansCount;

        // Dynamic Banner Message
        const bannerTitle = document.getElementById('ai-banner-headline');
        const bannerDetail = document.getElementById('ai-banner-detail');

        if (overdueAmount > 0) {
            bannerTitle.textContent = `⚠️ Action Needed: ${formatRupee(overdueAmount)} is Overdue`;
            bannerDetail.textContent = `You have ${overdueLoansCount} overdue payment(s). Click to generate non-aggressive AI reminder messages for WhatsApp!`;
        } else if (totalOwed > 0) {
            const collectionRate = totalLent > 0 ? Math.round((totalReceived / totalLent) * 100) : 0;
            bannerTitle.textContent = `💡 Collection Rate: ${collectionRate}% settled`;
            bannerDetail.textContent = `You have ${formatRupee(totalOwed)} currently outstanding across ${activeDebtorsSet.size} friends. All loans are within due dates.`;
        } else {
            bannerTitle.textContent = `🎉 Excellent! 100% Repayment Achieved`;
            bannerDetail.textContent = `All money lent to friends has been fully repaid back into your account.`;
        }
    }

    function renderStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        const statusCounts = { Pending: 0, 'Partially Paid': 0, Overdue: 0, Paid: 0 };
        loans.forEach(loan => {
            const status = getLoanStatus(loan);
            statusCounts[status]++;
        });

        if (statusChartInstance) {
            statusChartInstance.destroy();
        }

        statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Partially Paid', 'Overdue', 'Paid'],
                datasets: [{
                    data: [
                        statusCounts['Pending'],
                        statusCounts['Partially Paid'],
                        statusCounts['Overdue'],
                        statusCounts['Paid']
                    ],
                    backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--bg-card')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                            font: { family: 'Plus Jakarta Sans', size: 12 }
                        }
                    }
                }
            }
        });
    }

    function renderDebtorsChart() {
        const ctx = document.getElementById('debtorsChart');
        if (!ctx) return;

        const debtorMap = {};
        loans.forEach(loan => {
            const remaining = loan.amount - loan.paidAmount;
            if (remaining > 0) {
                debtorMap[loan.name] = (debtorMap[loan.name] || 0) + remaining;
            }
        });

        const sortedDebtors = Object.entries(debtorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const labels = sortedDebtors.map(item => item[0]);
        const data = sortedDebtors.map(item => item[1]);

        if (debtorsChartInstance) {
            debtorsChartInstance.destroy();
        }

        debtorsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Active Debtors'],
                datasets: [{
                    label: 'Amount Owed (₹)',
                    data: data.length ? data : [0],
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') },
                        grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                    }
                }
            }
        });
    }

    function renderDashboardUrgentList() {
        const container = document.getElementById('dashboard-urgent-list');
        if (!container) return;

        const urgentLoans = loans.filter(l => {
            const status = getLoanStatus(l);
            const days = getDaysDiff(l.dueDate);
            return (status === 'Overdue' || (status !== 'Paid' && days <= 3));
        });

        if (urgentLoans.length === 0) {
            container.innerHTML = `
                <div class="text-muted text-center" style="padding:1.5rem;">
                    <i class="fa-solid fa-shield-check" style="font-size:2rem; margin-bottom:0.5rem; color:var(--emerald);"></i>
                    <p>No urgent or overdue repayments! All friend loans are in good standing.</p>
                </div>`;
            return;
        }

        container.innerHTML = urgentLoans.map(loan => {
            const status = getLoanStatus(loan);
            const remaining = loan.amount - loan.paidAmount;
            const days = getDaysDiff(loan.dueDate);

            let dueText = '';
            if (days < 0) {
                dueText = `<span class="text-danger">Overdue by ${Math.abs(days)} day(s)</span>`;
            } else if (days === 0) {
                dueText = `<span class="text-warning">Repayment due today!</span>`;
            } else {
                dueText = `<span class="text-warning">Due in ${days} day(s) (${formatDate(loan.dueDate)})</span>`;
            }

            return `
                <div class="urgent-item">
                    <div class="urgent-info">
                        <div class="urgent-avatar view-friend-profile-btn" data-name="${escapeHTML(loan.name)}">${loan.name.charAt(0).toUpperCase()}</div>
                        <div class="urgent-details">
                            <h5 class="view-friend-profile-btn" data-name="${escapeHTML(loan.name)}">${escapeHTML(loan.name)}</h5>
                            <p>${dueText} • ${escapeHTML(loan.reason)}</p>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <strong class="text-danger" style="font-size:1.05rem;">${formatRupee(remaining)}</strong>
                        <button class="btn-primary btn-sm open-payment-modal-btn" data-id="${loan.id}">
                            <i class="fa-solid fa-hand-holding-dollar"></i> Pay
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    // ----------------------------------------------------------------------
    // 7. LOANS GRID, SEARCH & FILTER
    // ----------------------------------------------------------------------
    function renderLoansGrid() {
        const container = document.getElementById('loans-cards-container');
        const emptyState = document.getElementById('empty-loans-state');
        if (!container) return;

        const searchQuery = (document.getElementById('search-input').value || '').trim().toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        // Filter Logic
        let filtered = loans.filter(loan => {
            const status = getLoanStatus(loan);
            const remaining = loan.amount - loan.paidAmount;

            const matchSearch = loan.name.toLowerCase().includes(searchQuery) ||
                                loan.reason.toLowerCase().includes(searchQuery) ||
                                (loan.phone && loan.phone.includes(searchQuery));

            let matchStatus = true;
            if (statusFilter === 'UNPAID') matchStatus = remaining > 0;
            else if (statusFilter !== 'ALL') matchStatus = (status === statusFilter);

            return matchSearch && matchStatus;
        });

        // Sort Logic
        filtered.sort((a, b) => {
            const remA = a.amount - a.paidAmount;
            const remB = b.amount - b.paidAmount;

            if (sortBy === 'newest') return new Date(b.dateLent) - new Date(a.dateLent);
            if (sortBy === 'oldest') return new Date(a.dateLent) - new Date(b.dateLent);
            if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
            if (sortBy === 'amountHigh') return remB - remA;
            if (sortBy === 'amountLow') return remA - remB;
            return 0;
        });

        if (filtered.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = filtered.map(loan => {
            const status = getLoanStatus(loan);
            const remaining = loan.amount - loan.paidAmount;
            const percentPaid = Math.min(100, Math.round((loan.paidAmount / loan.amount) * 100));

            return `
                <div class="loan-card" id="card-${loan.id}">
                    <div class="loan-card-top">
                        <div class="borrower-info">
                            <div class="borrower-avatar view-friend-profile-btn" data-name="${escapeHTML(loan.name)}" title="Click to view friend profile">${loan.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h4 class="borrower-name view-friend-profile-btn" data-name="${escapeHTML(loan.name)}" title="Click to view friend profile">${escapeHTML(loan.name)}</h4>
                                ${loan.phone ? `<span class="borrower-phone"><i class="fa-solid fa-phone"></i> ${escapeHTML(loan.phone)}</span>` : '<span class="borrower-phone">No phone</span>'}
                            </div>
                        </div>
                        <div>${getStatusBadgeHTML(status)}</div>
                    </div>

                    <div class="loan-financials">
                        <div class="fin-box">
                            <span class="fin-label">Total Lent</span>
                            <span class="fin-value">${formatRupee(loan.amount)}</span>
                        </div>
                        <div class="fin-box">
                            <span class="fin-label">Repaid</span>
                            <span class="fin-value text-success">${formatRupee(loan.paidAmount)}</span>
                        </div>
                        <div class="fin-box">
                            <span class="fin-label">Remaining</span>
                            <span class="fin-value ${remaining > 0 ? 'text-danger' : 'text-muted'}">${formatRupee(remaining)}</span>
                        </div>
                    </div>

                    <div class="progress-container">
                        <div class="progress-labels">
                            <span>Progress</span>
                            <span><strong>${percentPaid}% Repaid</strong></span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${percentPaid}%;"></div>
                        </div>
                    </div>

                    <div class="loan-meta">
                        <div class="meta-row">
                            <i class="fa-solid fa-tag"></i> <span>Reason: <strong>${escapeHTML(loan.reason)}</strong></span>
                        </div>
                        <div class="meta-row">
                            <i class="fa-solid fa-calendar-days"></i> <span>Date Lent: ${formatDate(loan.dateLent)}</span>
                        </div>
                        <div class="meta-row">
                            <i class="fa-solid fa-calendar-check"></i> <span>Due Date: <strong>${formatDate(loan.dueDate)}</strong></span>
                        </div>
                        ${loan.notes ? `
                        <div class="meta-row">
                            <i class="fa-solid fa-note-sticky"></i> <span>Notes: <em>${escapeHTML(loan.notes)}</em></span>
                        </div>` : ''}
                    </div>

                    <div class="loan-card-actions">
                        ${remaining > 0 ? `
                            <button class="btn-success btn-sm open-payment-modal-btn" data-id="${loan.id}">
                                <i class="fa-solid fa-hand-holding-dollar"></i> Pay
                            </button>
                        ` : `
                            <button class="btn-secondary btn-sm" disabled style="opacity:0.6;">
                                <i class="fa-solid fa-check-double"></i> Settled
                            </button>
                        `}

                        <button class="btn-secondary btn-sm view-friend-profile-btn" data-name="${escapeHTML(loan.name)}" title="Friend Profile">
                            <i class="fa-solid fa-user"></i> Profile
                        </button>
                        
                        <button class="btn-icon open-edit-modal-btn" data-id="${loan.id}" title="Edit Loan">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button class="btn-icon open-delete-modal-btn" data-id="${loan.id}" title="Delete Loan">
                            <i class="fa-solid fa-trash-can" style="color:var(--rose);"></i>
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    // ----------------------------------------------------------------------
    // 8. REMINDERS TAB LOGIC
    // ----------------------------------------------------------------------
    function renderRemindersTab() {
        const overdueContainer = document.getElementById('overdue-reminders-list');
        const upcomingContainer = document.getElementById('upcoming-reminders-list');
        
        const overdueBadge = document.getElementById('count-overdue-badge');
        const upcomingBadge = document.getElementById('count-upcoming-badge');

        if (!overdueContainer || !upcomingContainer) return;

        const overdueLoans = [];
        const upcomingLoans = [];

        loans.forEach(loan => {
            const status = getLoanStatus(loan);
            const days = getDaysDiff(loan.dueDate);
            const remaining = loan.amount - loan.paidAmount;

            if (remaining > 0) {
                if (status === 'Overdue') {
                    overdueLoans.push(loan);
                } else if (days >= 0 && days <= 7) {
                    upcomingLoans.push(loan);
                }
            }
        });

        overdueBadge.textContent = overdueLoans.length;
        upcomingBadge.textContent = upcomingLoans.length;

        // Render Overdue Cards
        if (overdueLoans.length === 0) {
            overdueContainer.innerHTML = `<p class="text-muted text-sm">No overdue repayments! Everyone is up to date.</p>`;
        } else {
            overdueContainer.innerHTML = overdueLoans.map(loan => {
                const remaining = loan.amount - loan.paidAmount;
                const daysOverdue = Math.abs(getDaysDiff(loan.dueDate));
                const alertText = `⚠️ ${loan.name} owes you ${formatRupee(remaining)}. The repayment date was ${daysOverdue} day(s) ago (${formatDate(loan.dueDate)}).`;
                const politeText = `Hey ${loan.name}! Just a friendly reminder about the ${formatRupee(remaining)} for ${loan.reason}. Whenever you get a chance to transfer it, please let me know. Thanks! 😊`;

                return `
                    <div class="reminder-card reminder-card-overdue">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 class="view-friend-profile-btn" data-name="${escapeHTML(loan.name)}" style="cursor:pointer;">${escapeHTML(loan.name)}</h4>
                            <span class="badge badge-overdue">${daysOverdue} Days Overdue</span>
                        </div>
                        <p class="reminder-msg-preview">"${politeText}"</p>
                        <div class="reminder-actions">
                            <button class="btn-secondary btn-sm copy-text-btn" data-msg="${escapeHTML(politeText)}">
                                <i class="fa-regular fa-copy"></i> Copy Message
                            </button>
                            <button class="btn-whatsapp btn-sm trigger-whatsapp-btn" data-phone="${loan.phone || ''}" data-msg="${escapeHTML(politeText)}">
                                <i class="fa-brands fa-whatsapp"></i> Send WhatsApp
                            </button>
                        </div>
                    </div>`;
            }).join('');
        }

        // Render Upcoming Cards
        if (upcomingLoans.length === 0) {
            upcomingContainer.innerHTML = `<p class="text-muted text-sm">No upcoming repayments due in the next 7 days.</p>`;
        } else {
            upcomingContainer.innerHTML = upcomingLoans.map(loan => {
                const remaining = loan.amount - loan.paidAmount;
                const daysLeft = getDaysDiff(loan.dueDate);
                const dueLabel = daysLeft === 0 ? 'Today' : `in ${daysLeft} day(s)`;
                const politeText = `Hi ${loan.name}! Hope you're doing well. Friendly reminder about the ${formatRupee(remaining)} for ${loan.reason} due ${dueLabel} (${formatDate(loan.dueDate)}). Thanks! 😊`;

                return `
                    <div class="reminder-card reminder-card-upcoming">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 class="view-friend-profile-btn" data-name="${escapeHTML(loan.name)}" style="cursor:pointer;">${escapeHTML(loan.name)}</h4>
                            <span class="badge badge-pending">Due ${dueLabel}</span>
                        </div>
                        <p class="reminder-msg-preview">"${politeText}"</p>
                        <div class="reminder-actions">
                            <button class="btn-secondary btn-sm copy-text-btn" data-msg="${escapeHTML(politeText)}">
                                <i class="fa-regular fa-copy"></i> Copy Message
                            </button>
                            <button class="btn-whatsapp btn-sm trigger-whatsapp-btn" data-phone="${loan.phone || ''}" data-msg="${escapeHTML(politeText)}">
                                <i class="fa-brands fa-whatsapp"></i> Send WhatsApp
                            </button>
                        </div>
                    </div>`;
            }).join('');
        }
    }

    // ----------------------------------------------------------------------
    // 9. RULE-BASED AI ENGINE ("MONEY INSIGHTS") & REMINDER GENERATOR
    // ----------------------------------------------------------------------
    function renderAIInsights() {
        const grid = document.getElementById('ai-insights-grid');
        if (!grid) return;

        let totalLent = 0;
        let totalRepaid = 0;
        let totalOwed = 0;
        let maxLoan = null;
        let maxAmount = 0;
        let overdueCount = 0;
        const pendingFriends = new Set();

        loans.forEach(l => {
            const rem = l.amount - l.paidAmount;
            totalLent += l.amount;
            totalRepaid += l.paidAmount;
            totalOwed += Math.max(0, rem);

            if (rem > maxAmount) {
                maxAmount = rem;
                maxLoan = l;
            }

            if (rem > 0) pendingFriends.add(l.name.trim().toLowerCase());
            if (getLoanStatus(l) === 'Overdue') overdueCount++;
        });

        const collectionRatio = totalLent > 0 ? Math.round((totalRepaid / totalLent) * 100) : 100;

        grid.innerHTML = `
            <div class="ai-insight-box">
                <i class="fa-solid fa-coins"></i>
                <span class="ai-insight-title">Outstanding Amount</span>
                <span class="ai-insight-val text-primary">${formatRupee(totalOwed)}</span>
                <span class="ai-insight-desc">You currently have this amount pending collection.</span>
            </div>

            <div class="ai-insight-box">
                <i class="fa-solid fa-user-clock"></i>
                <span class="ai-insight-title">Pending Friends</span>
                <span class="ai-insight-val text-warning">${pendingFriends.size} Friends</span>
                <span class="ai-insight-desc">${pendingFriends.size > 0 ? `${pendingFriends.size} friends have active unpaid balances.` : 'All loans settled!'}</span>
            </div>

            <div class="ai-insight-box">
                <i class="fa-solid fa-crown"></i>
                <span class="ai-insight-title">Largest Loan</span>
                <span class="ai-insight-val text-danger">${maxLoan ? formatRupee(maxAmount) : '₹0'}</span>
                <span class="ai-insight-desc">${maxLoan ? `Owed by ${escapeHTML(maxLoan.name)} (${escapeHTML(maxLoan.reason)})` : 'No active loans'}</span>
            </div>

            <div class="ai-insight-box">
                <i class="fa-solid fa-chart-line"></i>
                <span class="ai-insight-title">Collection Rate</span>
                <span class="ai-insight-val text-success">${collectionRatio}% Collected</span>
                <span class="ai-insight-desc">You have collected ${collectionRatio}% of total lent money (${formatRupee(totalRepaid)} of ${formatRupee(totalLent)}).</span>
            </div>
        `;
    }

    function populateAIFriendDropdown() {
        const select = document.getElementById('ai-friend-select');
        if (!select) return;

        const activeLoans = loans.filter(l => (l.amount - l.paidAmount) > 0);
        
        select.innerHTML = '<option value="">-- Choose a friend who owes money --</option>' +
            activeLoans.map(l => {
                const rem = l.amount - l.paidAmount;
                return `<option value="${l.id}">${escapeHTML(l.name)} (${formatRupee(rem)} - ${escapeHTML(l.reason)})</option>`;
            }).join('');
    }

    function generateAIReminderMessage() {
        const loanId = document.getElementById('ai-friend-select').value;
        const tone = document.getElementById('ai-tone-select').value;

        if (!loanId) {
            showToast('Please select a friend first!', 'danger');
            return;
        }

        const loan = loans.find(l => l.id === loanId);
        if (!loan) return;

        const remaining = loan.amount - loan.paidAmount;
        const days = getDaysDiff(loan.dueDate);
        const name = loan.name;
        const reason = loan.reason;
        const amountStr = formatRupee(remaining);

        let msg = '';

        /*
           ==================================================================
           AI ENGINE INTEGRATION POINT:
           Here, the rule-based prompt can easily be replaced by an API fetch
           to OpenAI / Gemini:
           
           const res = await fetch('/api/generate-reminder', {
               method: 'POST',
               body: JSON.stringify({ name, amountStr, reason, dueDate: loan.dueDate, tone })
           });
           ==================================================================
        */

        switch (tone) {
            case 'polite':
                msg = `Hey ${name}! 😊 Just a friendly reminder about the ${amountStr} for ${reason}. Whenever you're able to repay it, please let me know. Thanks!`;
                break;

            case 'casual':
                msg = `Bro ${name}! 🖐️ Remember the ${amountStr} for ${reason}? Whenever free, send it over via GPay/PhonePe! Catch you later. 👍`;
                break;

            case 'formal':
                msg = `Dear ${name},\nThis is a polite reminder regarding the outstanding balance of ${amountStr} for "${reason}". The expected repayment date was ${formatDate(loan.dueDate)}. Kindly arrange transfer at your convenience. Thank you.`;
                break;

            case 'urgent':
                msg = `Hi ${name}, hope all is well. I urgently need to collect the ${amountStr} lent for ${reason} (due ${formatDate(loan.dueDate)}). Please UPI it over as soon as possible. Thanks!`;
                break;

            case 'funny':
                msg = `Hey ${name}! 🚨 My wallet is currently missing the ${amountStr} I lent you for "${reason}"! Help a student out by sending GPay today! 😂💸`;
                break;
        }

        const outputBox = document.getElementById('ai-output-box');
        const textElement = document.getElementById('ai-generated-text');
        const toneBadge = document.getElementById('current-tone-badge');

        textElement.textContent = msg;
        toneBadge.textContent = tone.toUpperCase();
        outputBox.style.display = 'flex';

        // WhatsApp Action
        const waBtn = document.getElementById('whatsapp-ai-msg-btn');
        waBtn.onclick = () => {
            const phone = (loan.phone || '').replace(/\D/g, '');
            const encodedText = encodeURIComponent(msg);
            const waUrl = phone ? `https://wa.me/91${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
            window.open(waUrl, '_blank');
        };

        // Copy Action
        const copyBtn = document.getElementById('copy-ai-msg-btn');
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(msg).then(() => {
                showToast('Reminder message copied to clipboard!', 'success');
            });
        };
    }

    // ----------------------------------------------------------------------
    // 10. INTERACTIVE MONEYBOT CHAT
    // ----------------------------------------------------------------------
    function handleUserChatMessage(userText) {
        if (!userText.trim()) return;

        const chatMessages = document.getElementById('chat-messages');
        
        // Append User Message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message user-message';
        userMsgDiv.innerHTML = `<div class="message-content"><p>${escapeHTML(userText)}</p></div>`;
        chatMessages.appendChild(userMsgDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Process Rule-Based AI Response
        setTimeout(() => {
            const botReply = generateBotResponse(userText.toLowerCase());
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message bot-message';
            botMsgDiv.innerHTML = `<div class="message-content">${botReply}</div>`;
            chatMessages.appendChild(botMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 400);
    }

    function generateBotResponse(query) {
        let totalOwed = 0;
        let totalReceived = 0;
        let totalLent = 0;
        let lentThisMonth = 0;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const activeDebtors = [];
        const overdueLoans = [];

        loans.forEach(l => {
            const rem = l.amount - l.paidAmount;
            totalLent += l.amount;
            totalReceived += l.paidAmount;

            const lentDate = new Date(l.dateLent);
            if (lentDate.getMonth() === currentMonth && lentDate.getFullYear() === currentYear) {
                lentThisMonth += l.amount;
            }

            if (rem > 0) {
                totalOwed += rem;
                activeDebtors.push({ name: l.name, rem: rem, reason: l.reason });
            }
            if (getLoanStatus(l) === 'Overdue') {
                overdueLoans.push(l);
            }
        });

        if (query.includes('who owes me most') || query.includes('highest') || query.includes('largest')) {
            if (activeDebtors.length === 0) return `<p>Nobody currently owes you any money!</p>`;
            activeDebtors.sort((a, b) => b.rem - a.rem);
            const top = activeDebtors[0];
            return `<p>🏆 <strong>${escapeHTML(top.name)}</strong> owes you the most: <strong>${formatRupee(top.rem)}</strong> for "${escapeHTML(top.reason)}".</p>`;
        }

        if (query.includes('overdue')) {
            if (overdueLoans.length === 0) return `<p>✅ You have 0 overdue loans right now!</p>`;
            const listHTML = overdueLoans.map(l => `<li><strong>${escapeHTML(l.name)}</strong>: ${formatRupee(l.amount - l.paidAmount)} (Due: ${formatDate(l.dueDate)})</li>`).join('');
            return `<p>⚠️ You have <strong>${overdueLoans.length} overdue loan(s)</strong>:</p><ul>${listHTML}</ul>`;
        }

        if (query.includes('how much money should i collect') || query.includes('collect') || query.includes('total to collect')) {
            return `<p>📌 You currently have <strong>${formatRupee(totalOwed)}</strong> to collect across ${activeDebtors.length} friends.</p>`;
        }

        if (query.includes('this month') || query.includes('month')) {
            return `<p>📅 You have lent <strong>${formatRupee(lentThisMonth)}</strong> during this current month.</p>`;
        }

        // Default response
        return `<p>💡 I analyzed your loan dataset! Total outstanding is <strong>${formatRupee(totalOwed)}</strong> across ${activeDebtors.length} friends. You have collected ${totalLent > 0 ? Math.round((totalReceived/totalLent)*100) : 0}% of all money lent.</p>`;
    }

    // ----------------------------------------------------------------------
    // 11. FRIEND PROFILE HISTORY MODAL
    // ----------------------------------------------------------------------
    function openFriendProfileModal(friendName) {
        currentFriendNameProfile = friendName;

        const profileModal = document.getElementById('friend-profile-modal');
        const summaryContainer = document.getElementById('friend-profile-summary');
        const loansContainer = document.getElementById('friend-loans-list');
        const timelineContainer = document.getElementById('friend-timeline');

        const friendLoans = loans.filter(l => l.name.trim().toLowerCase() === friendName.trim().toLowerCase());
        
        let totalLent = 0;
        let totalRepaid = 0;
        let allPayments = [];

        friendLoans.forEach(l => {
            totalLent += l.amount;
            totalRepaid += l.paidAmount;
            if (l.payments && l.payments.length > 0) {
                l.payments.forEach(p => {
                    allPayments.push({ ...p, reason: l.reason });
                });
            }
        });

        const remaining = totalLent - totalRepaid;

        summaryContainer.innerHTML = `
            <div>
                <span class="text-xs text-muted">FRIEND NAME</span>
                <h5>${escapeHTML(friendName)}</h5>
            </div>
            <div>
                <span class="text-xs text-muted">TOTAL BORROWED</span>
                <h5>${formatRupee(totalLent)}</h5>
            </div>
            <div>
                <span class="text-xs text-muted">CURRENT BALANCE</span>
                <h5 class="${remaining > 0 ? 'text-danger' : 'text-success'}">${formatRupee(remaining)}</h5>
            </div>`;

        // Render Loan Records
        loansContainer.innerHTML = friendLoans.map(l => `
            <div class="friend-loan-item">
                <div>
                    <strong>${escapeHTML(l.reason)}</strong>
                    <span class="text-xs text-muted" style="display:block;">Lent: ${formatDate(l.dateLent)} • Due: ${formatDate(l.dueDate)}</span>
                </div>
                <div>
                    <span>${formatRupee(l.amount - l.paidAmount)} / ${formatRupee(l.amount)}</span>
                </div>
            </div>`).join('');

        // Render Payment Timeline
        allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (allPayments.length === 0) {
            timelineContainer.innerHTML = `<p class="text-muted text-sm">No repayment logs found for ${escapeHTML(friendName)}.</p>`;
        } else {
            timelineContainer.innerHTML = allPayments.map(p => `
                <div class="timeline-item">
                    <div>
                        <strong>${formatRupee(p.amount)}</strong>
                        <span class="text-xs text-muted" style="display:block;">${escapeHTML(p.note || 'Repayment')} (${escapeHTML(p.reason)})</span>
                    </div>
                    <span class="text-sm text-secondary">${formatDate(p.date)}</span>
                </div>`).join('');
        }

        openModal(profileModal);
    }

    // ----------------------------------------------------------------------
    // 12. EVENT LISTENERS & MODALS
    // ----------------------------------------------------------------------
    function initModalsAndEvents() {

        // TAB NAVIGATION
        document.querySelectorAll('.nav-btn, [data-tab-switch]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab') || btn.getAttribute('data-tab-switch');
                if (!targetTab) return;

                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                const nav = document.querySelector(`.nav-btn[data-tab="${targetTab}"]`);
                if (nav) nav.classList.add('active');

                const content = document.getElementById(targetTab);
                if (content) content.classList.add('active');

                document.getElementById('sidebar').classList.remove('mobile-open');

                const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
                const titles = {
                    'dashboard-tab': dict.title_dashboard || 'Dashboard Overview',
                    'loans-tab': dict.nav_loans || 'Loans & Friends',
                    'reminders-tab': dict.nav_reminders || 'Reminders',
                    'ai-tab': dict.nav_ai || 'AI Assistant'
                };
                document.getElementById('page-title').textContent = titles[targetTab] || 'Friend Money Tracker';
            });
        });

        // LANGUAGE SELECTOR
        document.getElementById('lang-toggle-select').addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            renderApp();
            showToast(e.target.value === 'ml' ? 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി' : 'Language switched to English', 'info');
        });

        // MOBILE SIDEBAR TOGGLE
        document.getElementById('mobile-toggle-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // THEME TOGGLE
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            renderStatusChart();
            renderDebtorsChart();
        });

        // Initial Theme
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // ADD / EDIT LOAN MODAL
        const loanModal = document.getElementById('loan-modal');
        const loanForm = document.getElementById('loan-form');

        document.getElementById('open-add-modal-btn').addEventListener('click', () => openAddModal());
        document.getElementById('empty-add-loan-btn').addEventListener('click', () => openAddModal());
        document.getElementById('close-loan-modal-btn').onclick = () => closeModal(loanModal);
        document.getElementById('cancel-loan-modal-btn').onclick = () => closeModal(loanModal);

        function openAddModal() {
            loanForm.reset();
            document.getElementById('loan-id-input').value = '';
            document.getElementById('modal-loan-title').innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Loan`;
            document.getElementById('date-lent-input').value = getRelativeDate(0);
            document.getElementById('due-date-input').value = getRelativeDate(7);
            openModal(loanModal);
        }

        loanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loan-id-input').value;
            const name = document.getElementById('friend-name-input').value.trim();
            const phone = document.getElementById('phone-input').value.trim();
            const amount = parseFloat(document.getElementById('amount-input').value);
            const dateLent = document.getElementById('date-lent-input').value;
            const dueDate = document.getElementById('due-date-input').value;
            const reason = document.getElementById('reason-input').value.trim();
            const notes = document.getElementById('notes-input').value.trim();

            if (id) {
                const idx = loans.findIndex(l => l.id === id);
                if (idx !== -1) {
                    loans[idx].name = name;
                    loans[idx].phone = phone;
                    loans[idx].amount = amount;
                    loans[idx].dateLent = dateLent;
                    loans[idx].dueDate = dueDate;
                    loans[idx].reason = reason;
                    loans[idx].notes = notes;
                    showToast('Loan updated successfully!', 'success');
                }
            } else {
                loans.unshift({
                    id: 'loan_' + Date.now(),
                    name,
                    phone,
                    amount,
                    paidAmount: 0,
                    dateLent,
                    dueDate,
                    reason,
                    notes,
                    payments: [],
                    createdAt: new Date().toISOString()
                });
                showToast('New loan added successfully!', 'success');
            }

            saveData();
            closeModal(loanModal);
        });

        // DELEGATED EVENT LISTENERS
        document.body.addEventListener('click', (e) => {
            
            // Friend Profile Click
            const profileBtn = e.target.closest('.view-friend-profile-btn');
            if (profileBtn) {
                const name = profileBtn.getAttribute('data-name');
                if (name) openFriendProfileModal(name);
            }

            // Payment Modal Trigger
            const payBtn = e.target.closest('.open-payment-modal-btn');
            if (payBtn) {
                openPaymentModal(payBtn.getAttribute('data-id'));
            }

            // Edit Trigger
            const editBtn = e.target.closest('.open-edit-modal-btn');
            if (editBtn) {
                openEditModal(editBtn.getAttribute('data-id'));
            }

            // Delete Trigger
            const deleteBtn = e.target.closest('.open-delete-modal-btn');
            if (deleteBtn) {
                openDeleteModal(deleteBtn.getAttribute('data-id'));
            }

            // Copy Text Trigger
            const copyBtn = e.target.closest('.copy-text-btn');
            if (copyBtn) {
                const msg = copyBtn.getAttribute('data-msg');
                navigator.clipboard.writeText(msg).then(() => showToast('Message copied!', 'success'));
            }

            // WhatsApp Trigger
            const waBtn = e.target.closest('.trigger-whatsapp-btn');
            if (waBtn) {
                const phone = (waBtn.getAttribute('data-phone') || '').replace(/\D/g, '');
                const msg = waBtn.getAttribute('data-msg');
                const encodedText = encodeURIComponent(msg);
                const waUrl = phone ? `https://wa.me/91${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
                window.open(waUrl, '_blank');
            }
        });

        function openEditModal(id) {
            const loan = loans.find(l => l.id === id);
            if (!loan) return;

            document.getElementById('loan-id-input').value = loan.id;
            document.getElementById('friend-name-input').value = loan.name;
            document.getElementById('phone-input').value = loan.phone || '';
            document.getElementById('amount-input').value = loan.amount;
            document.getElementById('date-lent-input').value = loan.dateLent;
            document.getElementById('due-date-input').value = loan.dueDate;
            document.getElementById('reason-input').value = loan.reason;
            document.getElementById('notes-input').value = loan.notes || '';
            document.getElementById('modal-loan-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Loan Record`;

            openModal(loanModal);
        }

        // PAYMENT FORM
        const paymentModal = document.getElementById('payment-modal');
        const paymentForm = document.getElementById('payment-form');

        function openPaymentModal(id) {
            const loan = loans.find(l => l.id === id);
            if (!loan) return;

            const remaining = loan.amount - loan.paidAmount;

            document.getElementById('payment-loan-id').value = loan.id;
            document.getElementById('payment-friend-name').textContent = loan.name;
            document.getElementById('payment-remaining-bal').textContent = formatRupee(remaining);
            document.getElementById('payment-amount-input').value = remaining;
            document.getElementById('payment-amount-input').max = remaining;
            document.getElementById('payment-date-input').value = getRelativeDate(0);
            document.getElementById('payment-note-input').value = '';

            openModal(paymentModal);
        }

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('payment-loan-id').value;
            const payAmount = parseFloat(document.getElementById('payment-amount-input').value);
            const payDate = document.getElementById('payment-date-input').value;
            const payNote = document.getElementById('payment-note-input').value.trim();

            const loan = loans.find(l => l.id === id);
            if (!loan) return;

            const remaining = loan.amount - loan.paidAmount;
            if (payAmount <= 0 || payAmount > remaining) {
                showToast(`Payment must be between ₹1 and ${formatRupee(remaining)}!`, 'danger');
                return;
            }

            loan.paidAmount += payAmount;
            loan.payments.push({
                id: 'p_' + Date.now(),
                amount: payAmount,
                date: payDate,
                note: payNote || 'Payment received'
            });

            saveData();
            closeModal(paymentModal);
            showToast(`Recorded payment of ${formatRupee(payAmount)} from ${loan.name}!`, 'success');
        });

        document.getElementById('close-payment-modal-btn').onclick = () => closeModal(paymentModal);
        document.getElementById('cancel-payment-modal-btn').onclick = () => closeModal(paymentModal);

        // FRIEND PROFILE MODAL CLOSE
        const profileModal = document.getElementById('friend-profile-modal');
        document.getElementById('close-profile-modal-btn').onclick = () => closeModal(profileModal);
        document.getElementById('close-profile-btn').onclick = () => closeModal(profileModal);

        // DELETE MODAL
        const deleteModal = document.getElementById('delete-modal');
        function openDeleteModal(id) {
            const loan = loans.find(l => l.id === id);
            if (!loan) return;

            currentDeleteId = id;
            document.getElementById('delete-friend-name').textContent = loan.name;
            openModal(deleteModal);
        }

        document.getElementById('confirm-delete-btn').onclick = () => {
            if (currentDeleteId) {
                loans = loans.filter(l => l.id !== currentDeleteId);
                saveData();
                showToast('Loan record deleted!', 'info');
                currentDeleteId = null;
                closeModal(deleteModal);
            }
        };

        document.getElementById('close-delete-modal-btn').onclick = () => closeModal(deleteModal);
        document.getElementById('cancel-delete-btn').onclick = () => closeModal(deleteModal);

        // ABOUT PROJECT MODAL (AI WORKSHOP)
        const aboutModal = document.getElementById('about-modal');
        document.getElementById('about-project-btn').onclick = () => openModal(aboutModal);
        document.getElementById('close-about-modal-btn').onclick = () => closeModal(aboutModal);
        document.getElementById('close-about-btn').onclick = () => closeModal(aboutModal);

        // SEARCH & FILTER LISTENERS
        document.getElementById('search-input').addEventListener('input', (e) => {
            document.getElementById('clear-search-btn').style.display = e.target.value ? 'block' : 'none';
            renderLoansGrid();
        });

        document.getElementById('clear-search-btn').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('clear-search-btn').style.display = 'none';
            renderLoansGrid();
        });

        document.getElementById('status-filter').addEventListener('change', () => renderLoansGrid());
        document.getElementById('sort-by').addEventListener('change', () => renderLoansGrid());

        // AI GENERATOR & CHAT
        document.getElementById('generate-ai-msg-btn').onclick = () => generateAIReminderMessage();

        document.getElementById('send-chat-btn').onclick = () => {
            const input = document.getElementById('chat-input');
            handleUserChatMessage(input.value);
            input.value = '';
        };

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('chat-input');
                handleUserChatMessage(input.value);
                input.value = '';
            }
        });

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.onclick = () => handleUserChatMessage(chip.getAttribute('data-prompt'));
        });

        document.getElementById('clear-chat-btn').onclick = () => {
            document.getElementById('chat-messages').innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>👋 Chat history cleared! Ask me anything about your loans or financial stats.</p>
                    </div>
                </div>`;
        };

        // BACKUP & DATA RESET
        const backupModal = document.getElementById('backup-modal');
        document.getElementById('export-import-btn').onclick = () => openModal(backupModal);
        document.getElementById('close-backup-modal-btn').onclick = () => closeModal(backupModal);
        document.getElementById('close-backup-btn').onclick = () => closeModal(backupModal);

        document.getElementById('export-json-btn').onclick = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(loans, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `friend_money_backup_${getRelativeDate(0)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('JSON backup exported!', 'success');
        };

        document.getElementById('import-json-file').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        loans = imported;
                        saveData();
                        closeModal(backupModal);
                        showToast('Data imported successfully!', 'success');
                    } else {
                        showToast('Invalid backup file format.', 'danger');
                    }
                } catch (err) {
                    showToast('Error reading JSON file.', 'danger');
                }
            };
            reader.readAsText(file);
        };

        document.getElementById('reset-sample-data-btn').onclick = () => {
            if (confirm('Reload 7 sample workshop loans into the app?')) {
                loans = [...SAMPLE_LOANS];
                saveData();
                closeModal(backupModal);
                showToast('Sample workshop data reloaded!', 'info');
            }
        };

        document.getElementById('clear-all-data-btn').onclick = () => {
            if (confirm('Are you sure you want to clear ALL loan records?')) {
                loans = [];
                saveData();
                closeModal(backupModal);
                showToast('All loan data cleared.', 'danger');
            }
        };
    }

    function openModal(modalEl) {
        if (modalEl) modalEl.classList.add('active');
    }

    function closeModal(modalEl) {
        if (modalEl) modalEl.classList.remove('active');
    }

    // ----------------------------------------------------------------------
    // 13. INITIALIZATION
    // ----------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        loadData();
        initModalsAndEvents();
        renderApp();
    });

})();
