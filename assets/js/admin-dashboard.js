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
    }
    
    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active from nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update page title
        document.getElementById('pageTitle').textContent = 
            sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        
        this.currentSection = sectionName;
        
        // Load section data
        this.loadSectionData(sectionName);
    }
    
    async loadSectionData(section) {
        switch(section) {
            case 'users':
                await this.loadUsers();
                break;
            case 'applications':
                await this.loadApplications();
                break;
            case 'messages':
                await this.loadMessages();
                break;
        }
    }
    
    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Load all data for dashboard stats
            await Promise.all([
                this.loadUsers(),
                this.loadApplications(),
                this.loadMessages()
            ]);
            
            this.updateDashboardStats();
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async loadUsers() {
        try {
            // This would connect to your MongoDB via your backend API
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
            } else {
                // Fallback: Mock data for now until backend is ready
                this.users = this.getMockUsers();
            }
            
            this.renderUsers();
            
        } catch (error) {
            console.error('Error loading users:', error);
            // Use mock data as fallback
            this.users = this.getMockUsers();
            this.renderUsers();
        }
    }
    
    async loadApplications() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/applications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.applications = data.applications || [];
            } else {
                // Fallback: Mock data
                this.applications = this.getMockApplications();
            }
            
            this.renderApplications();
            
        } catch (error) {
            console.error('Error loading applications:', error);
            this.applications = this.getMockApplications();
            this.renderApplications();
        }
    }
    
    async loadMessages() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.messages = data.messages || [];
            } else {
                // Fallback: Mock data
                this.messages = this.getMockMessages();
            }
            
            this.renderMessages();
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.messages = this.getMockMessages();
            this.renderMessages();
        }
    }
    
    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${user.status === 'active' ? 'status-approved' : 'status-pending'}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.viewUser('${user._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="admin.editUser('${user._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderApplications() {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.applications.map(app => `
            <tr>
                <td>#${app.id || app._id}</td>
                <td>${app.userName}</td>
                <td>${app.type}</td>
                <td>
                    <select class="status-select" onchange="admin.updateApplicationStatus('${app._id}', this.value)">
                        <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="processing" ${app.status === 'processing' ? 'selected' : ''}>Processing</option>
                    </select>
                </td>
                <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.viewApplication('${app._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="admin.downloadDocuments('${app._id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        container.innerHTML = this.messages.map(message => `
            <div class="message-card ${message.read ? '' : 'unread'}">
                <div class="message-header">
                    <div class="message-sender">
                        <strong>${message.name}</strong>
                        <span class="message-email">${message.email}</span>
                    </div>
                    <div class="message-date">
                        ${new Date(message.createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="message-subject">
                    <strong>Subject:</strong> ${message.subject}
                </div>
                <div class="message-content">
                    ${message.message}
                </div>
                <div class="message-actions">
                    <button class="btn btn-primary" onclick="admin.replyToMessage('${message._id}')">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    <button class="btn btn-secondary" onclick="admin.markAsRead('${message._id}')">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>
                    <button class="btn btn-danger" onclick="admin.deleteMessage('${message._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateDashboardStats() {
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalApplications').textContent = this.applications.length;
        document.getElementById('pendingApplications').textContent = 
            this.applications.filter(app => app.status === 'pending').length;
        document.getElementById('totalMessages').textContent = this.messages.length;
        
        // Update messages badge
        const unreadMessages = this.messages.filter(msg => !msg.read).length;
        const badge = document.getElementById('messagesBadge');
        if (badge) {
            badge.textContent = unreadMessages;
            badge.style.display = unreadMessages > 0 ? 'inline' : 'none';
        }
    }
    
    loadRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        // Combine recent activities
        const activities = [
            ...this.users.slice(-3).map(user => ({
                type: 'user',
                message: `New user registered: ${user.name}`,
                time: user.createdAt
            })),
            ...this.applications.slice(-3).map(app => ({
                type: 'application',
                message: `New application submitted: ${app.type}`,
                time: app.submittedAt
            })),
            ...this.messages.slice(-3).map(msg => ({
                type: 'message',
                message: `New message from: ${msg.name}`,
                time: msg.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${new Date(activity.time).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    getActivityIcon(type) {
        const icons = {
            user: 'user-plus',
            application: 'file-alt',
            message: 'envelope'
        };
        return icons[type] || 'info-circle';
    }
    
    // Action methods
    async updateApplicationStatus(applicationId, newStatus) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/admin/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                this.showNotification('Application status updated successfully', 'success');
                await this.loadApplications();
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            this.showNotification('Error updating application status', 'error');
        }
    }
    
    viewUser(userId) {
        const user = this.users.find(u => u._id === userId);
        if (user) {
            this.showUserModal(user);
        }
    }
    
    viewApplication(applicationId) {
        const application = this.applications.find(app => app._id === applicationId);
        if (application) {
            this.showApplicationModal(application);
        }
    }
    
    replyToMessage(messageId) {
        const message = this.messages.find(msg => msg._id === messageId);
        if (message) {
            this.showReplyModal(message);
        }
    }
    
    // Mock data methods (remove when backend is ready)
    getMockUsers() {
        return [
            {
                _id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                _id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+0987654321',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    }
    
    getMockApplications() {
        return [
            {
                _id: 'app1',
                id: 'APP001',
                userName: 'John Doe',
                type: 'Vehicle Registration',
                status: 'pending',
                submittedAt: new Date().toISOString()
            },
            {
                _id: 'app2',
                id: 'APP002',
                userName: 'Jane Smith',
                type: 'Driver License',
                status: 'approved',
                submittedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    }
    
    getMockMessages() {
        return [
            {
                _id: 'msg1',
                name: 'Customer Support',
                email: 'support@example.com',
                subject: 'Application Status Inquiry',
                message: 'Hello, I would like to check the status of my application.',
                read: false,
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    // Utility methods
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'admin-login.html';
    }
    
    filterUsers(searchTerm) {
        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterApplications(status) {
        const rows = document.querySelectorAll('#applicationsTableBody tr');
        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                const statusCell = row.querySelector('.status-select');
                row.style.display = statusCell.value === status ? '' : 'none';
            }
        });
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.admin = new PropamitAdmin();
});