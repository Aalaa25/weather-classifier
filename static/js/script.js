document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const weatherCard = document.getElementById('weatherCard');
    const predictionValue = document.getElementById('predictionValue');
    const confidenceValue = document.getElementById('confidenceValue');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const spinner = document.getElementById('spinner');

    // Handle drag & drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#6e8efb';
        uploadBox.style.backgroundColor = 'rgba(110, 142, 251, 0.1)';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#aaa';
        uploadBox.style.backgroundColor = 'transparent';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#aaa';
        uploadBox.style.backgroundColor = 'transparent';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(fileInput.files[0]);
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    function showError(message) {
        const errorElement = document.getElementById('errorMessage');
        document.getElementById('errorText').textContent = message;
        errorElement.classList.remove('hidden');
    }

    function hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }

    function resetUI() {
        weatherCard.classList.remove('visible');
        weatherCard.classList.add('hidden');
        imagePreviewContainer.classList.add('hidden');
        hideError();
    }

    // Process image and call Flask API
    function handleFileUpload(file) {
        resetUI();
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            showError('Please upload a JPEG, JPG, or PNG image');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
        }
        reader.readAsDataURL(file);

        // Prepare and send request
        const formData = new FormData();
        formData.append('file', file);

        spinner.classList.remove('hidden');
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            spinner.classList.add('hidden');
            
            if (data.error) {
                showError(data.error);
            } else {
                predictionValue.textContent = data.prediction;
                confidenceValue.textContent = data.confidence;
                weatherCard.classList.remove('hidden');
                weatherCard.classList.add('visible');
            }
        })
        .catch(error => {
            spinner.classList.add('hidden');
            showError('An error occurred while predicting. Please try again.');
            console.error('Error:', error);
        });
    }
});