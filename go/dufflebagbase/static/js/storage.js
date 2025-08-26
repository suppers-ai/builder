// Storage page functionality

// Select bucket
window.selectBucket = function(bucketName) {
    if (bucketName) {
        window.location.href = `/storage?bucket=${bucketName}`;
    } else {
        window.location.href = '/storage';
    }
}

// Show upload modal
window.showUploadModal = function() {
    document.getElementById('uploadModal').style.display = 'block';
}

// Hide upload modal
window.hideUploadModal = function() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('uploadForm').reset();
    document.querySelector('.upload-progress').style.display = 'none';
}

// Upload file
window.uploadFile = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const bucket = formData.get('bucket');
    const file = formData.get('file');
    const path = formData.get('path') || '';
    
    // Show progress bar
    const progressBar = document.querySelector('.upload-progress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    progressBar.style.display = 'block';
    
    // Create upload form data
    const uploadData = new FormData();
    uploadData.append('file', file);
    if (path) {
        uploadData.append('path', path);
    }
    
    try {
        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = Math.round(percentComplete) + '%';
            }
        });
        
        // Handle completion
        xhr.addEventListener('load', function() {
            if (xhr.status === 200 || xhr.status === 201) {
                window.location.reload();
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    alert('Error uploading file: ' + error.message);
                } catch (e) {
                    alert('Error uploading file');
                }
                progressBar.style.display = 'none';
            }
        });
        
        // Handle error
        xhr.addEventListener('error', function() {
            alert('Error uploading file');
            progressBar.style.display = 'none';
        });
        
        // Send request
        xhr.open('POST', `/api/v1/storage/${bucket}/upload`);
        xhr.send(uploadData);
        
    } catch (error) {
        alert('Error uploading file: ' + error.message);
        progressBar.style.display = 'none';
    }
}

// Download file
window.downloadFile = function(fileUrl) {
    window.open(fileUrl, '_blank');
}

// Delete file
window.deleteFile = async function(fileName) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    const bucket = new URLSearchParams(window.location.search).get('bucket');
    if (!bucket) return;
    
    try {
        const response = await fetch(`/api/v1/storage/${bucket}/${fileName}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error deleting file: ' + error.message);
        }
    } catch (error) {
        alert('Error deleting file: ' + error.message);
    }
}

// Create folder
window.createFolder = async function() {
    const bucket = new URLSearchParams(window.location.search).get('bucket');
    if (!bucket) return;
    
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    try {
        // Create an empty file with folder path to create the folder
        const formData = new FormData();
        formData.append('file', new Blob([''], { type: 'text/plain' }), '.keep');
        formData.append('path', folderName + '/');
        
        const response = await fetch(`/api/v1/storage/${bucket}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error creating folder: ' + error.message);
        }
    } catch (error) {
        alert('Error creating folder: ' + error.message);
    }
}

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideUploadModal();
    }
});

// Close modal on outside click
document.getElementById('uploadModal')?.addEventListener('click', function(event) {
    if (event.target === this) {
        hideUploadModal();
    }
});