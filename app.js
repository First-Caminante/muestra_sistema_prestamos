const MOCK_DATA = {
    loans: [
        // Historic data for charts (Past Year)
        { id: 'LN-H01', client: 'Roberto Gómez', dni: '111', phone: '700', item: 'Taladro', capital: 500, interest: 50, period: 15, startDate: new Date(Date.now() - 300 * 86400000).toISOString(), dueDate: new Date(Date.now() - 285 * 86400000).toISOString(), status: 'adjudicated' },
        { id: 'LN-H02', client: 'Lucía Paz', dni: '222', phone: '700', item: 'TV LG 42', capital: 1000, interest: 100, period: 30, startDate: new Date(Date.now() - 200 * 86400000).toISOString(), dueDate: new Date(Date.now() - 170 * 86400000).toISOString(), status: 'adjudicated' },
        { id: 'LN-H03', client: 'Marta Solis', dni: '333', phone: '700', item: 'Licuadora', capital: 150, interest: 15, period: 15, startDate: new Date(Date.now() - 100 * 86400000).toISOString(), dueDate: new Date(Date.now() - 85 * 86400000).toISOString(), status: 'adjudicated' },
        
        // Past Month
        { id: 'LN-M01', client: 'José Luis', dni: '444', phone: '700', item: 'Amoladora Makita', capital: 350, interest: 35, period: 15, startDate: new Date(Date.now() - 25 * 86400000).toISOString(), dueDate: new Date(Date.now() - 10 * 86400000).toISOString(), status: 'overdue' },
        { id: 'LN-M02', client: 'Ana Rico', dni: '555', phone: '700', item: 'Bicicleta Montaña', capital: 800, interest: 80, period: 30, startDate: new Date(Date.now() - 20 * 86400000).toISOString(), dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), status: 'active' },

        // Past Week / Current
        { id: 'LN-C01', client: 'Juan Pérez', dni: '1234567', phone: '71122334', item: 'Taladro Percutor Dewalt. En caja.', capital: 300, interest: 30, period: 15, startDate: new Date(Date.now() - 5 * 86400000).toISOString(), dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), status: 'active' },
        { id: 'LN-C02', client: 'María Gómez', dni: '7654321', phone: '79988776', item: 'Sierra Circular Makita. Usada.', capital: 600, interest: 60, period: 15, startDate: new Date(Date.now() - 13 * 86400000).toISOString(), dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'warning' },
        { id: 'LN-C03', client: 'Carlos Ruiz', dni: '9876543', phone: '75544332', item: 'Soldadora Inverter 200A. Con cables.', capital: 800, interest: 80, period: 15, startDate: new Date(Date.now() - 20 * 86400000).toISOString(), dueDate: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'overdue' },
        { id: 'LN-C04', client: 'Pedro Sanchez', dni: '8888', phone: '711', item: 'Compresor 50L', capital: 500, interest: 50, period: 15, startDate: new Date(Date.now() - 1 * 86400000).toISOString(), dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'active' }
    ],
    catalog: [
        { id: 'CAT-001', title: 'Compresor de Aire 50L', condition: 'Seminuevo', price: 950, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: 'CAT-002', title: 'Amoladora Angular Bosch', condition: 'Excelente estado', price: 380, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: 'CAT-003', title: 'Taladro Inalámbrico Dewalt', condition: 'Usado', price: 650, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: 'CAT-004', title: 'Sierra Caladora', condition: 'Como nueva', price: 250, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ],
    stats: {
        historicInterest: 2150,
        soldCatalog: 1200
    }
};

const app = {
    data: {
        loans: [],
        catalog: [],
        stats: {}
    },
    charts: {
        bar: null,
        doughnut: null
    },

    init() {
        this.loadData();
        this.setupEventListeners();
        
        // Defaults dates for custom filter
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-to').value = today;
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        document.getElementById('date-from').value = lastMonth.toISOString().split('T')[0];

        // Render public views first
        this.renderCatalog('public-catalog-grid');

        // Check Auth state
        if(sessionStorage.getItem('isLoggedIn') === 'true') {
            this.showPrivateApp();
        } else {
            this.showPublicApp();
        }
    },

    // --- Mobile Sidebar Toggle ---
    toggleMobileSidebar() {
        const body = document.body;
        const overlay = document.getElementById('mobile-sidebar-overlay');
        
        if (body.classList.contains('sidebar-open')) {
            body.classList.remove('sidebar-open');
            overlay.classList.remove('opacity-100');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        } else {
            overlay.classList.remove('hidden');
            // Small reflow delay
            setTimeout(() => {
                body.classList.add('sidebar-open');
                overlay.classList.add('opacity-100');
            }, 10);
        }
    },

    // --- Authentication ---
    openLoginModal() {
        document.getElementById('modal-login').showModal();
        document.getElementById('login-error').classList.add('hidden');
    },
    
    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        if (user === 'admin' && pass === 'admin123') {
            sessionStorage.setItem('isLoggedIn', 'true');
            document.getElementById('modal-login').close();
            this.showPrivateApp();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    },

    logout() {
        sessionStorage.removeItem('isLoggedIn');
        this.showPublicApp();
    },

    showPublicApp() {
        document.getElementById('public-view').classList.remove('hidden', 'opacity-0');
        document.getElementById('app-sidebar').classList.add('hidden');
        document.getElementById('app-sidebar').classList.remove('md:flex');
        document.getElementById('app-main').classList.add('hidden');
        document.getElementById('app-main').classList.remove('flex');
        this.switchPublicTab('home');
    },

    showPrivateApp() {
        document.getElementById('public-view').classList.add('hidden');
        document.getElementById('app-sidebar').classList.remove('hidden');
        document.getElementById('app-sidebar').classList.add('md:flex');
        document.getElementById('app-main').classList.remove('hidden');
        document.getElementById('app-main').classList.add('flex');
        
        this.renderDashboard();
        this.renderCatalog('catalog-admin-grid');
        this.renderBalance();
        this.initCharts();
    },

    switchPublicTab(tab) {
        if(tab === 'home') {
            document.getElementById('public-home').classList.remove('hidden');
            document.getElementById('public-home').classList.add('flex');
            document.getElementById('public-catalog-page').classList.add('hidden');
            document.getElementById('public-catalog-page').classList.remove('flex');
        } else {
            document.getElementById('public-home').classList.add('hidden');
            document.getElementById('public-home').classList.remove('flex');
            document.getElementById('public-catalog-page').classList.remove('hidden');
            document.getElementById('public-catalog-page').classList.add('flex');
        }
        window.scrollTo(0, 0);
    },

    // --- Data Management ---
    loadData() {
        const stored = localStorage.getItem('pawnShopData_agapea');
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = JSON.parse(JSON.stringify(MOCK_DATA));
            this.saveData();
        }
        
        const now = new Date();
        let changed = false;
        this.data.loans.forEach(loan => {
            if (loan.status === 'adjudicated') return;
            
            const due = new Date(loan.dueDate);
            const diffHours = (due - now) / (1000 * 60 * 60);
            
            let newStatus = 'active';
            if (diffHours < 0) newStatus = 'overdue';
            else if (diffHours <= 48) newStatus = 'warning';
            
            if (loan.status !== newStatus) {
                loan.status = newStatus;
                changed = true;
            }
        });
        if(changed) this.saveData();
    },

    saveData() {
        localStorage.setItem('pawnShopData_agapea', JSON.stringify(this.data));
    },

    // --- Time Filtering ---
    getFilteredLoans() {
        const filter = document.getElementById('time-filter').value;
        const now = new Date();
        
        let start = new Date(0); // all time
        let end = new Date();

        if (filter === 'week') {
            start = new Date(now.setDate(now.getDate() - 7));
        } else if (filter === 'month') {
            start = new Date(now.setMonth(now.getMonth() - 1));
        } else if (filter === 'year') {
            start = new Date(now.setFullYear(now.getFullYear() - 1));
        } else if (filter === 'custom') {
            start = new Date(document.getElementById('date-from').value);
            end = new Date(document.getElementById('date-to').value);
            end.setHours(23, 59, 59); // Include whole end day
        }

        return this.data.loans.filter(loan => {
            const loanDate = new Date(loan.startDate);
            return loanDate >= start && loanDate <= end;
        });
    },

    handleTimeFilterChange() {
        const filter = document.getElementById('time-filter').value;
        const customContainer = document.getElementById('custom-date-container');
        
        if (filter === 'custom') {
            customContainer.classList.remove('hidden');
            customContainer.classList.add('flex');
        } else {
            customContainer.classList.add('hidden');
            customContainer.classList.remove('flex');
            this.applyCustomDates();
        }
    },

    applyCustomDates() {
        this.renderDashboard();
        this.updateCharts();
    },

    // --- UI Logic ---
    switchTab(tabId) {
        // close mobile menu if open
        if(document.body.classList.contains('sidebar-open')) {
            this.toggleMobileSidebar();
        }

        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(el => {
            el.classList.remove('bg-pastel-blue/20', 'text-pastel-blue', 'font-semibold');
            el.classList.add('text-dark-textMuted', 'hover:bg-dark-surface2', 'hover:text-white', 'font-medium');
        });

        document.getElementById(`view-${tabId}`).classList.add('active');
        
        const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
        if (activeBtn) {
            activeBtn.classList.add('bg-pastel-blue/20', 'text-pastel-blue', 'font-semibold');
            activeBtn.classList.remove('text-dark-textMuted', 'hover:bg-dark-surface2', 'hover:text-white', 'font-medium');
        }

        const titles = {
            'dashboard': 'Dashboard y Préstamos',
            'catalog-admin': 'Catálogo (Admin)',
            'balance': 'Arqueo de Caja'
        };
        document.getElementById('page-title').innerText = titles[tabId];

        if(tabId === 'dashboard') {
            this.updateCharts();
        }
    },

    formatMoney(amount) {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount).replace('BOB', 'Bs');
    },
    formatDate(dateString) {
        const d = new Date(dateString);
        return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    
    // --- Dashboard ---
    renderDashboard() {
        const filteredLoans = this.getFilteredLoans();
        const totalCapital = filteredLoans.reduce((sum, l) => sum + l.capital, 0);
        const totalInterest = filteredLoans.reduce((sum, l) => sum + l.interest, 0);
        const totalActive = filteredLoans.filter(l => l.status !== 'adjudicated').length;
        const totalLiquidation = this.data.catalog.reduce((sum, item) => sum + item.price, 0);

        document.getElementById('kpi-capital').innerText = this.formatMoney(totalCapital);
        document.getElementById('kpi-interest').innerText = this.formatMoney(totalInterest);
        document.getElementById('kpi-active-loans').innerText = totalActive;
        document.getElementById('kpi-liquidation').innerText = this.formatMoney(totalLiquidation);

        const tbody = document.getElementById('loans-table-body');
        tbody.innerHTML = '';

        const currentActiveLoans = this.data.loans.filter(l => l.status !== 'adjudicated');

        currentActiveLoans.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).forEach(loan => {
            const tr = document.createElement('tr');
            
            let statusBadge = '';
            if (loan.status === 'active') statusBadge = '<span class="px-2.5 py-1 bg-pastel-greenBg text-pastel-green rounded-lg text-xs font-bold">Al Día</span>';
            if (loan.status === 'warning') statusBadge = '<span class="px-2.5 py-1 bg-pastel-amberBg text-pastel-amber rounded-lg text-xs font-bold">Vence 48h</span>';
            if (loan.status === 'overdue') statusBadge = '<span class="px-2.5 py-1 bg-pastel-redBg text-pastel-red rounded-lg text-xs font-bold">Vencido</span>';

            let actionButtons = `
                <button onclick="app.sendWhatsApp('${loan.id}')" title="Cobrar WhatsApp" class="p-1.5 text-pastel-green hover:bg-pastel-greenBg rounded-lg transition-colors"><i data-lucide="message-circle" class="w-4 h-4"></i></button>
                <button onclick="app.printTicket('${loan.id}')" title="Imprimir Boleta" class="p-1.5 text-pastel-blue hover:bg-pastel-blue/10 rounded-lg transition-colors"><i data-lucide="printer" class="w-4 h-4"></i></button>
            `;
            
            if (loan.status === 'overdue') {
                actionButtons += `<button onclick="app.adjudicate('${loan.id}')" title="Adjudicar a Catálogo" class="p-1.5 text-pastel-purple hover:bg-pastel-purpleBg rounded-lg transition-colors"><i data-lucide="gavel" class="w-4 h-4"></i></button>`;
            }

            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-xs text-dark-textMuted">${loan.id}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-white">${loan.client}</div>
                    <div class="text-xs text-dark-textMuted font-medium">${loan.phone}</div>
                </td>
                <td class="px-6 py-4 max-w-[200px] sm:max-w-xs truncate text-dark-text" title="${loan.item}">${loan.item}</td>
                <td class="px-6 py-4 font-semibold text-white">${loan.capital} Bs</td>
                <td class="px-6 py-4 font-medium text-dark-textMuted">${loan.interest} Bs</td>
                <td class="px-6 py-4 font-medium text-dark-text">${this.formatDate(loan.dueDate)}</td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right space-x-1">${actionButtons}</td>
            `;
            tbody.appendChild(tr);
        });

        lucide.createIcons();
    },

    // --- Catalog ---
    renderCatalog(targetElementId) {
        const grid = document.getElementById(targetElementId);
        if(!grid) return;
        grid.innerHTML = '';

        this.data.catalog.forEach(item => {
            const btnHtml = targetElementId === 'public-catalog-grid' 
                ? `<button onclick="app.buyCatalogItem('${item.id}')" class="bg-pastel-blue text-dark-base px-4 py-2 rounded-xl text-sm font-semibold hover:bg-pastel-blueHover flex items-center justify-center gap-2 shadow-lg shadow-pastel-blue/20 transition-transform hover:scale-105 w-full sm:w-auto mt-4 sm:mt-0"><i data-lucide="message-circle" class="w-4 h-4"></i> Me Interesa</button>`
                : `<button onclick="app.removeCatalogItem('${item.id}')" class="bg-pastel-redBg text-pastel-red px-3 py-2 rounded-lg text-sm font-semibold hover:bg-pastel-red/20 flex items-center justify-center gap-1 transition-colors w-full sm:w-auto mt-4 sm:mt-0"><i data-lucide="trash" class="w-4 h-4"></i> Eliminar</button>`;

            grid.innerHTML += `
                <div class="bg-dark-surface rounded-2xl border border-dark-border shadow-sm overflow-hidden flex flex-col group hover:border-pastel-blue/30 transition-colors">
                    <div class="h-48 overflow-hidden relative bg-dark-base">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                        <span class="absolute top-3 left-3 bg-dark-base/80 backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-full text-white border border-dark-border shadow-sm">${item.condition}</span>
                    </div>
                    <div class="p-5 flex-1 flex flex-col bg-dark-surface z-10 relative">
                        <h3 class="font-bold text-white text-lg mb-1 leading-tight group-hover:text-pastel-blue transition-colors">${item.title}</h3>
                        <p class="text-xs text-dark-textMuted font-mono mb-4 flex-1">Ref: ${item.id}</p>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-4 border-t border-dark-border">
                            <span class="text-2xl font-black text-white">${item.price} Bs</span>
                            ${btnHtml}
                        </div>
                    </div>
                </div>
            `;
        });
        lucide.createIcons();
    },

    removeCatalogItem(id) {
        if(confirm('¿Eliminar este artículo del catálogo?')) {
            this.data.catalog = this.data.catalog.filter(c => c.id !== id);
            this.saveData();
            this.renderCatalog('catalog-admin-grid');
            this.renderCatalog('public-catalog-grid');
        }
    },

    buyCatalogItem(id) {
        const item = this.data.catalog.find(c => c.id === id);
        if(!item) return;
        const msg = `Hola Agapea, vi en su catálogo web el artículo ${item.title} por ${item.price} Bs. ¿Sigue disponible para entrega hoy?`;
        window.open(`https://wa.me/59170000000?text=${encodeURIComponent(msg)}`, '_blank'); 
    },

    // --- Actions ---
    sendWhatsApp(id) {
        const loan = this.data.loans.find(l => l.id === id);
        if(!loan) return;
        
        let msg = `Hola ${loan.client}, le comunicamos desde Agapea Respaldo Financiero. Su préstamo por la garantía (${loan.item}) `;
        if(loan.status === 'warning') {
            msg += `vence el ${this.formatDate(loan.dueDate)}. Tiene un saldo pendiente de interés de ${loan.interest} Bs. Por favor, regularice su pago para evitar recargos.`;
        } else if (loan.status === 'overdue') {
            msg += `se encuentra VENCIDO desde el ${this.formatDate(loan.dueDate)}. Agapea está a punto de pasar su artículo a liquidación. Comuníquese urgente para regularizar los ${loan.capital + loan.interest} Bs totales.`;
        } else {
            msg += `está al día. Su próximo vencimiento es el ${this.formatDate(loan.dueDate)}.`;
        }
        
        window.open(`https://wa.me/591${loan.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    },

    adjudicate(id) {
        if(!confirm('¿Pasar a catálogo de remates Agapea? Es irreversible.')) return;
        
        const loanIndex = this.data.loans.findIndex(l => l.id === id);
        if(loanIndex === -1) return;
        
        const loan = this.data.loans[loanIndex];
        loan.status = 'adjudicated';
        
        this.data.catalog.push({
            id: `CAT-${Date.now().toString().slice(-4)}`,
            title: loan.item.split('.')[0] || loan.item,
            condition: 'Recuperado Agapea',
            price: loan.capital + loan.interest + 50, 
            image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        });

        this.saveData();
        this.renderDashboard();
        this.renderCatalog('catalog-admin-grid');
        this.renderCatalog('public-catalog-grid');
        this.renderBalance();
        this.updateCharts();
    },

    printTicket(id) {
        const loan = this.data.loans.find(l => l.id === id);
        if(!loan) return;

        document.getElementById('print-contract-id').innerText = `Contrato Nro: ${loan.id}`;
        document.getElementById('print-client').innerText = loan.client;
        document.getElementById('print-dni').innerText = loan.dni;
        document.getElementById('print-phone').innerText = loan.phone;
        
        document.getElementById('print-date').innerText = this.formatDate(loan.startDate);
        document.getElementById('print-due').innerText = this.formatDate(loan.dueDate);
        document.getElementById('print-period').innerText = loan.period;
        
        document.getElementById('print-item').innerText = loan.item;
        
        document.getElementById('print-capital').innerText = this.formatMoney(loan.capital);
        document.getElementById('print-interest').innerText = this.formatMoney(loan.interest);
        document.getElementById('print-total').innerText = this.formatMoney(loan.capital + loan.interest);
        document.getElementById('print-sign-client').innerText = `CI: ${loan.dni}`;

        window.print();
    },

    // --- Detailed Charts (Dark Mode Setup) ---
    initCharts() {
        if(this.charts.bar) this.charts.bar.destroy();
        if(this.charts.doughnut) this.charts.doughnut.destroy();

        Chart.defaults.color = '#9aa5ce'; // textMuted
        Chart.defaults.font.family = 'Inter';

        const barCtx = document.getElementById('barChart').getContext('2d');
        this.charts.bar = new Chart(barCtx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: { 
                    legend: { position: 'top', labels: { usePointStyle: true, font: {family: 'Inter', size: 12} } },
                    tooltip: {
                        backgroundColor: '#24283b',
                        titleColor: '#fff',
                        bodyColor: '#c0caf5',
                        borderColor: '#414868',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) label += context.parsed.y + ' Bs';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, grid: { display: false }, border: { display: false } },
                    y: { 
                        stacked: true, beginAtZero: true, 
                        grid: { color: '#41486844' }, // subtle dark border
                        border: { display: false } 
                    }
                }
            }
        });

        const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
        this.charts.doughnut = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '75%',
                plugins: { 
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                    tooltip: {
                        backgroundColor: '#24283b',
                        titleColor: '#fff',
                        bodyColor: '#c0caf5',
                        borderColor: '#414868',
                        borderWidth: 1
                    }
                }
            }
        });

        this.updateCharts();
    },

    updateCharts() {
        if(!this.charts.doughnut || !this.charts.bar) return;
        
        const filteredLoans = this.getFilteredLoans();
        
        // Doughnut Chart update
        const activeCount = filteredLoans.filter(l => l.status === 'active').length;
        const warningCount = filteredLoans.filter(l => l.status === 'warning').length;
        const overdueCount = filteredLoans.filter(l => l.status === 'overdue').length;
        const adjudicatedCount = filteredLoans.filter(l => l.status === 'adjudicated').length;

        this.charts.doughnut.data = {
            labels: ['Al Día', 'Vence en 48h', 'Vencidos', 'Adjudicados'],
            datasets: [{
                data: [activeCount, warningCount, overdueCount, adjudicatedCount],
                backgroundColor: ['#9ece6a', '#e0af68', '#f7768e', '#414868'],
                borderColor: '#1a1b26',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
        this.charts.doughnut.update();
        
        // Bar Chart update (Detailed: Capital vs Interest)
        let groupByDay = false;
        if(filteredLoans.length > 0) {
            let minDate = new Date(Math.min(...filteredLoans.map(l => new Date(l.startDate))));
            let maxDate = new Date(Math.max(...filteredLoans.map(l => new Date(l.startDate))));
            let diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
            if(diffDays <= 45) groupByDay = true;
        }

        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const groupedData = {};
        
        filteredLoans.forEach(loan => {
            const d = new Date(loan.startDate);
            let key = '';
            if (groupByDay) {
                key = `${d.getDate()} ${monthNames[d.getMonth()]}`;
            } else {
                key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            }
            
            if(!groupedData[key]) groupedData[key] = { capital: 0, interest: 0 };
            groupedData[key].capital += loan.capital;
            groupedData[key].interest += loan.interest;
        });

        const labels = Object.keys(groupedData);
        const capitalData = labels.map(l => groupedData[l].capital);
        const interestData = labels.map(l => groupedData[l].interest);

        this.charts.bar.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Capital Colocado',
                    data: capitalData,
                    backgroundColor: '#7aa2f7', // Pastel blue
                    borderRadius: 4,
                    barPercentage: 0.6
                },
                {
                    label: 'Interés Proyectado',
                    data: interestData,
                    backgroundColor: '#bb9af7', // Pastel purple
                    borderRadius: 4,
                    barPercentage: 0.6
                }
            ]
        };
        this.charts.bar.update();
    },

    // --- Balance ---
    renderBalance() {
        const activeLoans = this.data.loans.filter(l => l.status !== 'adjudicated');
        const pendingInterest = activeLoans.reduce((sum, l) => sum + l.interest, 0);
        const catalogValue = this.data.catalog.reduce((sum, item) => sum + item.price, 0);

        document.getElementById('balance-pending-interest').innerText = this.formatMoney(pendingInterest);
        document.getElementById('balance-catalog-value').innerText = this.formatMoney(catalogValue);
    },

    // --- Modal Logic ---
    setupEventListeners() {
        // Login
        document.getElementById('form-login').addEventListener('submit', (e) => this.handleLogin(e));

        // Time filter
        document.getElementById('time-filter').addEventListener('change', () => this.handleTimeFilterChange());

        // New Loan
        const amountInput = document.getElementById('nl-amount');
        const periodSelect = document.getElementById('nl-period');
        
        const updateCalc = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const period = parseInt(periodSelect.value);
            const rate = period === 15 ? 0.10 : 0.20;
            const interest = amount * rate;
            
            document.getElementById('nl-calc-interest').innerText = interest.toFixed(2) + ' Bs';
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + period);
            document.getElementById('nl-calc-date').innerText = this.formatDate(dueDate.toISOString());
        };

        amountInput.addEventListener('input', updateCalc);
        periodSelect.addEventListener('change', updateCalc);

        document.getElementById('form-new-loan').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewLoan();
        });

        document.getElementById('form-new-catalog').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewCatalogItem();
        });
    },

    openNewLoanModal() {
        const dialog = document.getElementById('modal-new-loan');
        document.getElementById('form-new-loan').reset();
        document.getElementById('nl-calc-interest').innerText = '0 Bs';
        document.getElementById('nl-calc-date').innerText = '-';
        dialog.showModal();
    },

    closeNewLoanModal() {
        document.getElementById('modal-new-loan').close();
    },

    saveNewLoan() {
        const amount = parseFloat(document.getElementById('nl-amount').value);
        const period = parseInt(document.getElementById('nl-period').value);
        const rate = period === 15 ? 0.10 : 0.20;
        
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + period);

        const newLoan = {
            id: `LN-${Date.now().toString().slice(-4)}`,
            client: document.getElementById('nl-name').value,
            dni: document.getElementById('nl-dni').value,
            phone: document.getElementById('nl-phone').value,
            item: document.getElementById('nl-item').value,
            capital: amount,
            interest: amount * rate,
            period: period,
            startDate: now.toISOString(),
            dueDate: dueDate.toISOString(),
            status: 'active'
        };

        this.data.loans.push(newLoan);
        this.saveData();
        this.closeNewLoanModal();
        this.renderDashboard();
        this.renderBalance();
        this.updateCharts();
        
        if(confirm('Préstamo registrado. ¿Imprimir boleta Agapea ahora?')) {
            this.printTicket(newLoan.id);
        }
    },

    // --- New Catalog Item Modal ---
    openNewCatalogItemModal() {
        const dialog = document.getElementById('modal-new-catalog');
        document.getElementById('form-new-catalog').reset();
        dialog.showModal();
    },

    closeNewCatalogItemModal() {
        document.getElementById('modal-new-catalog').close();
    },

    saveNewCatalogItem() {
        const title = document.getElementById('nc-title').value;
        const condition = document.getElementById('nc-condition').value;
        const price = parseFloat(document.getElementById('nc-price').value);
        const imageUrl = document.getElementById('nc-image').value || 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        const newItem = {
            id: `CAT-${Date.now().toString().slice(-4)}`,
            title: title,
            condition: condition,
            price: price,
            image: imageUrl
        };

        this.data.catalog.push(newItem);
        this.saveData();
        this.closeNewCatalogItemModal();
        this.renderCatalog('catalog-admin-grid');
        this.renderCatalog('public-catalog-grid');
        this.renderBalance();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
