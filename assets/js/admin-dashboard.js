// Admin Dashboard JavaScript - Fixed Version
class PropamitAdmin {
    constructor() {
        this.mongoConnection = 'mongodb+srv://darlingtonodom:Coldwizkid@clusterd.bytfl.mongodb.net/propamit?retryWrites=true&w=majority';
        this.apiBaseUrl = 'https://propamit-backend.vercel.app';
        this.currentSection = 'dashboard';
        this.users = [];
        this.applications = [];
        this.messages = [];
        
        this.init();
    }
    
    async init() {
        console.log('Initializing Propamit Admin Dashboard...');
        
        // Check admin authentication
        if (!this.isAdminAuthenticated()) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        this.debugElements();
        this.setupEventListeners();
        this.setupNavigation();
        await this.loadDashboardData();
    }
    
    isAdminAuthenticated() {
        return localStorage.getItem('adminToken') !== null;
    }
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation with proper event handling
        const navItems = document.querySelectorAll('.nav-item');
        console.log('Found nav items:', navItems.length);
        
        navItems.forEach((item, index) => {
            console.log(`Setting up nav item ${index}:`, item.dataset.section);
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const section = item.dataset.section;
                console.log('Nav item clicked:', section);
                
                if (section) {
                    this.switchSection(section);
                }
                
                // Close mobile sidebar after navigation
                if (window.innerWidth <= 1024) {
                    this.closeMobileSidebar();
                }
            });
        });
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar') || document.querySelector('.admin-sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        console.log('Sidebar elements:', { sidebarToggle, sidebar, mobileOverlay });
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Sidebar toggle clicked');
                
                const isActive = sidebar.classList.contains('active');
                
                if (isActive) {
                    sidebar.classList.remove('active');
                    if (mobileOverlay) mobileOverlay.classList.remove('active');
                    console.log('Sidebar closed');
                } else {
                    sidebar.classList.add('active');
                    if (mobileOverlay) mobileOverlay.classList.add('active');
                    console.log('Sidebar opened');
                }
            });
        }
        
        // Close sidebar when clicking overlay
        if (mobileOverlay && sidebar) {
            mobileOverlay.addEventListener('click', () => {
                console.log('Overlay clicked - closing sidebar');
                this.closeMobileSidebar();
            });
        }
        // Logout functionality - Multiple selectors
        const logoutSelectors = [
            '#adminLogout',
            '#logoutBtn', 
            '#headerLogoutBtn',
            '.admin-logout-btn'
        ];
        
        logoutSelectors.forEach(selector => {
            const logoutBtn = document.querySelector(selector);
            if (logoutBtn) {
                console.log('Setting up logout for:', selector);
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Logout clicked');
                    this.logout();
                });
            }
        });
        
        // Refresh buttons
        const refreshButtons = [
            { id: 'refreshUsers', action: () => this.loadUsers() },
            { id: 'refreshApplications', action: () => this.loadApplications() },
            { id: 'refreshMessages', action: () => this.loadMessages() }
        ];
        
        refreshButtons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log('Setting up refresh button:', id);
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    action();
                });
            }
        });
        
        // Search functionality
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterApplications(e.target.value);
            });
        }

        // Reset Database Button
        const resetDatabaseBtn = document.getElementById('resetDatabaseBtn');
        if (resetDatabaseBtn) {
            resetDatabaseBtn.addEventListener('click', () => {
                this.handleResetDatabase();
            });
        }
        
        console.log('Event listeners setup complete');
    }
    // Debug elements method
    debugElements() {
        console.log('=== DEBUG INFO ===');
        console.log('Nav items:', document.querySelectorAll('.nav-item').length);
        console.log('Sections:', document.querySelectorAll('.admin-section').length);
        console.log('Sidebar toggle:', document.getElementById('sidebarToggle'));
        console.log('Logout buttons:', document.querySelectorAll('#adminLogout, .admin-logout-btn').length);
        console.log('Window width:', window.innerWidth);
        console.log('==================');
    }
    
    // Reset Database with better error handling
    async handleResetDatabase() {
        // Show user-friendly message about CORS issue
        const userChoice = confirm(
            '⚠️ DATABASE RESET\n\n' +
            'Due to CORS configuration issues, the reset function is temporarily unavailable.\n\n' +
            'Options:\n' +
            '1. Click OK to try anyway (may fail)\n' +
            '2. Click Cancel to reset via MongoDB directly\n\n' +
            'Would you like to try the reset anyway?'
        );

        if (!userChoice) {
            this.showNotification(
                'Please reset the database directly through MongoDB Atlas:\n' +
                '1. Go to MongoDB Atlas\n' +
                '2. Browse Collections\n' +
                '3. Delete the collections: users, applications, messages, documents',
                'info'
            );
            return;
        }

        // Double confirmation for actual reset
        if (!confirm('⚠️ WARNING: This will delete ALL user data except admin account!\n\nAre you sure?')) {
            return;
        }

        const confirmation = prompt('Type "RESET" to confirm:');
        if (confirmation !== 'RESET') {
            this.showNotification('Database reset cancelled', 'info');
            return;
        }

        const resetBtn = document.getElementById('resetDatabaseBtn');
        if (!resetBtn) return;
        
        try {
            // Show loading
            this.showLoading();
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
            
            console.log('Attempting to reset database...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/reset-database`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();

            if (data.success) {
                this.showNotification('Database reset successfully! All user data has been cleared.', 'success');
                
                // Refresh all data after reset
                setTimeout(async () => {
                    await this.loadDashboardData();
                    this.loadUsers();
                    this.loadApplications();
                    this.loadMessages();
                }, 1500);
                
            } else {
                throw new Error(data.message || 'Failed to reset database');
            }

        } catch (error) {
            console.error('Reset database error:', error);
            
            // Better error messages
            if (error.message.includes('CORS') || error.message === 'Failed to fetch') {
                this.showNotification(
                    'CORS Error: Please reset database manually through MongoDB Atlas. ' +
                    'Go to your MongoDB dashboard and delete the collections.',
                    'error'
                );
            } else {
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        } finally {
            // Reset button state
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<i class="fas fa-trash"></i> Reset Database';
            this.hideLoading();
        }
    }
    // Mobile sidebar closing
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar') || document.querySelector('.admin-sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
            console.log('Sidebar closed');
        }
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
        }
    }
    
    setupNavigation() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'dashboard';
            this.switchSection(section, false);
        });
        
        // Set initial state
        history.replaceState({ section: 'dashboard' }, '', '#dashboard');
    }
    
    switchSection(section, updateHistory = true) {
        console.log('Switching to section:', section);
        
        // Remove active class from all nav items and sections
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        // Add active class to current nav item and section
        const navItem = document.querySelector(`[data-section="${section}"]`);
        const sectionElement = document.getElementById(`${section}-section`);
        
        console.log('Found elements:', { navItem, sectionElement });
        
        if (navItem) {
            navItem.classList.add('active');
            console.log('Nav item activated');
        }
        
        if (sectionElement) {
            sectionElement.classList.add('active');
            console.log('Section activated');
        } else {
            console.error('Section element not found:', `${section}-section`);
        }
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && navItem) {
            const titleText = navItem.querySelector('span')?.textContent || section;
            pageTitle.textContent = titleText;
            console.log('Page title updated:', titleText);
        }
        
        // Update browser history
        if (updateHistory) {
            history.pushState({ section }, '', `#${section}`);
        }
        
        this.currentSection = section;
        
        // Load section-specific data
        this.loadSectionData(section);
    }
    
    loadSectionData(section) {
        switch(section) {
            case 'users':
                this.loadUsers();
                break;
            case 'applications':
                this.loadApplications();
                break;
            case 'messages':
                this.loadMessages();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
        }
    }
    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Load stats from real API
            await this.loadStats();
            
            // Load recent activity from real API
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Load real stats from API
    async loadStats() {
        try {
            console.log('Loading real stats from API...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                // If API fails, show zeros instead of error
                const emptyStats = {
                    totalUsers: 0,
                    totalApplications: 0,
                    pendingApplications: 0,
                    totalMessages: 0
                };
                this.updateStatsDisplay(emptyStats);
                return;
            }
            
            const data = await response.json();
            const stats = data.stats || data;
            console.log('Real stats loaded:', stats);
            
            this.updateStatsDisplay(stats);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            // Show zeros instead of error
            const emptyStats = {
                totalUsers: 0,
                totalApplications: 0,
                pendingApplications: 0,
                totalMessages: 0
            };
            this.updateStatsDisplay(emptyStats);
        }
    }
    
    updateStatsDisplay(stats) {
        // Animate numbers with error handling
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.animateNumber(key, stats[key]);
            }
        });
        
        // Update messages badge
        const messagesBadge = document.getElementById('messagesBadge');
        if (messagesBadge && stats.totalMessages) {
            messagesBadge.textContent = stats.totalMessages;
        }
    }
    
    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    async loadRecentActivity() {
        try {
            console.log('Loading recent activity from API...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/recent-activity`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                // If API fails, show empty state instead of error
                this.displayRecentActivity([]);
                return;
            }
            
            const data = await response.json();
            const activities = data.activities || [];
            
            this.displayRecentActivity(activities);
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            // Show empty state instead of error message
            this.displayRecentActivity([]);
        }
    }
    
    displayRecentActivity(activities) {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No Recent Activity</h3>
                    <p>No recent activity to display.</p>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Load users with real data only
    async loadUsers() {
        const usersList = document.getElementById('usersList');
        const usersLoading = document.getElementById('usersLoading');
        const usersTableBody = document.getElementById('usersTableBody');
        
        if (!usersList && !usersTableBody) return;
        
        try {
            if (usersLoading) usersLoading.style.display = 'block';
            if (usersList) usersList.style.display = 'none';
            if (usersTableBody) usersTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
            
            console.log('Loading users from API...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                // If API fails, show empty state
                this.users = [];
                this.displayUsers([]);
                return;
            }
            
            const data = await response.json();
            const users = data.users || [];
            
            this.users = users;
            this.displayUsers(users);
            
        } catch (error) {
            console.error('Error loading users:', error);
            // Show empty state instead of error
            this.users = [];
            this.displayUsers([]);
        } finally {
            if (usersLoading) usersLoading.style.display = 'none';
            if (usersList) usersList.style.display = 'block';
        }
    }
    displayUsers(users) {
        const usersList = document.getElementById('usersList');
        const usersTableBody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            const emptyState = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Users Found</h3>
                    <p>No users have registered yet.</p>
                </div>
            `;
            
            if (usersList) {
                usersList.innerHTML = emptyState;
            }
            if (usersTableBody) {
                usersTableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
            }
            return;
        }
        
        // Display as cards if usersList exists
        if (usersList) {
            usersList.innerHTML = users.map(user => `
                <div class="user-card" data-user-id="${user._id}">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p class="user-email">${user.email}</p>
                        <p class="user-phone">${user.phone || 'No phone'}</p>
                        <span class="user-date">Joined: ${new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="user-stats">
                        <span class="stat-item">
                            <i class="fas fa-file-alt"></i>
                            ${user.applications || 0} apps
                        </span>
                        <span class="status-badge status-${user.status || 'active'}">${user.status || 'active'}</span>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewUser('${user._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteUser('${user._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Display as table if usersTableBody exists
        if (usersTableBody) {
            usersTableBody.innerHTML = users.map(user => `
                <tr data-user-id="${user._id}">
                    <td>
                        <div class="user-info">
                            <i class="fas fa-user-circle user-avatar-small"></i>
                            <span>${user.name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${user.status || 'active'}">${user.status || 'active'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewUser('${user._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteUser('${user._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
    // Load applications with real data only
    async loadApplications() {
        const applicationsList = document.getElementById('applicationsList');
        const applicationsLoading = document.getElementById('applicationsLoading');
        const applicationsTableBody = document.getElementById('applicationsTableBody');
        
        if (!applicationsList && !applicationsTableBody) return;
        
        try {
            if (applicationsLoading) applicationsLoading.style.display = 'block';
            if (applicationsList) applicationsList.style.display = 'none';
            if (applicationsTableBody) applicationsTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
            
            console.log('Loading applications from API...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/applications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                // If API fails, show empty state
                this.applications = [];
                this.displayApplications([]);
                return;
            }
            
            const data = await response.json();
            const applications = data.applications || [];
            
            this.applications = applications;
            this.displayApplications(applications);
            
        } catch (error) {
            console.error('Error loading applications:', error);
            // Show empty state instead of error
            this.applications = [];
            this.displayApplications([]);
        } finally {
            if (applicationsLoading) applicationsLoading.style.display = 'none';
            if (applicationsList) applicationsList.style.display = 'block';
        }
    }
    
    displayApplications(applications) {
        const applicationsList = document.getElementById('applicationsList');
        const applicationsTableBody = document.getElementById('applicationsTableBody');
        
        if (applications.length === 0) {
            const emptyState = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Applications Found</h3>
                    <p>No applications have been submitted yet.</p>
                </div>
            `;
            
            if (applicationsList) {
                applicationsList.innerHTML = emptyState;
            }
            if (applicationsTableBody) {
                applicationsTableBody.innerHTML = '<tr><td colspan="6">No applications found</td></tr>';
            }
            return;
        }
        
        // Display as cards if applicationsList exists
        if (applicationsList) {
            applicationsList.innerHTML = applications.map(app => `
                <div class="application-card" data-app-id="${app._id}">
                    <div class="application-header">
                        <div class="app-id">#${app._id}</div>
                        <span class="status-badge status-${app.status}">${app.status}</span>
                    </div>
                    <div class="application-content">
                        <h4>${app.type}</h4>
                        <p class="applicant-info">
                            <i class="fas fa-user"></i> ${app.applicantName}
                            <br>
                            <i class="fas fa-envelope"></i> ${app.applicantEmail}
                        </p>
                        ${app.vehicleInfo ? `
                            <p class="vehicle-info">
                                <i class="fas fa-car"></i> ${app.vehicleInfo.make} ${app.vehicleInfo.model} (${app.vehicleInfo.year})
                            </p>
                        ` : ''}
                        <p class="submission-date">
                            <i class="fas fa-calendar"></i> Submitted: ${new Date(app.submittedAt).toLocaleDateString()}
                        </p>
                        ${app.rejectionReason ? `
                            <p class="rejection-reason">
                                <i class="fas fa-exclamation-triangle"></i> ${app.rejectionReason}
                            </p>
                        ` : ''}
                    </div>
                    <div class="application-actions">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewApplication('${app._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${app.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="adminDashboard.approveApplication('${app._id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminDashboard.rejectApplication('${app._id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        // Display as table if applicationsTableBody exists
        if (applicationsTableBody) {
            applicationsTableBody.innerHTML = applications.map(app => `
                <tr data-app-id="${app._id}">
                    <td>#${app._id}</td>
                    <td>
                        <div class="user-info">
                            <span>${app.applicantName}</span>
                            <small>${app.applicantEmail}</small>
                        </div>
                    </td>
                    <td>${app.type}</td>
                    <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                    <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewApplication('${app._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${app.status === 'pending' ? `
                                <button class="btn btn-sm btn-success" onclick="adminDashboard.approveApplication('${app._id}')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="adminDashboard.rejectApplication('${app._id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
    // Load messages with real data only
    async loadMessages() {
        const messagesList = document.getElementById('messagesList');
        const messagesLoading = document.getElementById('messagesLoading');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!messagesList && !messagesContainer) return;
        
        try {
            if (messagesLoading) messagesLoading.style.display = 'block';
            if (messagesList) messagesList.style.display = 'none';
            if (messagesContainer) messagesContainer.innerHTML = '<div class="loading-message">Loading messages...</div>';
            
            console.log('Loading messages from API...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                // If API fails, show empty state
                this.messages = [];
                this.displayMessages([]);
                return;
            }
            
            const data = await response.json();
            const messages = data.messages || [];
            
            this.messages = messages;
            this.displayMessages(messages);
            
        } catch (error) {
            console.error('Error loading messages:', error);
            // Show empty state instead of error
            this.messages = [];
            this.displayMessages([]);
        } finally {
            if (messagesLoading) messagesLoading.style.display = 'none';
            if (messagesList) messagesList.style.display = 'block';
        }
    }
    
    displayMessages(messages) {
        const messagesList = document.getElementById('messagesList');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (messages.length === 0) {
            const emptyState = `
                <div class="empty-state">
                    <i class="fas fa-envelope"></i>
                    <h3>No Messages Found</h3>
                    <p>No messages have been received yet.</p>
                </div>
            `;
            
            if (messagesList) {
                messagesList.innerHTML = emptyState;
            }
            if (messagesContainer) {
                messagesContainer.innerHTML = emptyState;
            }
            return;
        }
        
        const messagesHTML = messages.map(msg => `
            <div class="message-card ${msg.status}" data-msg-id="${msg._id}">
                <div class="message-header">
                    <div class="message-info">
                        <h4>${msg.subject}</h4>
                        <p class="sender-info">
                            <i class="fas fa-user"></i> ${msg.name}
                            <span class="email">(${msg.email})</span>
                        </p>
                    </div>
                    <div class="message-meta">
                        <span class="message-date">${new Date(msg.createdAt).toLocaleDateString()}</span>
                        <span class="status-badge status-${msg.status}">${msg.status}</span>
                    </div>
                </div>
                <div class="message-content">
                    <p>${msg.message}</p>
                </div>
                <div class="message-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.viewMessage('${msg._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-success" onclick="adminDashboard.replyMessage('${msg._id}')">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteMessage('${msg._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        if (messagesList) {
            messagesList.innerHTML = messagesHTML;
        }
        if (messagesContainer) {
            messagesContainer.innerHTML = messagesHTML;
        }
    }
    // Action methods
    async viewUser(userId) {
        const user = this.users.find(u => u._id === userId);
        if (!user) {
            this.showNotification('User not found', 'error');
            return;
        }
        
        // Create and show user details modal
        this.showUserModal(user);
    }
    
    showUserModal(user) {
        const modalHTML = `
            <div class="modal-overlay" id="userModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>User Details</h3>
                        <button class="modal-close" onclick="adminDashboard.closeModal('userModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="user-details">
                            <div class="detail-row">
                                <label>Name:</label>
                                <span>${user.name}</span>
                            </div>
                            <div class="detail-row">
                                <label>Email:</label>
                                <span>${user.email}</span>
                            </div>
                            <div class="detail-row">
                                <label>Phone:</label>
                                <span>${user.phone || 'Not provided'}</span>
                            </div>
                            <div class="detail-row">
                                <label>Status:</label>
                                <span class="status-badge status-${user.status || 'active'}">${user.status || 'active'}</span>
                            </div>
                            <div class="detail-row">
                                <label>Joined:</label>
                                <span>${new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <label>Applications:</label>
                                <span>${user.applications || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="adminDashboard.closeModal('userModal')">Close</button>
                        <button class="btn btn-danger" onclick="adminDashboard.deleteUser('${user._id}')">Delete User</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.showNotification('User deleted successfully', 'success');
            this.loadUsers();
            this.closeModal('userModal');
            
        } catch (error) {
            console.error('Delete user error:', error);
            this.showNotification('Error deleting user', 'error');
        } finally {
            this.hideLoading();
        }
    }
    async viewApplication(appId) {
        const application = this.applications.find(app => app._id === appId);
        if (!application) {
            this.showNotification('Application not found', 'error');
            return;
        }
        
        this.showApplicationModal(application);
    }
    
    showApplicationModal(application) {
        const modalHTML = `
            <div class="modal-overlay" id="applicationModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Application Details - #${application._id}</h3>
                        <button class="modal-close" onclick="adminDashboard.closeModal('applicationModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="application-details">
                            <div class="detail-section">
                                <h4>Application Information</h4>
                                <div class="detail-row">
                                    <label>Type:</label>
                                    <span>${application.type}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Status:</label>
                                    <span class="status-badge status-${application.status}">${application.status}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Submitted:</label>
                                    <span>${new Date(application.submittedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Applicant Information</h4>
                                <div class="detail-row">
                                    <label>Name:</label>
                                    <span>${application.applicantName}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Email:</label>
                                    <span>${application.applicantEmail}</span>
                                </div>
                            </div>
                            
                            ${application.vehicleInfo ? `
                                <div class="detail-section">
                                    <h4>Vehicle Information</h4>
                                    <div class="detail-row">
                                        <label>Make:</label>
                                        <span>${application.vehicleInfo.make}</span>
                                    </div>
                                    <div class="detail-row">
                                        <label>Model:</label>
                                        <span>${application.vehicleInfo.model}</span>
                                    </div>
                                    <div class="detail-row">
                                        <label>Year:</label>
                                        <span>${application.vehicleInfo.year}</span>
                                    </div>
                                    <div class="detail-row">
                                        <label>VIN:</label>
                                        <span>${application.vehicleInfo.vin}</span>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${application.rejectionReason ? `
                                <div class="detail-section">
                                    <h4>Rejection Reason</h4>
                                    <p class="rejection-reason">${application.rejectionReason}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="adminDashboard.closeModal('applicationModal')">Close</button>
                        ${application.status === 'pending' ? `
                            <button class="btn btn-success" onclick="adminDashboard.approveApplication('${application._id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger" onclick="adminDashboard.rejectApplication('${application._id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    async approveApplication(appId) {
        if (!confirm('Are you sure you want to approve this application?')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/applications/${appId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.showNotification('Application approved successfully', 'success');
            this.loadApplications();
            this.closeModal('applicationModal');
            
        } catch (error) {
            console.error('Approve application error:', error);
            this.showNotification('Error approving application', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async rejectApplication(appId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/applications/${appId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.showNotification('Application rejected successfully', 'success');
            this.loadApplications();
            this.closeModal('applicationModal');
            
        } catch (error) {
            console.error('Reject application error:', error);
            this.showNotification('Error rejecting application', 'error');
        } finally {
            this.hideLoading();
        }
    }
    async viewMessage(msgId) {
        const message = this.messages.find(msg => msg._id === msgId);
        if (!message) {
            this.showNotification('Message not found', 'error');
            return;
        }
        
        this.showMessageModal(message);
        
        // Mark as read if unread
        if (message.status === 'unread') {
            this.markMessageAsRead(msgId);
        }
    }
    
    showMessageModal(message) {
        const modalHTML = `
            <div class="modal-overlay" id="messageModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Message Details</h3>
                        <button class="modal-close" onclick="adminDashboard.closeModal('messageModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="message-details">
                            <div class="detail-section">
                                <h4>Message Information</h4>
                                <div class="detail-row">
                                    <label>Subject:</label>
                                    <span>${message.subject}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Status:</label>
                                    <span class="status-badge status-${message.status}">${message.status}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Received:</label>
                                    <span>${new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Sender Information</h4>
                                <div class="detail-row">
                                    <label>Name:</label>
                                    <span>${message.name}</span>
                                </div>
                                <div class="detail-row">
                                    <label>Email:</label>
                                    <span>${message.email}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Message Content</h4>
                                <div class="message-content-full">
                                    <p>${message.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="adminDashboard.closeModal('messageModal')">Close</button>
                        <button class="btn btn-success" onclick="adminDashboard.replyMessage('${message._id}')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn btn-danger" onclick="adminDashboard.deleteMessage('${message._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    async markMessageAsRead(msgId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/messages/${msgId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                // Update local array
                const msgIndex = this.messages.findIndex(msg => msg._id === msgId);
                if (msgIndex !== -1) {
                    this.messages[msgIndex].status = 'read';
                    this.displayMessages(this.messages);
                }
            }
        } catch (error) {
            console.warn('Failed to mark message as read:', error);
        }
    }
    
    async replyMessage(msgId) {
        const message = this.messages.find(msg => msg._id === msgId);
        if (!message) {
            this.showNotification('Message not found', 'error');
            return;
        }
        
        this.showReplyModal(message);
    }
    
    showReplyModal(message) {
        const modalHTML = `
            <div class="modal-overlay" id="replyModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Reply to Message</h3>
                        <button class="modal-close" onclick="adminDashboard.closeModal('replyModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="reply-form">
                            <div class="original-message">
                                <h4>Original Message</h4>
                                <div class="original-content">
                                    <p><strong>From:</strong> ${message.name} (${message.email})</p>
                                    <p><strong>Subject:</strong> ${message.subject}</p>
                                    <p><strong>Message:</strong> ${message.message}</p>
                                </div>
                            </div>
                            
                            <div class="reply-content">
                                <h4>Your Reply</h4>
                                <form id="replyForm">
                                    <div class="form-group">
                                        <label for="replySubject">Subject:</label>
                                        <input type="text" id="replySubject" value="Re: ${message.subject}" class="form-input" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="replyMessage">Message:</label>
                                        <textarea id="replyMessage" rows="6" class="form-input" placeholder="Type your reply here..." required></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="adminDashboard.closeModal('replyModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="adminDashboard.sendReply('${message._id}')">
                            <i class="fas fa-paper-plane"></i> Send Reply
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    async sendReply(msgId) {
        const replySubject = document.getElementById('replySubject')?.value;
        const replyMessage = document.getElementById('replyMessage')?.value;
        
        if (!replySubject || !replyMessage) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/messages/${msgId}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: replySubject,
                    message: replyMessage
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.showNotification('Reply sent successfully', 'success');
            
            // Update message status
            const msgIndex = this.messages.findIndex(msg => msg._id === msgId);
            if (msgIndex !== -1) {
                this.messages[msgIndex].status = 'replied';
                this.displayMessages(this.messages);
            }
            
            this.closeModal('replyModal');
            this.closeModal('messageModal');
            
        } catch (error) {
            console.error('Send reply error:', error);
            this.showNotification('Error sending reply', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async deleteMessage(msgId) {
        if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/api/v1/admin/messages/${msgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.showNotification('Message deleted successfully', 'success');
            this.loadMessages();
            this.closeModal('messageModal');
            
        } catch (error) {
            console.error('Delete message error:', error);
            this.showNotification('Error deleting message', 'error');
        } finally {
            this.hideLoading();
        }
    }
    // Utility methods
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }
    
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = 'admin-login.html';
        }
    }
}

// Initialize the admin dashboard
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new PropamitAdmin();
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (window.innerWidth > 1024) {
        if (sidebar) sidebar.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
    }
});
