import { api } from './api.js';
import { modal } from './modal.js';

class UsersManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUsers();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById('addUserBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Form submissions
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        }

        const roleForm = document.getElementById('roleForm');
        if (roleForm) {
            roleForm.addEventListener('submit', (e) => this.handleRoleSubmit(e));
        }

        // Edit, password, role, and delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-user')) {
                const id = e.target.dataset.id;
                this.showEditModal(id);
            } else if (e.target.classList.contains('change-password')) {
                const id = e.target.dataset.id;
                this.showPasswordModal(id);
            } else if (e.target.classList.contains('change-role')) {
                const id = e.target.dataset.id;
                const currentRole = e.target.dataset.role;
                this.showRoleModal(id, currentRole);
            } else if (e.target.classList.contains('delete-user')) {
                const id = e.target.dataset.id;
                this.deleteUser(id);
            }
        });
    }

    async loadUsers() {
        try {
            const users = await api.users.getAll();
            this.renderTable(users);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    renderTable(users) {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}">
                        ${user.role}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleString()}</td>
                <td>${new Date(user.updated_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm change-password" data-id="${user.id}">
                        Change Password
                    </button>
                    <button class="btn btn-sm change-role" data-id="${user.id}" data-role="${user.role}">
                        Change Role
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showAddModal() {
        this.currentUser = null;
        document.getElementById('userForm').reset();
        document.getElementById('modalTitle').textContent = 'Add User';
        modal.open('userModal');
    }

    showPasswordModal(userId) {
        this.currentUser = { id: userId };
        document.getElementById('passwordForm').reset();
        modal.open('passwordModal');
    }

    showRoleModal(userId, currentRole) {
        this.currentUser = { id: userId };
        document.getElementById('userRole').value = currentRole;
        modal.open('roleModal');
    }

    async handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('userEmail').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRoleSelect').value
        };

        try {
            await api.users.create(formData);
            modal.close('userModal');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user: ' + error.message);
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await api.users.updatePassword(this.currentUser.id, newPassword);
            modal.close('passwordModal');
            alert('Password updated successfully');
        } catch (error) {
            console.error('Failed to update password:', error);
            alert('Failed to update password: ' + error.message);
        }
    }

    async handleRoleSubmit(e) {
        e.preventDefault();
        
        const newRole = document.getElementById('userRole').value;

        try {
            await api.users.updateRole(this.currentUser.id, newRole);
            modal.close('roleModal');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role: ' + error.message);
        }
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await api.users.delete(id);
            this.loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user: ' + error.message);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new UsersManager());
} else {
    new UsersManager();
}

export default UsersManager;