document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elementleri ---
    const contentGrid = document.getElementById('contentGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    const navTabs = document.querySelector('.nav-tabs');
    const categoryBtns = document.querySelector('.categories');
    
    // Advanced Filters
    const sortSelect = document.getElementById('sortSelect');
    const ratingFilter = document.getElementById('ratingFilter');
    const yearFilter = document.getElementById('yearFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const themeToggle = document.getElementById('themeToggle');
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const advancedFilters = document.querySelector('.advanced-filters');
    
    // Dashboard Elements
    const openStatsBtn = document.getElementById('openStatsBtn');
    const statsModal = document.getElementById('statsModal');
    const closeStatsModal = document.getElementById('closeStatsModal');
    const totalItemsModal = document.getElementById('totalItemsModal');
    const completedItemsModal = document.getElementById('completedItemsModal');
    const watchingItemsModal = document.getElementById('watchingItemsModal');
    const avgRatingModal = document.getElementById('avgRatingModal');
    const recentActivityListModal = document.getElementById('recentActivityListModal');
    
    // Hedef Sistemi Elementleri
    const editGoalsBtn = document.getElementById('editGoalsBtn');
    const goalsModal = document.getElementById('goalsModal');
    const closeGoalsModal = document.getElementById('closeGoalsModal');
    const cancelGoalsBtn = document.getElementById('cancelGoalsBtn');
    const goalsForm = document.getElementById('goalsForm');
    const goalsGrid = document.getElementById('goalsGrid');
    const goalsMotivation = document.getElementById('goalsMotivation');
    
    // Settings Elements
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    // Bulk Actions Elements
    const selectModeBtn = document.getElementById('selectModeBtn');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectionCount = document.getElementById('selectionCount');
    const cancelSelectModeBtn = document.getElementById('cancelSelectModeBtn');
    const bulkActionsButtons = document.querySelector('.bulk-actions-buttons');

    // Modallar
    const addItemModal = document.getElementById('addItemModal');
    const itemDetailModal = document.getElementById('itemDetailModal');
    const addItemModalTitle = addItemModal.querySelector('.modal-header h2');
    
    // Butonlar
    const addItemBtn = document.getElementById('addItemBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const closeDetailModalBtn = document.getElementById('closeDetailModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Hedef Form Elementleri
    const monthlyWatching = document.getElementById('monthlyWatching');
    const monthlyCompleted = document.getElementById('monthlyCompleted');
    const monthlyRating = document.getElementById('monthlyRating');
    const yearlyTotal = document.getElementById('yearlyTotal');
    const yearlyVariety = document.getElementById('yearlyVariety');

    // Yeni Öğe Formu
    const addItemForm = document.getElementById('addItemForm');
    const itemTitle = document.getElementById('itemTitle');
    const itemType = document.getElementById('itemType');
    const itemStatus = document.getElementById('itemStatus');
    const itemProgress = document.getElementById('itemProgress');
    const itemTotal = document.getElementById('itemTotal');
    const itemYear = document.getElementById('itemYear');
    const itemRating = document.getElementById('itemRating');
    const itemNotes = document.getElementById('itemNotes');
    const itemTrailer = document.getElementById('itemTrailer');
    const apiSearchResults = document.getElementById('apiSearchResults');

    // Detay Modalı Elementleri
    const detailTitle = document.getElementById('detailTitle');
    const detailPoster = document.getElementById('detailPoster');
    const detailType = document.getElementById('detailType');
    const detailStatus = document.getElementById('detailStatus');
    const detailProgress = document.getElementById('detailProgress');
    const detailRating = document.getElementById('detailRating');
    const detailNotes = document.getElementById('detailNotes');
    const trailerRow = document.getElementById('trailerRow');
    const watchTrailerBtn = document.getElementById('watchTrailerBtn');

    // Trailer Modal Elements
    const trailerModal = document.getElementById('trailerModal');
    const closeTrailerModal = document.getElementById('closeTrailerModal');
    const trailerIframe = document.getElementById('trailerIframe');

    // Delete All Data Elements
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const confirmDeleteAllModal = document.getElementById('confirmDeleteAllModal');
    const cancelDeleteAllBtn = document.getElementById('cancelDeleteAllBtn');
    const confirmDeleteAllFinalBtn = document.getElementById('confirmDeleteAllFinalBtn');

    // --- Veri ve Durum Yönetimi ---
    let items = JSON.parse(localStorage.getItem('watchlistItems')) || [];
    let currentlyEditingId = null;
    let currentStatusFilter = 'all';
    let currentTypeFilter = 'all';
    let debounceTimer;
    
    // Theme management
    let currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Advanced filters
    let currentSortBy = 'date-added';
    let currentMinRating = 0;
    let currentYear = '';
    
    // Selection State
    let isSelectMode = false;
    let selectedItemIds = new Set();
    let latestSearchId = 0;

    // Dashboard state
    let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];

    // Hedef Sistemi Veri Yapısı (Güvenli Yükleme)
    const loadGoals = () => {
        const defaultGoals = {
            monthly: { watching: 10, completed: 5, rating: 8.0 },
            yearly: { total: 100, variety: 6 }
        };
        const savedGoals = JSON.parse(localStorage.getItem('goals')) || {};
        return {
            monthly: { ...defaultGoals.monthly, ...(savedGoals.monthly || {}) },
            yearly: { ...defaultGoals.yearly, ...(savedGoals.yearly || {}) },
        };
    };

    const loadGoalsProgress = () => {
        const defaultProgress = {
            monthly: { watching: 0, completed: 0, rating: 0 },
            yearly: { total: 0, variety: 0 },
            lastReset: new Date().toISOString()
        };
        const savedProgress = JSON.parse(localStorage.getItem('goalsProgress')) || {};
        const progress = {
            monthly: { ...defaultProgress.monthly, ...(savedProgress.monthly || {}) },
            yearly: { ...defaultProgress.yearly, ...(savedProgress.yearly || {}) },
            lastReset: savedProgress.lastReset || defaultProgress.lastReset
        };
        return progress;
    };

    let goals = loadGoals();
    let goalsProgress = loadGoalsProgress();

    // --- API Ayarları ---
    // API Anahtarları ve URL'ler artık sunucu tarafındaki fonksiyonda yönetiliyor.
    // const TMDB_API_KEY = 'd699b8b51274da65ee8af102a4825c61'; 
    // const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    // const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

    // --- Fonksiyonlar ---

    // Chart creation functions
    let statusChart = null;
    let typeChart = null;

    const createStatusChart = () => {
        const statusCtx = document.getElementById('statusChart');
        if (!statusCtx) return;

        if (statusChart) {
            statusChart.destroy();
        }

        const statusData = {
            'watching': items.filter(item => item.status === 'watching').length,
            'completed': items.filter(item => item.status === 'completed').length,
            'plan-to-watch': items.filter(item => item.status === 'plan-to-watch').length
        };

        const labels = ['Watching', 'Completed', 'Plan to Watch'];
        const data = [statusData['watching'], statusData['completed'], statusData['plan-to-watch']];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];

        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: 'var(--dark-color)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-color)',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    };

    const createTypeChart = () => {
        const typeCtx = document.getElementById('typeChart');
        if (!typeCtx) return;

        if (typeChart) {
            typeChart.destroy();
        }

        const typeData = {};
        items.forEach(item => {
            typeData[item.type] = (typeData[item.type] || 0) + 1;
        });

        const labels = Object.keys(typeData).map(type => 
            type.charAt(0).toUpperCase() + type.slice(1)
        );
        const data = Object.values(typeData);
        const colors = ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84'];

        typeChart = new Chart(typeCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Items',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'var(--text-color)',
                            stepSize: 1
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-color)'
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    }
                }
            }
        });
    };
    
    const updateCharts = () => {
        createStatusChart();
        createTypeChart();
    };

    const showToast = (message, type = 'info', duration = 3000) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    };

    const saveItems = () => {
        localStorage.setItem('watchlistItems', JSON.stringify(items));
    };

    // Theme management
    const toggleTheme = () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        
        // Update theme toggle icon
        const icon = themeToggle.querySelector('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const initializeTheme = () => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const populateYearFilter = () => {
        const currentFullYear = new Date().getFullYear();
        const startYear = Math.floor(currentFullYear / 5) * 5; 
        for (let year = startYear; year >= 1975; year -= 5) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}+`;
            yearFilter.appendChild(option);
        }
    };

    // Hedef Sistemi Fonksiyonları
    const checkAndResetGoals = () => {
        const now = new Date();
        const lastReset = new Date(goalsProgress.lastReset);
        
        // Aylık sıfırlama kontrolü
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            goalsProgress.monthly = {
                watching: 0,
                completed: 0,
                rating: 0
            };
            goalsProgress.lastReset = now.toISOString();
            localStorage.setItem('goalsProgress', JSON.stringify(goalsProgress));
        }
        
        // Yıllık sıfırlama kontrolü
        if (now.getFullYear() !== lastReset.getFullYear()) {
            goalsProgress.yearly = {
                total: 0,
                variety: 0
            };
        }
    };

    const calculateGoalsProgress = () => {
        checkAndResetGoals();
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Bu ay eklenen içerikler
        const thisMonthItems = items.filter(item => {
            if (!item.dateAdded) return false;
            const itemDate = new Date(item.dateAdded);
            if (isNaN(itemDate.getTime())) return false;
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
        
        // Bu ay tamamlanan içerikler
        const thisMonthCompleted = items.filter(item => {
            if (item.status !== 'completed' || !item.dateAdded) return false;
            const itemDate = new Date(item.dateAdded);
            if (isNaN(itemDate.getTime())) return false;
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
        
        // Bu ay verilen puanlar
        const thisMonthRatings = items.filter(item => {
            if (!item.rating || !item.dateAdded) return false;
            const itemDate = new Date(item.dateAdded);
            if (isNaN(itemDate.getTime())) return false;
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
        
        // Bu yıl eklenen içerikler
        const thisYearItems = items.filter(item => {
            if (!item.dateAdded) return false;
            const itemDate = new Date(item.dateAdded);
            if (isNaN(itemDate.getTime())) return false;
            return itemDate.getFullYear() === currentYear;
        });
        
        // Bu yıl farklı türler
        const thisYearTypes = new Set(thisYearItems.map(item => item.type));
        
        // İlerleme hesaplamaları
        goalsProgress.monthly.watching = thisMonthItems.length;
        goalsProgress.monthly.completed = thisMonthCompleted.length;
        goalsProgress.monthly.rating = thisMonthRatings.length > 0 
            ? (thisMonthRatings.reduce((sum, item) => sum + item.rating, 0) / thisMonthRatings.length).toFixed(1)
            : 0;
        
        goalsProgress.yearly.total = thisYearItems.length;
        goalsProgress.yearly.variety = thisYearTypes.size;
        
        localStorage.setItem('goalsProgress', JSON.stringify(goalsProgress));
    };

    const updateGoalsMotivation = () => {
        if (!goalsMotivation) return;

        let completedCount = 0;
        let totalActiveGoals = 0;

        Object.keys(goals.monthly).forEach(key => {
            if (goals.monthly[key] > 0) {
                totalActiveGoals++;
                if (goalsProgress.monthly[key] >= goals.monthly[key]) {
                    completedCount++;
                }
            }
        });

        Object.keys(goals.yearly).forEach(key => {
            if (goals.yearly[key] > 0) {
                totalActiveGoals++;
                if (goalsProgress.yearly[key] >= goals.yearly[key]) {
                    completedCount++;
                }
            }
        });

        const overallProgress = totalActiveGoals > 0 ? (completedCount / totalActiveGoals) * 100 : 0;
        
        let motivationMessage = '';
        let motivationIcon = '';

        if (totalActiveGoals === 0) {
            motivationMessage = '🚀 Henüz bir hedef belirlemedin. Başlamak için hedeflerini düzenle!';
            motivationIcon = '🎯';
        } else if (overallProgress >= 100) {
            motivationMessage = '🎉 Harika! Tüm hedeflerini tamamladın!';
            motivationIcon = '🏆';
        } else if (overallProgress >= 75) {
            motivationMessage = '🔥 Çok yakınsın! Son dürtüşü ver!';
            motivationIcon = '🚀';
        } else if (overallProgress >= 50) {
            motivationMessage = '💪 Yarı yoldasın! Devam et!';
            motivationIcon = '⭐';
        } else if (overallProgress > 0) {
            motivationMessage = '🌟 İyi gidiyorsun! Hedeflerine odaklan!';
            motivationIcon = '🎯';
        } else {
            motivationMessage = '🚀 Yeni bir ay, yeni hedefler! Başla!';
            motivationIcon = '💫';
        }

        goalsMotivation.innerHTML = `
            <span class="motivation-icon">${motivationIcon}</span>
            ${motivationMessage}
        `;
    };

    const updateGoals = () => {
        calculateGoalsProgress();
        
        if (!goalsGrid) return;
        
        goalsGrid.innerHTML = '';
        
        const monthlyGoals = [
            {
                key: 'watching',
                title: 'İzlemeye Başla',
                icon: '🎬',
                current: goalsProgress.monthly.watching,
                target: goals.monthly.watching,
                color: '#4ecdc4'
            },
            {
                key: 'completed',
                title: 'Tamamla',
                icon: '✅',
                current: goalsProgress.monthly.completed,
                target: goals.monthly.completed,
                color: '#45b7d1'
            },
            {
                key: 'rating',
                title: 'Ortalama Puan',
                icon: '⭐',
                current: parseFloat(goalsProgress.monthly.rating),
                target: goals.monthly.rating,
                color: '#ff6b6b'
            }
        ];
        
        const yearlyGoals = [
            {
                key: 'total',
                title: 'Yıllık Toplam',
                icon: '📊',
                current: goalsProgress.yearly.total,
                target: goals.yearly.total,
                color: '#ff9f43'
            },
            {
                key: 'variety',
                title: 'Farklı Türler',
                icon: '🎭',
                current: goalsProgress.yearly.variety,
                target: goals.yearly.variety,
                color: '#10ac84'
            }
        ];
        
        [...monthlyGoals, ...yearlyGoals].forEach(goal => {
            if (goal.target <= 0) return;
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;
            
            const goalCard = document.createElement('div');
            goalCard.className = `goal-card ${isCompleted ? 'completed' : ''}`;
            
            goalCard.innerHTML = `
                <span class="goal-icon">${goal.icon}</span>
                <div class="goal-title">${goal.title}</div>
                <div class="goal-progress">
                    <span class="goal-current">${goal.current}</span>/<span class="goal-target">${goal.target}</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${percentage}%; background: ${goal.color}"></div>
                </div>
                <div class="goal-percentage">${percentage.toFixed(0)}%</div>
            `;
            
            goalsGrid.appendChild(goalCard);
        });
        
        updateGoalsMotivation();
    };

    const updateRecentActivity = () => {
        if (!recentActivityListModal) return;
        
        recentActivityListModal.innerHTML = '';
        
        if (activityLog.length === 0) {
            recentActivityListModal.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 0.8rem;">No recent activity</p>';
            return;
        }

        activityLog.slice(0, 5).forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const actionIcons = {
                'add': 'fas fa-plus',
                'edit': 'fas fa-edit',
                'delete': 'fas fa-trash',
                'complete': 'fas fa-check'
            };
            
            const actionTexts = {
                'add': 'Added',
                'edit': 'Edited',
                'delete': 'Deleted',
                'complete': 'Completed'
            };
            
            const timeAgo = getTimeAgo(new Date(activity.timestamp));
            
            activityItem.innerHTML = `
                <div class="activity-icon ${activity.action}">
                    <i class="${actionIcons[activity.action]}"></i>
                </div>
                <div class="activity-info">
                    <h4>${actionTexts[activity.action]} "${activity.title}"</h4>
                    <p>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</p>
                </div>
                <span class="activity-time">${timeAgo}</span>
            `;
            
            recentActivityListModal.appendChild(activityItem);
        });
    };

    // Dashboard Functions
    const updateDashboard = () => {
        try {
            const total = items.length;
            const completed = items.filter(item => item.status === 'completed').length;
            const watching = items.filter(item => item.status === 'watching').length;
            
            const avgRatingValue = total > 0 ? (items.reduce((sum, item) => sum + (item.rating || 0), 0) / items.filter(i => i.rating > 0).length || 0).toFixed(1) : '0.0';
            
            totalItemsModal.textContent = total;
            completedItemsModal.textContent = completed;
            watchingItemsModal.textContent = watching;
            avgRatingModal.textContent = avgRatingValue;
        } catch (error) {
            console.error("Dashboard ana istatistikleri güncellenirken hata:", error);
        }

        try {
            updateRecentActivity();
        } catch (error) {
            console.error("Son aktiviteler güncellenirken hata:", error);
        }

        try {
            updateCharts();
        } catch (error) {
            console.error("Grafikler güncellenirken hata:", error);
        }
        
        try {
            updateGoals();
        } catch (error) {
            console.error("Hedefler güncellenirken hata:", error);
            if (goalsGrid) {
                goalsGrid.innerHTML = '<p class="error-message">Hedefler yüklenirken bir sorun oluştu. Lütfen konsolu kontrol edin.</p>';
            }
        }
    };

    const addActivity = (action, itemTitle, itemType) => {
        const activity = {
            id: Date.now(),
            action,
            title: itemTitle,
            type: itemType,
            timestamp: new Date().toISOString()
        };
        
        activityLog.unshift(activity);
        if (activityLog.length > 10) activityLog.pop(); // Keep only last 10 activities
        
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
        updateRecentActivity();
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const openGoalsModal = () => {
        // Form alanlarını mevcut hedeflerle doldur
        monthlyWatching.value = goals.monthly.watching;
        monthlyCompleted.value = goals.monthly.completed;
        monthlyRating.value = goals.monthly.rating;
        yearlyTotal.value = goals.yearly.total;
        yearlyVariety.value = goals.yearly.variety;
        
        goalsModal.style.zIndex = '1001';
        goalsModal.style.display = 'flex';
    };

    const closeGoalsModalFunc = () => {
        goalsModal.style.display = 'none';
        goalsModal.style.zIndex = '';
    };

    const saveGoals = (e) => {
        e.preventDefault();
        
        goals.monthly.watching = parseInt(monthlyWatching.value) || 0;
        goals.monthly.completed = parseInt(monthlyCompleted.value) || 0;
        goals.monthly.rating = parseFloat(monthlyRating.value) || 0;
        goals.yearly.total = parseInt(yearlyTotal.value) || 0;
        goals.yearly.variety = parseInt(yearlyVariety.value) || 0;
        
        localStorage.setItem('goals', JSON.stringify(goals));
        
        updateGoals();
        closeGoalsModalFunc();
        
        showToast('Hedeflerin başarıyla kaydedildi! 🎯', 'success');
    };

    const renderSkeletons = (count) => {
        contentGrid.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'skeleton-card shimmer-wrapper';
            skeletonCard.innerHTML = `
                <div class="skeleton-poster"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-footer"></div>
                </div>
                <div class="shimmer"></div>
            `;
            contentGrid.appendChild(skeletonCard);
        }
    };

    const renderItems = () => {
        renderSkeletons(12); // Önce 12 iskelet kartı göster

        // Gerçek veriyi render etme işlemini küçük bir gecikmeyle yapıyoruz ki 
        // kullanıcı yükleme animasyonunu görebilsin.
        setTimeout(() => {
            const query = searchInput.value.toLowerCase().trim();
            let filteredItems = items;
    
            // Arama filtresi
            if (query) {
                filteredItems = filteredItems.filter(item =>
                    item.title.toLowerCase().includes(query)
                );
            }
    
            // Durum filtresi (watching, completed vb.)
            if (currentStatusFilter !== 'all') {
                filteredItems = filteredItems.filter(item => item.status === currentStatusFilter);
            }
    
            // Tür filtresi (anime, movie vb.)
            if (currentTypeFilter !== 'all') {
                filteredItems = filteredItems.filter(item => item.type === currentTypeFilter);
            }
    
            // Rating filtresi
            if (currentMinRating > 0) {
                filteredItems = filteredItems.filter(item => item.rating >= currentMinRating);
            }
    
            // Yıl filtresi
            if (currentYear) {
                filteredItems = filteredItems.filter(item => item.year == currentYear);
            }
    
            // Sıralama
            filteredItems.sort((a, b) => {
                switch (currentSortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'rating':
                        return (b.rating || 0) - (a.rating || 0);
                    case 'rating-low':
                        return (a.rating || 0) - (b.rating || 0);
                    case 'progress':
                         return (b.progress / b.total * 100) - (a.progress / a.total * 100);
                    default: // date-added
                        // HATA DÜZELTMESİ: dateAdded olmayan öğeler için güvenli sıralama
                        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
                        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
                        return dateB - dateA;
                }
            });
    
            contentGrid.innerHTML = '';
    
            if (filteredItems.length === 0) {
                contentGrid.innerHTML = '<p class="empty-message">No items found. Try different filters or add a new item!</p>';
                return;
            }
    
            filteredItems.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.dataset.id = item.id;
                if(selectedItemIds.has(item.id)) {
                    itemCard.classList.add('selected');
                }

                const typeIcons = {
                    anime: 'fa-tv', movie: 'fa-film', series: 'fa-video', 
                    manga: 'fa-book-open', manhwa: 'fa-book', book: 'fa-bookmark'
                };

                const posterHtml = item.posterUrl 
                    ? `<img src="${item.posterUrl}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='icons/icon-192x192.png'; this.classList.add('poster-placeholder');">`
                    : `<div class="poster-placeholder"><i class="fas ${typeIcons[item.type] || 'fa-question-circle'}"></i></div>`;

                itemCard.innerHTML = `
                    <div class="item-card-poster">
                        ${posterHtml}
                    </div>
                    <div class="item-card-info">
                        <h3 class="item-card-title">${item.title}</h3>
                        <div class="item-card-footer">
                            <span class="item-card-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                            <span class="item-card-rating">
                                <i class="fas fa-star"></i>
                                <span>${item.rating}/10</span>
                            </span>
                        </div>
                    </div>
                `;
                itemCard.addEventListener('click', () => {
                    if (isSelectMode) {
                        toggleItemSelection(item.id, itemCard);
                    } else {
                        openDetailModal(item.id);
                    }
                });
                contentGrid.appendChild(itemCard);
            });
        }, 200); // 200ms gecikme
    };

    // YouTube URL'ini embed URL'ine çevirme
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        
        // YouTube URL'lerini parse etme
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return `https://www.youtube.com/embed/${match[1]}`;
            }
        }
        
        return null;
    };

    // Fragman modalını açma
    const openTrailerModal = (trailerUrl) => {
        const embedUrl = getYouTubeEmbedUrl(trailerUrl);
        if (embedUrl) {
            trailerIframe.src = embedUrl;
            trailerModal.style.display = 'block';
        } else {
            alert('Invalid YouTube URL. Please check the link and try again.');
        }
    };

    // Yeni Öğe Ekleme/Düzenleme Modalını Açma
    const openAddModal = (item) => {
        addItemForm.reset();
        apiSearchResults.innerHTML = '';
        addItemModal.style.display = 'block';

        // Tarayıcının modalı render etmesi ve klavye gibi UI elementlerini
        // hazırlaması için kısa bir gecikme (100ms) ekle. Bu, mobil cihazlarda
        // kararlılığı artırır.
        setTimeout(() => {
            // Önce scroll'u en üste al
            addItemModal.scrollTop = 0;
            // Sonra ilk input'a odaklanarak tarayıcıyı en üste zorla
            itemTitle.focus();
        }, 100);

        if (item) {
            addItemModalTitle.textContent = 'Edit Item';
            addItemForm.querySelector('button[type="submit"]').textContent = 'Save Changes';
            currentlyEditingId = item.id;
            addItemForm.dataset.posterUrl = item.posterUrl || '';

            itemTitle.value = item.title;
            itemType.value = item.type;
            itemStatus.value = item.status;
            itemProgress.value = item.progress;
            itemTotal.value = item.total;
            itemYear.value = item.year || '';
            itemRating.value = item.rating;
            itemNotes.value = item.notes;
            itemTrailer.value = item.trailerUrl || '';
        } else {
            addItemModalTitle.textContent = 'Add New Item';
            addItemForm.querySelector('button[type="submit"]').textContent = 'Add Item';
            currentlyEditingId = null;
        }
    };

    // Detay Modalını Açma
    const openDetailModal = (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        currentlyEditingId = id;

        detailTitle.textContent = item.title;
        detailType.textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        detailStatus.textContent = item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        detailProgress.textContent = `${item.progress || 'N/A'} / ${item.total || 'N/A'}`;
        detailRating.innerHTML = `<i class="fas fa-star" style="color: var(--star-color);"></i> ${item.rating}/10`;
        detailNotes.textContent = item.notes || 'No notes added.';
        
        detailPoster.src = item.posterUrl || '';
        detailPoster.alt = item.posterUrl ? item.title : '';
        
        // Fragman butonunu göster/gizle
        if (item.trailerUrl) {
            trailerRow.style.display = 'flex';
            watchTrailerBtn.onclick = () => openTrailerModal(item.trailerUrl);
        } else {
            trailerRow.style.display = 'none';
        }
        
        itemDetailModal.style.display = 'block';
    };
    
    // Modalları Kapatma
    const closeModal = () => {
        addItemModal.style.display = 'none';
        itemDetailModal.style.display = 'none';
        if(statsModal) statsModal.style.display = 'none';
        if(settingsModal) settingsModal.style.display = 'none';
        if(trailerModal) trailerModal.style.display = 'none';
        if(goalsModal) goalsModal.style.display = 'none'; // Hedef modalını da kapat
    };
    
    // --- Event Listeners ---
    
    // Form gönderme (yeni ekleme ve düzenleme)
    addItemForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const newItemData = {
            title: itemTitle.value.trim(),
            type: itemType.value,
            status: itemStatus.value,
            progress: itemProgress.value,
            total: itemTotal.value,
            year: itemYear.value,
            rating: parseFloat(itemRating.value) || 0,
            notes: itemNotes.value.trim(),
            posterUrl: addItemForm.dataset.posterUrl || '',
            trailerUrl: itemTrailer.value.trim() || ''
        };

        if (currentlyEditingId) {
            // Düzenleme
            const existingItem = items.find(i => i.id === currentlyEditingId);
            items = items.map(item => 
                item.id === currentlyEditingId 
                    ? { ...existingItem, ...newItemData, id: item.id } 
                    : item
            );
            addActivity('edit', newItemData.title, newItemData.type);
            showToast('Item updated successfully!', 'success');
        } else {
            // Yeni ekleme - Duplication Check
            const isDuplicate = items.some(
                item => item.title.toLowerCase() === newItemData.title.toLowerCase() &&
                        item.type === newItemData.type
            );

            if (isDuplicate) {
                alert(`'${newItemData.title}' is already in your watchlist as a(n) ${newItemData.type}.`);
                return; // Stop the function if duplicate is found
            }

            newItemData.id = Date.now();
            newItemData.dateAdded = new Date().toISOString();
            items.push(newItemData);
            addActivity('add', newItemData.title, newItemData.type);
            showToast('Item added successfully!', 'success');

            // Automatically switch filters to show the new item
            navTabs.querySelector('.active').classList.remove('active');
            navTabs.querySelector(`[data-category="${newItemData.status}"]`).classList.add('active');
            currentStatusFilter = newItemData.status;

            categoryBtns.querySelector('.active').classList.remove('active');
            categoryBtns.querySelector('[data-type="all"]').classList.add('active');
            currentTypeFilter = 'all';
        }

        saveItems();
        renderItems();
        closeModal();
        delete addItemForm.dataset.posterUrl; // Temizle
    });

    // Filtreleme
    navTabs.addEventListener('click', e => {
        if (e.target.matches('.nav-tab')) {
            navTabs.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentStatusFilter = e.target.dataset.category;
            renderItems();
        }
    });

    categoryBtns.addEventListener('click', e => {
        if (e.target.matches('.category-btn')) {
            categoryBtns.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentTypeFilter = e.target.dataset.type;
            renderItems();
        }
    });
    
    // Arama
    searchBtn.addEventListener('click', renderItems);
    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            renderItems();
        }
    });

    // --- API Arama Fonksiyonları ---
    
    const clearApiResults = () => {
        apiSearchResults.innerHTML = '';
    };

    const processTmdbMovies = (data) => {
        if (!data || !data.results) return [];
        return data.results.map(item => ({
            id: `movie-${item.id}`,
            title: item.title || 'Untitled',
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
            year: item.release_date ? item.release_date.split('-')[0] : '',
            type: 'movie',
            popularity: item.popularity || 0
        }));
    };
    
    const processTmdbSeries = (data) => {
        if (!data || !data.results) return [];
        return data.results.map(item => ({
            id: `series-${item.id}`,
            title: item.name || 'Untitled',
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
            year: item.first_air_date ? item.first_air_date.split('-')[0] : '',
            type: 'series',
            popularity: item.popularity || 0,
            total: item.number_of_episodes || null
        }));
    };
    
    const processJikanAnime = (data) => {
        if (!data || !data.data) return [];
        return data.data.map(item => ({
            id: `anime-${item.mal_id}`,
            title: item.title || 'Untitled',
            poster: item.images?.jpg?.large_image_url || '',
            year: item.year || '',
            type: 'anime',
            popularity: item.members || 0,
            total: item.episodes || null
        }));
    };
    
    const processJikanManga = (data) => {
        if (!data || !data.data) return [];
        return data.data.map(item => ({
            id: `manga-${item.mal_id}`,
            title: item.title || 'Untitled',
            poster: item.images?.jpg?.large_image_url || '',
            year: item.published?.prop?.from?.year || '',
            type: 'manga',
            popularity: item.members || 0,
            total: item.chapters || null
        }));
    };

    const sortApiResults = (results, query) => {
        const typeOrder = { 'anime': 1, 'series': 2, 'manga': 3, 'movie': 4 };
        const lowerQuery = query.toLowerCase();
    
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
    
            // Öncelik 1: Başlık arama terimiyle tam olarak eşleşiyor mu?
            const aIsExact = aTitle === lowerQuery;
            const bIsExact = bTitle === lowerQuery;
            if (aIsExact && !bIsExact) return -1;
            if (bIsExact && !aIsExact) return 1;
    
            // Öncelik 2: Popülerlik (en önemli kriter)
            if (a.popularity !== b.popularity) {
                return b.popularity - a.popularity; // Yüksek olan önce gelsin
            }
            
            // Öncelik 3: Başlık arama terimiyle başlıyor mu? (Popülerlik aynı ise)
            const aStartsWith = aTitle.startsWith(lowerQuery);
            const bStartsWith = bTitle.startsWith(lowerQuery);
            if (aStartsWith && !bStartsWith) return -1;
            if (bStartsWith && !aStartsWith) return 1;
    
            // Öncelik 4: Tür hiyerarşisi
            const aOrder = typeOrder[a.type] || 99;
            const bOrder = typeOrder[b.type] || 99;
            if (aOrder !== bOrder) return aOrder - bOrder;
    
            return 0; // Her şey aynı ise sıralamayı koru
        });
    
        return results;
    };

    const handleApiSearch = async () => {
        const query = itemTitle.value.trim();
        if (query.length < 3) {
            clearApiResults();
            return;
        }
    
        latestSearchId++;
        const currentSearchId = latestSearchId;
    
        try {
            // Yeni evrensel arama proxy'mize istek atıyoruz
            const response = await fetch(`/api/?query=${encodeURIComponent(query)}`);
            
            if (currentSearchId !== latestSearchId) return;

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData.message);
                showToast(`API Hatası: ${errorData.message || 'Bilinmeyen bir hata oluştu.'}`, 'error');
                clearApiResults();
                return;
            }
    
            const data = await response.json();
            
            // Tüm sonuçları tek bir dizide birleştir
            let allResults = [
                ...processTmdbMovies(data.movies || { results: [] }),
                ...processTmdbSeries(data.series || { results: [] }),
                ...processJikanAnime(data.anime || { data: [] }),
                ...processJikanManga(data.manga || { data: [] })
            ];

            // Akıllı sıralamayı uygula
            const sortedResults = sortApiResults(allResults, query);
            
            displayApiResults(sortedResults);

        } catch (error) {
            console.error('Error fetching API data:', error);
            showToast('Veri getirme başarısız oldu. Lütfen internet bağlantınızı kontrol edin.', 'error');
            clearApiResults();
        }
    };
    
    const displayApiResults = (results) => {
        apiSearchResults.innerHTML = '';
        if (!results || results.length === 0) return;

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'api-result-item';
            resultItem.innerHTML = `
                <img src="${item.poster || 'icons/icon-192x192.png'}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='icons/icon-192x192.png'; this.classList.add('poster-placeholder');">
                <div class="api-result-info">
                    <h4>${item.title}</h4>
                    <p>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.year || 'N/A'}</p>
                </div>
            `;
            resultItem.addEventListener('click', () => {
                itemTitle.value = item.title;
                itemType.value = item.type;
                itemYear.value = item.year || '';
                itemTotal.value = item.total || '';
                
                // Diğer dataları da sakla
                addItemForm.dataset.apiId = item.id; 
                addItemForm.dataset.posterUrl = item.poster;
                
                clearApiResults();
            });
            apiSearchResults.appendChild(resultItem);
        });
    };

    itemTitle.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleApiSearch, 300);
    });

    itemType.addEventListener('change', () => {
        itemTotal.value = '';
        itemYear.value = '';
        delete addItemForm.dataset.posterUrl;
        clearApiResults();
        // If there is already text in the title, re-trigger the search with the new type
        if(itemTitle.value.trim().length > 1) {
            handleApiSearch();
        }
    });

    // Automatically set progress to total when status is 'completed'
    itemStatus.addEventListener('change', (e) => {
        const totalValue = itemTotal.value;
        if (e.target.value === 'completed' && totalValue) {
            itemProgress.value = totalValue;
        }
    });

    // Also handle case where total is entered after status is set
    itemTotal.addEventListener('input', (e) => {
        if (itemStatus.value === 'completed') {
            itemProgress.value = e.target.value;
        }
    });

    // Modal açma/kapama butonları
    addItemBtn.addEventListener('click', () => openAddModal());
    closeModalBtn.addEventListener('click', closeModal);
    closeDetailModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Detay modalı butonları
    deleteBtn.addEventListener('click', () => {
        if (!currentlyEditingId) return;

        const itemToDelete = items.find(i => i.id === currentlyEditingId);
        if (!itemToDelete) return;

        addActivity('delete', itemToDelete.title, itemToDelete.type);
        items = items.filter(item => item.id !== currentlyEditingId);
        
        saveItems();
        closeModal();
        renderItems();
        updateDashboard();
        showToast('Item deleted successfully.', 'success');
    });

    editBtn.addEventListener('click', () => {
        const item = items.find(i => i.id === currentlyEditingId);
        closeModal();
        openAddModal(item);
    });

    // Pencere dışına tıklayınca modalı kapatma
    window.addEventListener('click', e => {
        if (e.target === addItemModal || e.target === itemDetailModal || e.target === statsModal || e.target === settingsModal || e.target === trailerModal || e.target === confirmDeleteAllModal) {
            closeModal();
        }
        if (!apiSearchResults.contains(e.target) && e.target !== itemTitle) {
            clearApiResults();
        }
    });

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            console.log('Theme toggle clicked');
            toggleTheme();
        });
    }

    // Dashboard toggle
    if (openStatsBtn) {
        openStatsBtn.addEventListener('click', () => {
            // Önce modalı göster, sonra içeriği doldur. Bu, olası bir hatanın
            // modalın açılmasını engellemesini önler.
            statsModal.style.display = 'block';
            updateDashboard();
        });
    }

    if(closeStatsModal) {
        closeStatsModal.addEventListener('click', closeModal);
    }

    // Advanced filters
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            console.log('Sort changed:', e.target.value);
            currentSortBy = e.target.value;
            renderItems();
        });
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', (e) => {
            console.log('Rating filter changed:', e.target.value);
            currentMinRating = parseInt(e.target.value);
            renderItems();
        });
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', (e => {
            console.log('Year filter changed:', e.target.value);
            currentYear = e.target.value;
            renderItems();
        }));
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            console.log('Clear filters clicked');
            if (sortSelect) sortSelect.value = 'date-added';
            if (ratingFilter) ratingFilter.value = '0';
            if (yearFilter) yearFilter.value = '';
            currentSortBy = 'date-added';
            currentMinRating = 0;
            currentYear = '';
            renderItems();

            // Mobilse ve filtreler açıksa, temizledikten sonra kapat
            if (window.innerWidth <= 768 && advancedFilters.classList.contains('is-open')) {
                advancedFilters.classList.remove('is-open');
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: Add new item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openAddModal();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            closeModal();
            if(isSelectMode) toggleSelectMode(); // also exit select mode
        }
    });

    // --- Selection and Bulk Actions ---
    const toggleSelectMode = () => {
        isSelectMode = !isSelectMode;
        selectModeBtn.innerHTML = isSelectMode ? '<i class="fas fa-times"></i> Cancel' : '<i class="fas fa-check-square"></i> Select';
        selectModeBtn.style.backgroundColor = isSelectMode ? '#dc3545' : '#28a745';
        
        if (!isSelectMode) {
            bulkActionsBar.classList.remove('visible');
            selectedItemIds.clear();
            // Re-render to remove selection styles
            renderItems();
        }
    };

    const toggleItemSelection = (itemId, itemCard) => {
        const indicator = itemCard.querySelector('.selection-indicator');

        if (selectedItemIds.has(itemId)) {
            selectedItemIds.delete(itemId);
            itemCard.classList.remove('selected');
            if (indicator) {
                indicator.remove();
            }
        } else {
            selectedItemIds.add(itemId);
            itemCard.classList.add('selected');
            if (!indicator) {
                const newIndicator = document.createElement('div');
                newIndicator.className = 'selection-indicator';
                newIndicator.innerHTML = `<i class="fas fa-check-circle"></i>`;
                itemCard.appendChild(newIndicator);
            }
        }
        updateBulkActionsBar();
    };

    const updateBulkActionsBar = () => {
        const count = selectedItemIds.size;
        if (count > 0) {
            selectionCount.textContent = `${count} item${count > 1 ? 's' : ''} selected`;
            bulkActionsBar.classList.add('visible');
        } else {
            bulkActionsBar.classList.remove('visible');
        }
    };
    
    const handleBulkAction = (action) => {
        if (selectedItemIds.size === 0) {
            showToast('Please select items first.', 'info');
            return;
        }

        const selectedItems = Array.from(selectedItemIds);
        let updatedCount = 0;

        if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete ${selectedItems.length} items? This cannot be undone.`)) {
                return;
            }
            items = items.filter(item => !selectedItemIds.has(item.id));
            updatedCount = selectedItems.length;
            addActivity('delete-bulk', `${updatedCount} items`);

        } else { // Handle status change
            items.forEach(item => {
                if (selectedItemIds.has(item.id)) {
                    if(item.status !== action) {
                        item.status = action;
                        addActivity('edit-bulk', `Moved "${item.title}" to ${action.replace('-', ' ')}`);
                        updatedCount++;
                    }
                }
            });
        }
        
        if (updatedCount > 0) {
            saveAndRerender();
            if (action === 'delete') {
                showToast(`${updatedCount} items permanently deleted.`, 'success');
            } else {
                showToast(`${updatedCount} items moved to "${action.replace('-', ' ')}".`, 'success');
            }
        }

        exitSelectMode(true);
    };

    // Bulk Actions Event Listeners
    if(selectModeBtn) {
        selectModeBtn.addEventListener('click', toggleSelectMode);
    }
    if(cancelSelectModeBtn) {
        cancelSelectModeBtn.addEventListener('click', toggleSelectMode);
    }
    if(bulkActionsButtons) {
        bulkActionsButtons.addEventListener('click', (e) => {
            const button = e.target.closest('.bulk-action-btn');
            if (button) {
                handleBulkAction(button.dataset.action);
            }
        });
    }

    // --- Data Import/Export ---
    const exportData = () => {
        const dataToExport = {
            watchlistItems: items,
            activityLog: activityLog
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = `my-watchlist-backup-${new Date().toISOString().slice(0,10)}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        addActivity('export', 'Data exported', 'System');
        showToast('Data exported successfully!', 'success');
    };

    const importData = () => {
        const file = importFile.files[0];
        if (!file) {
            showToast('Please select a file to import.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dataToImport = JSON.parse(event.target.result);
                
                if (dataToImport.items && Array.isArray(dataToImport.items)) {
                    items = dataToImport.items;
                } else if (Array.isArray(dataToImport)) { // For backwards compatibility with old format
                    items = dataToImport;
                } else {
                    throw new Error("Invalid file format.");
                }

                if (dataToImport.activityLog && Array.isArray(dataToImport.activityLog)) {
                    activityLog = dataToImport.activityLog;
                }

                if (dataToImport.goals) {
                    goals = dataToImport.goals;
                }
                if (dataToImport.goalsProgress) {
                    goalsProgress = dataToImport.goalsProgress;
                }

                saveItems();
                saveActivityLog();
                localStorage.setItem('goals', JSON.stringify(goals));
                localStorage.setItem('goalsProgress', JSON.stringify(goalsProgress));

                showToast('Watchlist imported successfully!', 'success');
                exitSelectMode(true); // Exit select mode if active
                renderItems();
                updateDashboard();
            } catch (error) {
                showToast(`Error importing file: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    };

    // Settings Event Listeners
    if(openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
    }
    if(closeSettingsModal) {
        closeSettingsModal.addEventListener('click', closeModal);
    }
    if(exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    if(importBtn) {
        importBtn.addEventListener('click', importData);
    }

    // Trailer Modal Event Listeners
    if(closeTrailerModal) {
        closeTrailerModal.addEventListener('click', () => {
            trailerModal.style.display = 'none';
            trailerIframe.src = ''; // Video'yu durdur
        });
    }

    // Delete All Data Logic
    if(deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            // Hide settings modal, show confirmation modal
            settingsModal.style.display = 'none';
            confirmDeleteAllModal.style.display = 'block';
        });
    }

    if(cancelDeleteAllBtn) {
        cancelDeleteAllBtn.addEventListener('click', () => {
            confirmDeleteAllModal.style.display = 'none';
        });
    }

    if(confirmDeleteAllFinalBtn) {
        confirmDeleteAllFinalBtn.addEventListener('click', () => {
            items = [];
            activityLog = [];
            selectedItemIds.clear();
            
            // Reset goals to default
            goals = loadGoals(); 
            goalsProgress = loadGoalsProgress();
            
            saveAndRerender();
            
            localStorage.removeItem('goals');
            localStorage.removeItem('goalsProgress');

            closeModal(confirmDeleteAllModal);
            closeModal(settingsModal);
            exitSelectMode(true);
            showToast('All data has been permanently deleted.', 'success');
        });
    }

    // --- Olay Dinleyicileri (Event Listeners) ---

    const setupEventListeners = () => {
        // Arama
        itemTitle.addEventListener('keyup', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(handleApiSearch, 300);
        });
        searchBtn.addEventListener('click', () => {
            currentStatusFilter = 'all';
            currentTypeFilter = 'all';
            renderItems();
        });

        // Navigasyon ve Filtreleme
        navTabs.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelector('.nav-tab.active').classList.remove('active');
                e.target.classList.add('active');
                currentStatusFilter = e.target.dataset.category;
                renderItems();
            }
        });

        categoryBtns.addEventListener('click', (e => {
            const button = e.target.closest('.category-btn');
            if (button) {
                document.querySelector('.category-btn.active').classList.remove('active');
                button.classList.add('active');
                currentTypeFilter = button.dataset.type;
                renderItems();
            }
        }));
        
        // Gelişmiş Filtreler
        sortSelect.addEventListener('change', (e) => { currentSortBy = e.target.value; renderItems(); });
        ratingFilter.addEventListener('change', (e) => { currentMinRating = parseInt(e.target.value, 10); renderItems(); });
        yearFilter.addEventListener('change', (e) => { currentYear = e.target.value; renderItems(); });
        clearFiltersBtn.addEventListener('click', () => {
            sortSelect.value = 'date-added';
            ratingFilter.value = '0';
            yearFilter.value = '';
            searchInput.value = '';
            currentSortBy = 'date-added';
            currentMinRating = 0;
            currentYear = '';
            renderItems();

            // Mobilse ve filtreler açıksa, temizledikten sonra kapat
            if (window.innerWidth <= 768 && advancedFilters.classList.contains('is-open')) {
                advancedFilters.classList.remove('is-open');
            }
        });
        
        // Mobil Filtre Butonu
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                advancedFilters.classList.toggle('is-open');
            });
        }

        // Modallar
        addItemBtn.addEventListener('click', () => openAddModal());
        closeModalBtn.addEventListener('click', closeModal);
        closeDetailModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        deleteBtn.addEventListener('click', () => {
            if (!currentlyEditingId) return;

            const itemToDelete = items.find(i => i.id === currentlyEditingId);
            if (!itemToDelete) return;

            addActivity('delete', itemToDelete.title, itemToDelete.type);
            items = items.filter(item => item.id !== currentlyEditingId);
            
            saveItems();
            closeModal();
            renderItems();
            updateDashboard();
            showToast('Item deleted successfully.', 'success');
        });
        editBtn.addEventListener('click', () => {
            const item = items.find(i => i.id === currentlyEditingId);
            closeModal();
            openAddModal(item);
        });

        // Hedef Sistemi Event Listeners
        if (editGoalsBtn) {
            editGoalsBtn.addEventListener('click', openGoalsModal);
        }
        if (closeGoalsModal) {
            closeGoalsModal.addEventListener('click', closeGoalsModalFunc);
        }
        if (cancelGoalsBtn) {
            cancelGoalsBtn.addEventListener('click', closeGoalsModalFunc);
        }
        if (goalsForm) {
            goalsForm.addEventListener('submit', saveGoals);
        }
    };

    // --- Başlangıç ---
    initializeTheme();
    populateYearFilter();
    renderItems();
    updateDashboard();
    setupEventListeners();
}); 