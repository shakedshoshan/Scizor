const { ipcRenderer } = require('electron');

/**
 * Auth Panel Component
 * Handles user authentication and login functionality
 */
class AuthPanel {
    constructor() {
        this.container = null;
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    render(container) {
        this.container = container;
        this.createPanelContent();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    createPanelContent() {
        this.container.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">🔐 Authentication</div>
                <div class="panel-controls">
                    <button class="panel-btn" id="refresh-auth-btn" title="Refresh">🔄</button>
                </div>
            </div>
            <div class="panel-content">
                <div id="auth-status" class="auth-status">
                    <div class="auth-loading">Checking authentication...</div>
                </div>
                <div id="login-form" class="login-form" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Email:</label>
                        <input type="email" class="form-input" id="login-email" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password:</label>
                        <input type="password" class="form-input" id="login-password" placeholder="Enter your password">
                    </div>
                    <div class="form-group">
                        <button class="btn" id="login-btn">Login</button>
                    </div>
                </div>
                <div id="user-info" class="user-info" style="display: none;">
                    <div class="user-avatar">
                        <span class="avatar-placeholder">👤</span>
                    </div>
                    <div class="user-details">
                        <div class="user-name" id="user-name">User Name</div>
                        <div class="user-email" id="user-email">user@example.com</div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-secondary" id="logout-btn">Logout</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Login button
        const loginBtn = this.container.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = this.container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-auth-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.checkAuthStatus();
            });
        }
    }

    checkAuthStatus() {
        // Check if user is already authenticated
        this.showLoadingState();
        
        // This will be implemented with the auth module
        setTimeout(() => {
            // Simulate auth check
            const isAuthenticated = false; // This will come from auth module
            if (isAuthenticated) {
                this.showAuthenticatedState();
            } else {
                this.showLoginForm();
            }
        }, 1000);
    }

    showLoadingState() {
        const authStatus = this.container.querySelector('#auth-status');
        const loginForm = this.container.querySelector('#login-form');
        const userInfo = this.container.querySelector('#user-info');

        if (authStatus) authStatus.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }

    showLoginForm() {
        const authStatus = this.container.querySelector('#auth-status');
        const loginForm = this.container.querySelector('#login-form');
        const userInfo = this.container.querySelector('#user-info');

        if (authStatus) authStatus.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }

    showAuthenticatedState() {
        const authStatus = this.container.querySelector('#auth-status');
        const loginForm = this.container.querySelector('#login-form');
        const userInfo = this.container.querySelector('#user-info');

        if (authStatus) authStatus.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';

        this.updateUserInfo();
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userName = this.container.querySelector('#user-name');
            const userEmail = this.container.querySelector('#user-email');

            if (userName) userName.textContent = this.currentUser.name || 'User';
            if (userEmail) userEmail.textContent = this.currentUser.email || 'user@example.com';
        }
    }

    handleLogin() {
        const email = this.container.querySelector('#login-email').value.trim();
        const password = this.container.querySelector('#login-password').value.trim();

        if (!email || !password) {
            this.showStatus('Please enter both email and password', 'error');
            return;
        }

        this.performLogin(email, password);
    }

    performLogin(email, password) {
        // This will be implemented with the auth module
        console.log('Logging in with:', email);
        
        // Simulate login process
        setTimeout(() => {
            // Simulate successful login
            this.currentUser = {
                name: 'Test User',
                email: email,
                id: 'user123'
            };
            
            this.isAuthenticated = true;
            this.showAuthenticatedState();
            this.showStatus('Login successful!', 'success');
        }, 2000);
    }

    handleLogout() {
        // This will be implemented with the auth module
        console.log('Logging out...');
        
        this.isAuthenticated = false;
        this.currentUser = null;
        this.showLoginForm();
        this.showStatus('Logged out successfully', 'info');
    }

    showStatus(message, type = 'info') {
        // Show status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        
        this.container.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }

    // Public methods for external use
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    login(email, password) {
        return this.performLogin(email, password);
    }

    logout() {
        return this.handleLogout();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthPanel };
} 