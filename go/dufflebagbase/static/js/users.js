// Users page functionality

// Show create user modal
window.showCreateUserModal = function() {
    document.getElementById('createUserModal').style.display = 'block';
}

// Hide create user modal  
window.hideCreateUserModal = function() {
    document.getElementById('createUserModal').style.display = 'none';
    document.getElementById('createUserForm').reset();
}

// Create user
window.createUser = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/v1/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                username: formData.get('username'),
                role: formData.get('role')
            })
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error creating user: ' + error.message);
        }
    } catch (error) {
        alert('Error creating user: ' + error.message);
    }
}

// Edit user
window.editUser = async function(userId) {
    // TODO: Implement edit user modal
    console.log('Edit user:', userId);
}

// Delete user
window.deleteUser = async function(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error deleting user: ' + error.message);
        }
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideCreateUserModal();
    }
});

// Close modal on outside click
document.getElementById('createUserModal')?.addEventListener('click', function(event) {
    if (event.target === this) {
        hideCreateUserModal();
    }
});