/**
 * AyuNetra Web Portal - Application Logic & State Engine
 */

// Supabase Configuration
const SUPABASE_URL = 'https://qqmnyvdkbblekwvibaqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbW55dmRrYmJsZWt3dmliYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDg0MzEsImV4cCI6MjA4ODM4NDQzMX0.wxTOOavT5zhjH3Tl_J-gMqrjl3Y9kjFqp8VWyyLYShI';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully.');
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
  }
}

// Application State
let appState = {
  user: {
    name: 'Ayush Bhardwaj',
    role: 'patient',
    email: 'patient@ayunetra.com',
    isLoggedIn: true
  },
  activeTab: 'scanner-tab',
  authModalRole: 'patient',
  authModalMode: 'login',
  scannedResult: null,
  records: [
    {
      id: 'rx-101',
      doctorName: 'Dr. Rajesh Sharma (Cardiologist)',
      doctorId: 'DOC-98745',
      patientName: 'Ayush Bhardwaj',
      patientAge: '29 Yrs',
      bloodPressure: '135/88 mmHg',
      recordType: 'prescription',
      medications: ['Telmisartan 40mg', 'Amlodipine 5mg', 'Aspirin 75mg'],
      dosage: '1 Tablet daily in the morning after breakfast',
      instructions: 'Take regularly every morning. Avoid high sodium foods and monitor blood pressure weekly.',
      aiSummary: 'Hypertension Management: Regular daily medication to control blood pressure. Keep salt intake low.',
      createdAt: '2026-08-05'
    },
    {
      id: 'rx-102',
      doctorName: 'Dr. Ananya Sen (Pulmonologist)',
      doctorId: 'DOC-44120',
      patientName: 'Ayush Bhardwaj',
      patientAge: '29 Yrs',
      bloodPressure: '120/80 mmHg',
      recordType: 'prescription',
      medications: ['Amoxicillin 500mg', 'Paracetamol 650mg', 'Levocetirizine 5mg'],
      dosage: 'Amoxicillin: 1 Capsule 3 times daily (8 hours apart). Paracetamol: as needed for fever.',
      instructions: 'Complete full 5-day antibiotic course even if feeling better. Take with meals.',
      aiSummary: 'Upper Respiratory Infection: Antibiotics course for 5 days. Stay hydrated and rest.',
      createdAt: '2026-07-28'
    },
    {
      id: 'lab-201',
      doctorName: 'Metropolis Diagnostics Lab',
      doctorId: 'LAB-8812',
      patientName: 'Ayush Bhardwaj',
      patientAge: '29 Yrs',
      recordType: 'lab_report',
      medications: ['Complete Blood Count (CBC)', 'HbA1c Glucose', 'Lipid Profile'],
      dosage: 'HbA1c: 5.6% (Normal), Total Cholesterol: 185 mg/dL (Desirable)',
      instructions: 'All key parameters within normal reference ranges. Fasting sugar is normal.',
      aiSummary: 'Annual Health Screening Report: Blood glucose and lipid levels are well managed.',
      createdAt: '2026-07-15'
    }
  ]
};

// Sample OCR Preset Prescriptions for Instant Testing
const SAMPLE_PRESCRIPTIONS = {
  hypertension: {
    summary: 'Hypertension & Cardiac Care Briefing: Telmisartan helps relax blood vessels to lower blood pressure. Take every morning consistently.',
    medications: ['Telmisartan 40mg (1-0-0)', 'Amlodipine 5mg (0-0-1)', 'Atorvastatin 10mg (Night)'],
    dosage: 'Telmisartan: Morning after breakfast. Amlodipine & Atorvastatin: At bedtime.',
    instructions: 'Monitor blood pressure 3 times a week. Reduce dietary salt intake and avoid stressful triggers.'
  },
  antibiotics: {
    summary: 'Antibiotic Therapy Briefing: Prescribed for acute bacterial throat infection. Take Amoxicillin strictly on time every 8 hours.',
    medications: ['Amoxicillin & Potassium Clavulanate 625mg', 'Paracetamol 650mg', 'Pantoprazole 40mg'],
    dosage: 'Amoxicillin: Twice daily after meals for 5 days. Pantoprazole: Empty stomach morning.',
    instructions: 'Complete the entire 5-day antibiotic course to prevent bacterial resistance.'
  },
  diabetes: {
    summary: 'Diabetes Type-2 Care Briefing: Metformin improves insulin sensitivity. Take with meals to reduce stomach upset.',
    medications: ['Metformin SR 500mg', 'Glimepiride 1mg', 'Vitamin D3 60K IU'],
    dosage: 'Metformin: Twice daily after breakfast and dinner. Glimepiride: Before breakfast.',
    instructions: 'Keep a glucose log sheet. Exercise 30 minutes daily and maintain low glycemic index diet.'
  }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderPatientRecords();
  renderDoctorRecords();
  setupDropzone();
  updateUserUI();
});

// UI Navigation & Tab Switching
function switchTab(tabId) {
  appState.activeTab = tabId;
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  const targetBtn = document.getElementById(`tab-btn-${tabId.replace('-tab', '')}`);
  const targetContent = document.getElementById(tabId);
  
  if (targetBtn) targetBtn.classList.add('active');
  if (targetContent) targetContent.classList.add('active');
}

function scrollToPortal(tabId) {
  switchTab(tabId);
  const portalSection = document.getElementById('portal');
  if (portalSection) {
    portalSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function toggleFaq(element) {
  const answer = element.querySelector('.faq-answer');
  const icon = element.querySelector('.faq-question i');
  
  if (answer.style.display === 'block') {
    answer.style.display = 'none';
    icon.className = 'fa-solid fa-chevron-down';
  } else {
    answer.style.display = 'block';
    icon.className = 'fa-solid fa-chevron-up';
  }
}


// User UI Renderer
function updateUserUI() {
  const guestView = document.getElementById('auth-guest-view');
  const userView = document.getElementById('auth-user-view');
  
  if (appState.user.isLoggedIn) {
    guestView.style.display = 'none';
    userView.style.display = 'flex';
    document.getElementById('user-display-name').innerText = appState.user.name;
    document.getElementById('user-display-role').innerText = appState.user.role === 'doctor' ? 'Doctor' : 'Patient';
    document.getElementById('user-avatar-initials').innerText = appState.user.name.charAt(0).toUpperCase();
  } else {
    guestView.style.display = 'flex';
    userView.style.display = 'none';
  }
}

// Render Patient Dashboard Records
function renderPatientRecords(recordsToRender = appState.records) {
  const grid = document.getElementById('patient-records-grid');
  if (!grid) return;

  if (recordsToRender.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
        <p>No medical records found matching your filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = recordsToRender.map(item => `
    <div class="prescription-card ${item.recordType === 'lab_report' ? 'lab-report' : ''}">
      <div class="card-top">
        <span class="card-badge ${item.recordType === 'lab_report' ? 'type-lab' : 'type-rx'}">
          <i class="fa-solid ${item.recordType === 'lab_report' ? 'fa-vial' : 'fa-prescription'}"></i>
          ${item.recordType === 'lab_report' ? 'Lab Report' : 'Prescription'}
        </span>
        <span style="font-size: 0.8rem; color: var(--text-dim);">${item.createdAt}</span>
      </div>

      <div class="card-title">${item.doctorName}</div>
      <div class="card-meta">
        <i class="fa-solid fa-user-injuring"></i> ${item.patientName} ${item.bloodPressure ? `| BP: ${item.bloodPressure}` : ''}
      </div>

      <div class="med-tags">
        ${(item.medications || []).map(m => `<span class="med-tag">${m}</span>`).join('')}
      </div>

      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        ${item.aiSummary || item.instructions}
      </p>

      <div class="card-actions">
        <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="viewPrescriptionDetail('${item.id}')">
          <i class="fa-solid fa-eye"></i> View Briefing
        </button>
        <button class="btn btn-outline btn-sm" onclick="speakText('${encodeURIComponent(item.aiSummary || item.instructions)}')">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Render Doctor Dashboard Records
function renderDoctorRecords() {
  const grid = document.getElementById('doctor-prescriptions-grid');
  if (!grid) return;
  renderPatientRecords(appState.records);
}

// Filter Records
function filterPatientRecords() {
  const query = document.getElementById('patient-search-input').value.toLowerCase().trim();
  const typeFilter = document.getElementById('patient-type-filter').value;

  const filtered = appState.records.filter(r => {
    const matchesQuery = query === '' || 
      r.doctorName.toLowerCase().includes(query) ||
      r.patientName.toLowerCase().includes(query) ||
      (r.medications && r.medications.some(m => m.toLowerCase().includes(query))) ||
      (r.aiSummary && r.aiSummary.toLowerCase().includes(query));

    const matchesType = typeFilter === 'all' || r.recordType === typeFilter;

    return matchesQuery && matchesType;
  });

  renderPatientRecords(filtered);
}

// AI Scanner & Dropzone Logic
function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  if (!dropzone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processPrescriptionFile(files[0]);
    }
  });
}

function triggerFileInput() {
  document.getElementById('file-input').click();
}

function handleFileSelect(event) {
  const files = event.target.files;
  if (files.length > 0) {
    processPrescriptionFile(files[0]);
  }
}

function processPrescriptionFile(file) {
  showToast(`Processing image: ${file.name}...`, 'info');
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imgPreview = document.getElementById('prescription-img-preview');
    imgPreview.src = e.target.result;
    document.getElementById('image-preview-container').style.display = 'block';

    // Simulate AI OCR & Extraction
    setTimeout(() => {
      loadSamplePrescription('antibiotics', false);
      showToast('AI Prescription OCR finished successfully!', 'success');
    }, 1200);
  };
  reader.readAsDataURL(file);
}

// Preset Sample Loader
function loadSamplePrescription(type, hideImg = true) {
  const data = SAMPLE_PRESCRIPTIONS[type] || SAMPLE_PRESCRIPTIONS.hypertension;
  appState.scannedResult = data;

  if (hideImg) {
    document.getElementById('image-preview-container').style.display = 'none';
  }

  document.getElementById('ai-briefing-text').innerText = data.summary;
  
  const medListEl = document.getElementById('ai-medications-list');
  medListEl.innerHTML = data.medications.map(m => `<li><strong>${m}</strong></li>`).join('');

  document.getElementById('ai-dosage-text').innerText = `${data.dosage}\n\nInstructions: ${data.instructions}`;

  const resultsCard = document.getElementById('analysis-results-card');
  resultsCard.classList.add('active');
  resultsCard.scrollIntoView({ behavior: 'smooth' });
}

// Speech Synthesis (Voice Briefing)
function speakBriefing() {
  if (!appState.scannedResult) {
    showToast('Please run AI analysis first.', 'error');
    return;
  }
  speakText(appState.scannedResult.summary);
}

function speakText(encodedText) {
  const text = decodeURIComponent(encodedText);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any active audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    showToast('Playing audio patient briefing...', 'info');
  } else {
    showToast('Text-to-speech is not supported in this browser.', 'error');
  }
}

// Save Scanned Prescription to State
function saveScannedPrescription() {
  if (!appState.scannedResult) return;

  const newRecord = {
    id: `rx-${Date.now()}`,
    doctorName: 'Dr. AI Assistant',
    doctorId: 'DOC-AI',
    patientName: appState.user.name,
    patientAge: '29 Yrs',
    recordType: 'prescription',
    medications: appState.scannedResult.medications,
    dosage: appState.scannedResult.dosage,
    instructions: appState.scannedResult.instructions,
    aiSummary: appState.scannedResult.summary,
    createdAt: new Date().toISOString().split('T')[0]
  };

  appState.records.unshift(newRecord);
  renderPatientRecords();
  renderDoctorRecords();
  showToast('Prescription saved to your Patient Dashboard!', 'success');
  switchTab('patient-tab');
}

// Detail Modal Popup
function viewPrescriptionDetail(id) {
  const record = appState.records.find(r => r.id === id);
  if (!record) return;

  const modal = document.getElementById('detail-modal');
  document.getElementById('detail-title').innerText = record.recordType === 'lab_report' ? 'Lab Report Details' : 'Prescription Details';
  
  const body = document.getElementById('detail-body');
  body.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div style="font-size: 1.2rem; font-weight: 700; color: #fff;">${record.doctorName}</div>
      <div style="font-size: 0.85rem; color: var(--text-muted);">Patient: ${record.patientName} | Issued: ${record.createdAt}</div>
    </div>

    <div class="briefing-box">
      <h4 style="color: var(--primary); margin-bottom: 0.4rem;"><i class="fa-solid fa-robot"></i> AI Patient Briefing</h4>
      <p style="font-size: 0.95rem; line-height: 1.5;">${record.aiSummary || record.instructions}</p>
    </div>

    <h4 style="margin: 1rem 0 0.5rem; color: var(--text-muted);">Prescribed Medications</h4>
    <ul style="padding-left: 1.2rem; margin-bottom: 1rem;">
      ${(record.medications || []).map(m => `<li style="margin-bottom: 0.2rem;"><strong>${m}</strong></li>`).join('')}
    </ul>

    <h4 style="margin: 1rem 0 0.5rem; color: var(--text-muted);">Dosage & Schedule</h4>
    <p style="font-size: 0.9rem; background: var(--card-dark); padding: 0.8rem; border-radius: var(--radius-sm);">${record.dosage || 'As prescribed by physician.'}</p>

    <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <button class="btn btn-secondary btn-sm" onclick="speakText('${encodeURIComponent(record.aiSummary || record.instructions)}')">
        <i class="fa-solid fa-volume-high"></i> Listen to Audio
      </button>
      <button class="btn btn-outline btn-sm" onclick="closeModal('detail-modal')">Close</button>
    </div>
  `;

  modal.classList.add('active');
}

// Modal Handlers
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openAddPrescriptionModal() {
  document.getElementById('add-prescription-modal').classList.add('active');
}

function handleSaveManualPrescription(event) {
  event.preventDefault();
  
  const patientName = document.getElementById('form-patient-name').value;
  const age = document.getElementById('form-patient-age').value;
  const bp = document.getElementById('form-bp').value;
  const type = document.getElementById('form-record-type').value;
  const medsStr = document.getElementById('form-medications').value;
  const dosage = document.getElementById('form-dosage').value;
  const instructions = document.getElementById('form-instructions').value;

  const medsList = medsStr ? medsStr.split(',').map(s => s.trim()) : ['General Medication'];

  const newRecord = {
    id: `rx-${Date.now()}`,
    doctorName: appState.user.role === 'doctor' ? appState.user.name : 'Dr. Self / Uploaded',
    doctorId: 'DOC-USER',
    patientName: patientName,
    patientAge: age,
    bloodPressure: bp,
    recordType: type,
    medications: medsList,
    dosage: dosage,
    instructions: instructions,
    aiSummary: `Manual ${type === 'lab_report' ? 'Lab Entry' : 'Prescription'}: ${instructions}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  appState.records.unshift(newRecord);
  renderPatientRecords();
  renderDoctorRecords();
  closeModal('add-prescription-modal');
  showToast('New prescription record created successfully!', 'success');
}

// Auth Handlers
function openAuthModal(role = 'patient') {
  appState.authModalRole = role;
  setAuthRole(role);
  document.getElementById('auth-modal').classList.add('active');
}

function setAuthRole(role) {
  appState.authModalRole = role;
  const docGroup = document.getElementById('doctor-reg-group');
  const patientBtn = document.getElementById('auth-role-patient');
  const doctorBtn = document.getElementById('auth-role-doctor');

  if (role === 'doctor') {
    docGroup.style.display = 'block';
    patientBtn.classList.remove('active');
    doctorBtn.classList.add('active');
  } else {
    docGroup.style.display = 'none';
    patientBtn.classList.add('active');
    doctorBtn.classList.remove('active');
  }
}

function toggleAuthMode() {
  appState.authModalMode = appState.authModalMode === 'login' ? 'signup' : 'login';
  const isLogin = appState.authModalMode === 'login';
  
  document.getElementById('auth-modal-title').innerHTML = `<i class="fa-solid fa-lock" style="color: var(--primary);"></i> ${isLogin ? 'Sign In' : 'Create Account'}`;
  document.getElementById('auth-switch-label').innerText = isLogin ? 'Sign Up' : 'Sign In';
  document.getElementById('auth-submit-btn').innerText = isLogin ? 'Login' : 'Sign Up';
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('auth-email').value;
  const role = appState.authModalRole;

  appState.user = {
    name: email.split('@')[0],
    role: role,
    email: email,
    isLoggedIn: true
  };

  updateUserUI();
  closeModal('auth-modal');
  showToast(`Welcome back, ${appState.user.name}! Logged in as ${role}.`, 'success');

  if (role === 'doctor') switchTab('doctor-tab');
  else switchTab('patient-tab');
}

function logoutUser() {
  appState.user.isLoggedIn = false;
  updateUserUI();
  showToast('Logged out of AyuNetra.', 'info');
}

// Access Delegation Logic
function grantDoctorAccess() {
  const docId = document.getElementById('grant-doctor-id').value;
  if (!docId) {
    showToast('Please enter doctor ID or email.', 'error');
    return;
  }
  showToast(`Access permission granted to ${docId}!`, 'success');
  document.getElementById('grant-doctor-id').value = '';
}

function revokeDoctorAccess(docId) {
  showToast(`Access revoked for ${docId}`, 'info');
}

// Doctor Patient Search
function searchPatientByDoctor() {
  const term = document.getElementById('doctor-patient-search').value.trim();
  const resultDiv = document.getElementById('doctor-search-result');
  if (!term) return;

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <div style="background: var(--card-dark); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--primary);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: var(--primary); font-size: 1.1rem;">Ayush Bhardwaj</strong> (ABHA: 91-8840-1204-99)
          <div style="font-size: 0.85rem; color: var(--text-muted);">Age: 29 | Male | Mobile: +91 98******10</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openAddPrescriptionModal()">
          <i class="fa-solid fa-plus"></i> Prescribe Medicine
        </button>
      </div>
    </div>
  `;
}

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
