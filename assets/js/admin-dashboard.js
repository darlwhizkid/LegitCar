// Admin Dashboard JavaScript
class PropamitAdmin {
    constructor() {
        this.mongoConnection = 'mongodb+srv://darlingtonodom:Coldwizkid@clusterd.bytfl.mongodb.net/LegitCar?retryWrites=true&w=majority';
        this.apiBaseUrl = 'https://propamit-backend.vercel.app'; // Your backend URL
        this.currentSection = 'dashboard';
        this.users = [];
        this.applications = [];
        this.messages = [];
        
        this.init();
    }
    
    async init() {
        // Check admin authentication
        if (!this.isAdminAuthenticated()) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        this.setupEventListeners();
        await this.loadDashboardData();
        this.setupNavigation();
    }
    
    isAdminAuthenticated() {
        return localStorage.getItem('adminToken') !== null;
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
                
                // Close mobile sidebar after navigation
                if (window.innerWidth <= 1024) {
                    this.closeMobileSidebar();
                }
            });
        });
        
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar') || document.querySelector('.admin-sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (mobileOverlay) {
                    mobileOverlay.classList.toggle('active');
                }
            });
        }
        
        // Close sidebar when clicking overlay
        if (mobileOverlay && sidebar) {
            mobileOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
        
        // Logout
        document.getElementById('adminLogout').addEventListener('click', () => {
            this.logout();
        });
        
        // Refresh buttons
        document.getElementById('refreshUsers')?.addEventListener('click', () => {
            this.loadUsers();
        });
        
        document.getElementById('refreshApplications')?.addEventListener('click', () => {
            this.loadApplications();
        });
        
        document.getElementById('refreshMessages')?.addEventListener('click', () => {
            this.loadMessages();
        });
        
        // Search functionality
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });
        
        // Status filter
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterApplications(e.target.value);
        });

        // Reset Database Button - NEW FUNCTIONALITY
        const resetDatabaseBtn = document.getElementById('resetDatabaseBtn');
        if (resetDatabaseBtn) {
            resetDatabaseBtn.addEventListener('click', () => {
                this.handleResetDatabase();
            });
        }
    }

    // NEW: Reset Database functionality
    async handleResetDatabase() {
        // Double confirmation
        if (!confirm('⚠️ WARNING: This will delete ALL user data except admin account!\n\nAre you sure you want to continue?')) {
            return;
        }

        if (!confirm('This action CANNOT be undone!\n\nType "RESET" in the next dialog to confirm.')) {
            return;
        }

        const confirmation = prompt('Type "RESET" to confirm database reset:');
        if (confirmation !== 'RESET') {
            this.showNotification('Database reset cancelled', 'info');
            return;
        }

        const resetBtn = document.getElementById('resetDatabaseBtn');
        
        try {
            // Show loading state
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting Database...';
            this.showLoading();

            // Call reset API
            const response = await fetch(`${this.apiBaseUrl}/api/admin/reset-database`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
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
            this.showNotification(`Error resetting database: ${error.message}`, 'error');
        } finally {
            // Reset button state
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<i class="fas fa-trash"></i> Reset Database';
            this.hideLoading();
        }
    }
    
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar') || document.querySelector('.admin-sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
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
        
        if (navItem) navItem.classList.add('active');
        if (sectionElement) sectionElement.classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && navItem) {
            pageTitle.textContent = navItem.querySelector('span').textContent;
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
            
            // Load stats
            await this.loadStats();
            
            // Load recent activity
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async loadStats() {
        try {
            // Try to fetch real data from API
            const response = await fetch(`${this.apiBaseUrl}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            let stats;
            if (response.ok) {
                const data = await response.json();
                stats = data.stats;
            } else {
                // Fallback to mock data
                stats = this.getMockStats();
            }
            
            this.updateStatsDisplay(stats);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            // Use mock data as fallback
            const stats = this.getMockStats();
            this.updateStatsDisplay(stats);
        }
    }
    
    getMockStats() {
        return {
            totalUsers: Math.floor(Math.random() * 100) + 25,
            totalApplications: Math.floor(Math.random() * 200) + 50,
            pendingApplications: Math.floor(Math.random() * 30) + 10,
            totalMessages: Math.floor(Math.random() * 50) + 15
        };
    }
    
    updateStatsDisplay(stats) {
        // Animate numbers
        this.animateNumber('totalUsers', stats.totalUsers);
        this.animateNumber('totalApplications', stats.totalApplications);
        this.animateNumber('pendingApplications', stats.pendingApplications);
        this.animateNumber('totalMessages', stats.totalMessages);
        
        // Update messages badge
        const messagesBadge = document.getElementById('messagesBadge');
        if (messagesBadge) {
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
    
    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;
        
        // Mock activity data
        const activities = [
            { type: 'user', message: 'New user registered: john.doe@example.com', time: '2 minutes ago', icon: 'user-plus' },
            { type: 'application', message: 'Application #APP001 submitted by Jane Smith', time: '15 minutes ago', icon: 'file-alt' },
            { type: 'message', message: 'New support message from Mike Johnson', time: '1 hour ago', icon: 'envelope' },
            { type: 'application', message: 'Application #APP002 approved', time: '2 hours ago', icon: 'check-circle' },
            { type: 'user', message: 'User profile updated: sarah@example.com', time: '3 hours ago', icon: 'user-edit' },
            { type: 'system', message: 'System backup completed successfully', time: '4 hours ago', icon: 'server' }
        ];
        
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
    
    async loadUsers() {
        try {
            this.showLoading();
            
            // Try to fetch real data
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
            } else {
                // Fallback to mock data
                this.users = this.getMockUsers();
            }
            
            this.displayUsers(this.users);
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = this.getMockUsers();
            this.displayUsers(this.users);
        } finally {
            this.hideLoading();
        }
    }
    
    getMockUsers() {
        return [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'active'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1 (555) 987-6543',
                createdAt: '2024-01-14T14:20:00Z',
                status: 'active'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                phone: '+1 (555) 456-7890',
                createdAt: '2024-01-13T09:15:00Z',
                status: 'active'
            },
            {
                id: 4,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                phone: '+1 (555) 321-0987',
                createdAt: '2024-01-12T16:45:00Z',
                status: 'active'
            },
            {
                id: 5,
                name: 'David Brown',
                email: 'david.brown@example.com',
                phone: '+1 (555) 654-3210',
                createdAt: '2024-01-11T11:30:00Z',
                status: 'active'
            }
        ];
    }
    
    displayUsers(users) {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No users found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <span class="status-badge ${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="admin.viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    filterUsers(searchTerm) {
        if (!searchTerm) {
            this.displayUsers(this.users);
            return;
        }
        
        const filtered = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone && user.phone.includes(searchTerm))
        );
        
        this.displayUsers(filtered);
    }
    
    async loadApplications() {
        try {
            this.showLoading();
            
            // Try to fetch real data
            const response = await fetch(`${this.apiBaseUrl}/api/admin/applications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.applications = data.applications || [];
            } else {
                // Fallback to mock data
                this.applications = this.getMockApplications();
            }
            
            this.displayApplications(this.applications);
            
        } catch (error) {
            console.error('Error loading applications:', error);
            this.applications = this.getMockApplications();
            this.displayApplications(this.applications);
        } finally {
            this.hideLoading();
        }
    }
    
    getMockApplications() {
        const statuses = ['pending', 'approved', 'rejected', 'processing'];
        const types = ['Vehicle Registration', 'Driver License', 'Vehicle Inspection', 'Insurance Certificate'];
        
        return Array.from({ length: 10 }, (_, i) => ({
            id: `APP${String(i + 1).padStart(3, '0')}`,
            userId: i + 1,
            userName: `User ${i + 1}`,
            userEmail: `user${i + 1}@example.com`,
            type: types[Math.floor(Math.random() * types.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
    }
    
    displayApplications(applications) {
        const tableBody = document.getElementById('applicationsTableBody');
        if (!tableBody) return;
        
        if (applications.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        No applications found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = applications.map(app => `
            <tr>
                <td><strong>${app.id}</strong></td>
                <td>
                    <div>
                        <div>${app.userName}</div>
                        <small style="color: #64748b;">${app.userEmail}</small>
                    </div>
                </td>
                <td>${app.type}</td>
                <td>
                    <span class="status-badge ${app.status}">
                        ${app.status}
                    </span>
                </td>
                <td>${this.formatDate(app.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="admin.approveApplication('${app.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.rejectApplication('${app.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    filterApplications(status) {
        if (status === 'all') {
            this.displayApplications(this.applications);
            return;
        }
        
        const filtered = this.applications.filter(app => app.status === status);
        this.displayApplications(filtered);
    }
    
    async loadMessages() {
        try {
            this.showLoading();
            
            // Try to fetch real data
            const response = await fetch(`${this.apiBaseUrl}/api/admin/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.messages = data.messages || [];
            } else {
                // Fallback to mock data
                this.messages = this.getMockMessages();
            }
            
            this.displayMessages(this.messages);
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.messages = this.getMockMessages();
            this.displayMessages(this.messages);
        } finally {
            this.hideLoading();
        }
    }
    
    getMockMessages() {
        return [
            {
                id: 1,
                from: 'john.doe@example.com',
                subject: 'Application Status Inquiry',
                message: 'Hello, I would like to check the status of my vehicle registration application submitted last week.',
                createdAt: '2024-01-15T14:30:00Z',
                read: false,
                priority: 'normal'
            },
            {
                id: 2,
                from: 'jane.smith@example.com',
                subject: 'Document Upload Issue',
                message: 'I am having trouble uploading my insurance documents. The file size seems to be within limits but it keeps failing.',
                createdAt: '2024-01-15T10:15:00Z',
                read: false,
                priority: 'high'
            },
            {
                id: 3,
                from: 'mike.johnson@example.com',
                subject: 'Payment Confirmation',
                message: 'I have completed the payment for my driver license application. Please confirm receipt.',
                createdAt: '2024-01-14T16:45:00Z',
                read: true,
                priority: 'normal'
            },
            {
                id: 4,
                from: 'sarah.wilson@example.com',
                subject: 'Application Rejection Appeal',
                message: 'I would like to appeal the rejection of my vehicle inspection application. I believe there was an error in the review process.',
                createdAt: '2024-01-14T09:20:00Z',
                read: true,
                priority: 'high'
            },
            {
                id: 5,
                from: 'david.brown@example.com',
                subject: 'General Inquiry',
                message: 'What are the requirements for vehicle registration renewal? I could not find clear information on the website.',
                createdAt: '2024-01-13T11:30:00Z',
                read: true,
                priority: 'low'
            }
        ];
    }
    
    displayMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #64748b;">
                    <i class="fas fa-envelope" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <h3>No messages found</h3>
                    <p>All messages will appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = messages.map(message => `
            <div class="message-item ${!message.read ? 'unread' : ''}">
                <div class="message-header">
                    <div class="message-from">
                        <strong>${message.from}</strong>
                        ${message.priority === 'high' ? '<span class="priority-badge high">High Priority</span>' : ''}
                        ${message.priority === 'urgent' ? '<span class="priority-badge urgent">Urgent</span>' : ''}
                    </div>
                    <div class="message-time">${this.formatDate(message.createdAt)}</div>
                </div>
                <div class="message-subject">
                    <strong>${message.subject}</strong>
                    ${!message.read ? '<span class="unread-indicator">●</span>' : ''}
                </div>
                <div class="message-preview">
                    ${message.message.substring(0, 150)}${message.message.length > 150 ? '...' : ''}
                </div>
                <div class="message-actions">
                    <button class="btn btn-sm btn-primary" onclick="admin.viewMessage(${message.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="admin.replyMessage(${message.id})">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    ${!message.read ? `<button class="btn btn-sm btn-success" onclick="admin.markAsRead(${message.id})">
                        <i class="fas fa-check"></i> Mark Read
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteMessage(${message.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // User actions
    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nRegistered: ${this.formatDate(user.createdAt)}\nStatus: ${user.status}`);
        }
    }
    
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Try to delete via API
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                this.showNotification('User deleted successfully', 'success');
            } else {
                // Simulate deletion for demo
                this.users = this.users.filter(u => u.id !== userId);
                this.displayUsers(this.users);
                this.showNotification('User deleted successfully (demo)', 'success');
            }
            
        } catch (error) {
            console.error('Error deleting user:', error);
            // Simulate deletion for demo
            this.users = this.users.filter(u => u.id !== userId);
            this.displayUsers(this.users);
            this.showNotification('User deleted successfully (demo)', 'success');
        }
    }
    
    // Application actions
    viewApplication(appId) {
        const app = this.applications.find(a => a.id === appId);
        if (app) {
            alert(`Application Details:\n\nID: ${app.id}\nUser: ${app.userName} (${app.userEmail})\nType: ${app.type}\nStatus: ${app.status}\nSubmitted: ${this.formatDate(app.createdAt)}`);
        }
    }
    
    async approveApplication(appId) {
        if (!confirm('Are you sure you want to approve this application?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/applications/${appId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Application approved successfully', 'success');
                this.loadApplications();
            } else {
                // Simulate approval for demo
                const app = this.applications.find(a => a.id === appId);
                if (app) {
                    app.status = 'approved';
                    this.displayApplications(this.applications);
                    this.showNotification('Application approved successfully (demo)', 'success');
                }
            }
            
        } catch (error) {
            console.error('Error approving application:', error);
            // Simulate approval for demo
            const app = this.applications.find(a => a.id === appId);
            if (app) {
                app.status = 'approved';
                this.displayApplications(this.applications);
                this.showNotification('Application approved successfully (demo)', 'success');
            }
        }
    }
    
    async rejectApplication(appId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/applications/${appId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            if (response.ok) {
                this.showNotification('Application rejected successfully', 'success');
                this.loadApplications();
            } else {
                // Simulate rejection for demo
                const app = this.applications.find(a => a.id === appId);
                if (app) {
                    app.status = 'rejected';
                    this.displayApplications(this.applications);
                    this.showNotification('Application rejected successfully (demo)', 'success');
                }
            }
            
        } catch (error) {
            console.error('Error rejecting application:', error);
            // Simulate rejection for demo
            const app = this.applications.find(a => a.id === appId);
            if (app) {
                app.status = 'rejected';
                this.displayApplications(this.applications);
                this.showNotification('Application rejected successfully (demo)', 'success');
            }
        }
    }
    
    // Message actions
    viewMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            alert(`Message Details:\n\nFrom: ${message.from}\nSubject: ${message.subject}\nDate: ${this.formatDate(message.createdAt)}\nPriority: ${message.priority}\n\nMessage:\n${message.message}`);
            
            // Mark as read
            if (!message.read) {
                this.markAsRead(messageId);
            }
        }
    }
    
    replyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            const reply = prompt(`Reply to ${message.from}:\n\nSubject: Re: ${message.subject}\n\nYour reply:`);
            if (reply) {
                this.showNotification('Reply sent successfully (demo)', 'success');
            }
        }
    }
    
    markAsRead(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.read = true;
            this.displayMessages(this.messages);
            this.showNotification('Message marked as read', 'success');
        }
    }
    
    deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.displayMessages(this.messages);
        this.showNotification('Message deleted successfully', 'success');
    }
    
    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        const existingNotifications = document.querySelectorAll('.admin-notification');
        existingNotifications.forEach(notif => notif.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background-color: ${this.getNotificationColor(type)};
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
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
    
    getNotificationColor(type) {
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('isAdmin');
            window.location.href = 'admin-login.html';
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make admin instance globally available
    window.admin = new PropamitAdmin();
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.admin) {
        // Refresh data when user returns to tab
        window.admin.loadSectionData(window.admin.currentSection);
    }
});

// Handle online/offline status
window.addEventListener('online', function() {
    if (window.admin) {
        window.admin.showNotification('Connection restored', 'success');
    }
});

window.addEventListener('offline', function() {
    if (window.admin) {
        window.admin.showNotification('Connection lost. Some features may not work.', 'warning');
    }
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024 && window.admin) {
        window.admin.closeMobileSidebar();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Only handle shortcuts when not typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl/Cmd + shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                if (window.admin) window.admin.switchSection('dashboard');
                break;
            case '2':
                e.preventDefault();
                if (window.admin) window.admin.switchSection('users');
                break;
            case '3':
                e.preventDefault();
                if (window.admin) window.admin.switchSection('applications');
                break;
            case '4':
                e.preventDefault();
                if (window.admin) window.admin.switchSection('messages');
                break;
            case '5':
                e.preventDefault();
                if (window.admin) window.admin.switchSection('settings');
                break;
            case 'r':
                e.preventDefault();
                if (window.admin) {
                    window.admin.loadSectionData(window.admin.currentSection);
                }
                break;
        }
    }
    
    // Escape key to close mobile sidebar
    if (e.key === 'Escape' && window.admin) {
        window.admin.closeMobileSidebar();
    }
});

// Add CSS for notification styles if not already present
if (!document.querySelector('#admin-notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'admin-notification-styles';
    styles.textContent = `
        .admin-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .admin-notification .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .admin-notification .notification-close:hover {
            opacity: 1;
        }
        
        .priority-badge {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            margin-left: 8px;
        }
        
        .priority-badge.high {
            background-color: #f59e0b;
            color: white;
        }
        
        .priority-badge.urgent {
            background-color: #ef4444;
            color: white;
        }
        
        .unread-indicator {
            color: #3b82f6;
            font-weight: bold;
            margin-left: 8px;
        }
        
        .message-item.unread {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .status-badge.active {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .status-badge.pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .status-badge.approved {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .status-badge.rejected {
            background-color: #fecaca;
            color: #991b1b;
        }
        
        .status-badge.processing {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
        }
        
        .activity-icon.user {
            background-color: #3b82f6;
        }
        
        .activity-icon.application {
            background-color: #10b981;
        }
        
        .activity-icon.message {
            background-color: #f59e0b;
        }
        
        .activity-icon.system {
            background-color: #8b5cf6;
        }
        
        @media (max-width: 768px) {
            .admin-notification {
                right: 10px !important;
                left: 10px !important;
                max-width: none !important;
            }
        }
    `;
    document.head.appendChild(styles);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropamitAdmin;
}