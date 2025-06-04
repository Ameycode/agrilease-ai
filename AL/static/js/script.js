// DOM Elements
const verificationForm = document.getElementById('verificationForm');
const submitVerification = document.getElementById('submitVerification');
const uploadBox = document.getElementById('uploadBox');
const documentUpload = document.getElementById('documentUpload');
const uploadPreview = document.getElementById('uploadPreview');
const fileName = document.getElementById('fileName');
const viewDocument = document.getElementById('viewDocument');
const removeDocument = document.getElementById('removeDocument');
const langButtons = document.querySelectorAll('.lang-btn');
const resultSection = document.getElementById('resultSection');

// State Management
let currentLanguage = 'en';
let documentUploaded = false;

// Document Upload Handling
uploadBox.addEventListener('click', () => documentUpload.click());

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
});

documentUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
});

function handleFileUpload(file) {
    if (!file) return;
    
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        showNotification('Please upload a valid PDF or image file', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }
    
    fileName.textContent = file.name;
    uploadPreview.style.display = 'block';
    uploadBox.style.display = 'none';
    documentUploaded = true;
    updateSubmitButton();
}

viewDocument.addEventListener('click', () => {
    const file = documentUpload.files[0];
    if (file) {
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl, '_blank');
    }
});

removeDocument.addEventListener('click', () => {
    documentUpload.value = '';
    uploadPreview.style.display = 'none';
    uploadBox.style.display = 'block';
    documentUploaded = false;
    updateSubmitButton();
    if (resultSection) {
        resultSection.style.display = 'none';
    }
});

// Language Switching
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        switchLanguage(lang);
    });
});

function switchLanguage(lang) {
    currentLanguage = lang;
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    document.querySelectorAll('[data-en]').forEach(element => {
        element.textContent = element.dataset[lang];
    });
}

function displayResults(details) {
    if (!resultSection) return;

    resultSection.style.display = 'block';
    
    const resultHTML = `
        <div class="result-grid">
            <div class="result-item">
                <h4>${currentLanguage === 'en' ? 'Document Type' : 'दस्तऐवज प्रकार'}</h4>
                <p>${details.document_type}</p>
            </div>
            <div class="result-item">
                <h4>${currentLanguage === 'en' ? 'Khata Number' : 'खाते क्रमांक'}</h4>
                <p>${details.khata_number}</p>
            </div>
            <div class="result-item">
                <h4>${currentLanguage === 'en' ? 'Survey Number' : 'सर्वे क्रमांक'}</h4>
                <p>${details.survey_number}</p>
            </div>
            <div class="result-item">
                <h4>${currentLanguage === 'en' ? 'Land Area' : 'क्षेत्र'}</h4>
                <p>
                    ${currentLanguage === 'en' ? 'Irrigation' : 'सिंचन'}: ${details.land_area.irrigation}<br>
                    ${currentLanguage === 'en' ? 'Designated' : 'नियुक्त'}: ${details.land_area.designated}<br>
                    ${currentLanguage === 'en' ? 'Total' : 'एकूण'}: ${details.land_area.total}
                </p>
            </div>
            <div class="result-item">
                <h4>${currentLanguage === 'en' ? 'Tax Details' : 'कर तपशील'}</h4>
                <p>
                    ${currentLanguage === 'en' ? 'Akarni' : 'आकारणी'}: ₹${details.tax_details.akarni}<br>
                    ${currentLanguage === 'en' ? 'District Cess' : 'जिल्हा उपकर'}: ₹${details.tax_details.district_cess}<br>
                    ${currentLanguage === 'en' ? 'Gram Panchayat Cess' : 'ग्राम पंचायत उपकर'}: ₹${details.tax_details.gram_panchayat_cess}<br>
                    ${currentLanguage === 'en' ? 'Total' : 'एकूण'}: ₹${details.tax_details.total}
                </p>
            </div>
        </div>
    `;
    
    resultSection.innerHTML = `
        <h3>${currentLanguage === 'en' ? 'Extracted Information' : 'निष्कर्षित माहिती'}</h3>
        ${resultHTML}
    `;
}

// Form Submission
verificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!documentUploaded) {
        showNotification('Please upload your 8A document', 'error');
        return;
    }
    
    showNotification('Processing document...', 'info');
    
    const formData = new FormData(verificationForm);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message, 'success');
            displayResults(data.details);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('An error occurred while processing the document', 'error');
    }
});

// Submit Button State
function updateSubmitButton() {
    submitVerification.disabled = !documentUploaded;
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/upload', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.error) {
        console.error('Upload error:', data.error);
    } else {
        console.log('Upload success:', data);
    }
})
.catch(error => console.error('Error:', error));

// Initialize
updateSubmitButton(); 