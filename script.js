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
    
    // Dashboard Elements
    const openStatsBtn = document.getElementById('openStatsBtn');
    const statsModal = document.getElementById('statsModal');
    const closeStatsModal = document.getElementById('closeStatsModal');
    const totalItemsModal = document.getElementById('totalItemsModal');
    const completedItemsModal = document.getElementById('completedItemsModal');
    const watchingItemsModal = document.getElementById('watchingItemsModal');
    const avgRatingModal = document.getElementById('avgRatingModal');
    const recentActivityListModal = document.getElementById('recentActivityListModal');
    
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

    // Yeni Öğe Formu
    const addItemForm = document.getElementById('addItemForm');
    const itemTitle = document.getElementById('itemTitle');
    const itemType = document.getElementById('itemType');
    const itemStatus = document.getElementById('itemStatus');
    const itemProgress = document.getElementById('itemProgress');
    const itemTotal = document.getElementById('itemTotal');
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

    // Dashboard state
    let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];

    // --- API Ayarları ---
    // ÖNEMLİ: Bu anahtarı kendi TMDB API anahtarınızla değiştirin.
    const TMDB_API_KEY = 'd699b8b51274da65ee8af102a4825c61'; 
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

    // --- Fonksiyonlar ---

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

    // Dashboard Functions
    const updateDashboard = () => {
        const total = items.length;
        const completed = items.filter(item => item.status === 'completed').length;
        const watching = items.filter(item => item.status === 'watching').length;
        
        const avgRatingValue = total > 0 ? (items.reduce((sum, item) => sum + (item.rating || 0), 0) / items.filter(i => i.rating > 0).length || 0).toFixed(1) : '0.0';
        
        totalItemsModal.textContent = total;
        completedItemsModal.textContent = completed;
        watchingItemsModal.textContent = watching;
        avgRatingModal.textContent = avgRatingValue;
        
        updateRecentActivity();
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

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // İçerik kartlarını render etme
    const renderItems = () => {
        contentGrid.innerHTML = '';
        
        let filteredItems = items.filter(item => {
            const statusMatch = currentStatusFilter === 'all' || item.status === currentStatusFilter;
            const typeMatch = currentTypeFilter === 'all' || item.type === currentTypeFilter;
            const searchMatch = searchInput.value === '' || item.title.toLowerCase().includes(searchInput.value.toLowerCase());
            const ratingMatch = item.rating >= currentMinRating;
            const yearMatch = currentYear === '' || (item.year && item.year.toString() === currentYear);
            
            return statusMatch && typeMatch && searchMatch && ratingMatch && yearMatch;
        });

        // Sorting
        filteredItems.sort((a, b) => {
            switch (currentSortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'rating':
                    return b.rating - a.rating;
                case 'rating-low':
                    return a.rating - b.rating;
                case 'progress':
                    const aProgress = (a.progress / a.total) || 0;
                    const bProgress = (b.progress / b.total) || 0;
                    return bProgress - aProgress;
                case 'date-added':
                default:
                    return b.id - a.id;
            }
        });

        if (filteredItems.length === 0) {
            contentGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">No items found. Try changing your filters or adding a new item!</p>';
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
                ? `<img src="${item.posterUrl}" alt="${item.title}">`
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
                if(isSelectMode) {
                    toggleItemSelection(item.id, itemCard);
                } else {
                    openDetailModal(item.id);
                }
            });
            contentGrid.appendChild(itemCard);
        });
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
            itemRating.value = item.rating;
            itemNotes.value = item.notes;
            itemTrailer.value = item.trailerUrl || '';
        } else {
            addItemModalTitle.textContent = 'Add New Item';
            addItemForm.querySelector('button[type="submit"]').textContent = 'Add Item';
            currentlyEditingId = null;
        }
        addItemModal.style.display = 'block';
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
            items.push(newItemData);
            addActivity('add', newItemData.title, newItemData.type);

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

    const handleApiSearch = async () => {
        const query = itemTitle.value;
        const type = itemType.value;

        if (query.length < 3) {
            clearApiResults();
            return;
        }

        let results = [];
        try {
            switch (type) {
                case 'movie':
                case 'series':
                    const tmdbType = type === 'movie' ? 'movie' : 'tv';
                    const tmdbRes = await fetch(`${TMDB_BASE_URL}/search/${tmdbType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
                    const tmdbData = await tmdbRes.json();
                    results = tmdbData.results.map(item => ({
                        title: item.title || item.name,
                        year: (item.release_date || item.first_air_date)?.split('-')[0] || 'N/A',
                        poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
                        total: item.episode_count || (type === 'movie' ? 1 : undefined)
                    }));
                    break;
                
                case 'anime':
                case 'manga':
                case 'manhwa':
                    const searchType = (type === 'manhwa') ? 'manga' : type;
                    const jikanRes = await fetch(`${JIKAN_BASE_URL}/${searchType}?q=${encodeURIComponent(query)}&limit=10`);
                    const jikanData = await jikanRes.json();
                    results = jikanData.data.map(item => ({
                        title: item.title,
                        year: item.year || 'N/A',
                        poster: item.images?.jpg?.image_url || '',
                        total: item.episodes || item.chapters
                    }));
                    break;
            }
        } catch (error) {
            console.error('API search failed:', error);
            clearApiResults();
        }

        displayApiResults(results);
    };
    
    const displayApiResults = (results) => {
        clearApiResults();
        if (!results || results.length === 0) return;

        results.slice(0, 10).forEach(result => {
            const resultEl = document.createElement('div');
            resultEl.className = 'api-result-item';
            resultEl.innerHTML = `
                <img src="${result.poster || 'https://via.placeholder.com/40x60?text=?'}" alt="Poster">
                <div class="api-result-info">
                    <h4>${result.title}</h4>
                    <p>${result.year}</p>
                </div>
            `;
            resultEl.addEventListener('click', () => {
                itemTitle.value = result.title;
                if(result.total) itemTotal.value = result.total;
                if (result.poster) {
                    addItemForm.dataset.posterUrl = result.poster;
                }
                clearApiResults();
            });
            apiSearchResults.appendChild(resultEl);
        });
    };

    itemTitle.addEventListener('input', () => {
        const type = itemType.value;
        if (type === 'book') {
            clearApiResults();
            return;
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleApiSearch, 300);
    });

    itemType.addEventListener('change', () => {
        itemTitle.value = '';
        clearApiResults();
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
        if (itemToDelete && confirm(`Are you sure you want to delete "${itemToDelete.title}"?`)) {
            addActivity('delete', itemToDelete.title, itemToDelete.type);
            items = items.filter(item => item.id !== currentlyEditingId);
            saveItems();
            closeModal();
            renderItems();
        }
    });

    editBtn.addEventListener('click', () => {
        const item = items.find(i => i.id === currentlyEditingId);
        closeModal();
        openAddModal(item);
    });

    // Pencere dışına tıklayınca modalı kapatma
    window.addEventListener('click', e => {
        if (e.target === addItemModal || e.target === itemDetailModal || e.target === statsModal || e.target === settingsModal || e.target === trailerModal) {
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
            updateDashboard();
            statsModal.style.display = 'block';
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
        if (selectedItemIds.has(itemId)) {
            selectedItemIds.delete(itemId);
            itemCard.classList.remove('selected');
        } else {
            selectedItemIds.add(itemId);
            itemCard.classList.add('selected');
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
        const selectedIds = Array.from(selectedItemIds);
        if (selectedIds.length === 0) return;

        if (action === 'delete') {
            if (confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
                items = items.filter(item => !selectedIds.includes(item.id));
                addActivity('delete', `${selectedIds.length} items`, 'Bulk Action');
                saveItems();
                toggleSelectMode();
                renderItems();
            }
        } else {
            // It's a status update
            items = items.map(item => {
                if (selectedIds.includes(item.id)) {
                    // When completing, also update progress
                    if (action === 'completed' && item.total) {
                        return { ...item, status: action, progress: item.total };
                    }
                    return { ...item, status: action };
                }
                return item;
            });
            addActivity('edit', `${selectedIds.length} items`, `Status changed to ${action}`);
            saveItems();
            toggleSelectMode(); 
            renderItems();
        }
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
    };

    const importData = () => {
        const file = importFile.files[0];
        if (!file) {
            alert('Please select a file to import.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Basic validation
                if (importedData && Array.isArray(importedData.watchlistItems)) {
                    if (confirm('Are you sure you want to import this file? This will overwrite your current data.')) {
                        items = importedData.watchlistItems;
                        activityLog = importedData.activityLog || [];
                        
                        saveItems();
                        localStorage.setItem('activityLog', JSON.stringify(activityLog));
                        
                        renderItems();
                        updateDashboard();
                        
                        alert('Data imported successfully!');
                        closeModal();
                    }
                } else {
                    alert('Invalid file format. The file does not seem to be a valid watchlist backup.');
                }
            } catch (error) {
                alert('An error occurred while reading the file. Make sure it is a valid JSON file.');
                console.error('Import error:', error);
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

    // --- Başlangıç ---
    initializeTheme();
    renderItems();
    updateDashboard(); // Initialize dashboard
}); 