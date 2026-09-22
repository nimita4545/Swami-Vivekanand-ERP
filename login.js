// Backend API base URL
const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

// ==========================================
// LANGUAGE TRANSLATION DICTIONARY
// Default: Marathi ('mr')
// ==========================================
const loginTranslations = {
    mr: {
        lang_btn: "🌐 English",
        subtitle: "शाळा ईआरपी प्रणाली",
        login_title: "लॉगिन",
        lbl_username: "वापरकर्ता नाव (Username)",
        ph_username: "वापरकर्ता नाव प्रविष्ट करा",
        lbl_password: "पासवर्ड (Password)",
        ph_password: "पासवर्ड प्रविष्ट करा",
        role_title: "या नात्याने लॉगिन करा",
        role_student: "विद्यार्थी",
        role_teacher: "शिक्षक",
        role_admin: "प्रशासक (Admin)",
        btn_login: "लॉगिन करा",
        msg_fill_fields: "कृपया सर्व माहिती भरा.",
        msg_logging_in: "लॉगिन करत आहे...",
        msg_login_success: "लॉगिन यशस्वी! स्वागत आहे ",
        msg_login_failed: "अवैध माहिती. कृपया पुन्हा प्रयत्न करा.",
        msg_server_error: "सर्व्हर जोडणीत त्रुटी. कृपया पुन्हा प्रयत्न करा."
    },
    en: {
        lang_btn: "🌐 मराठी",
        subtitle: "SCHOOL ERP SYSTEM",
        login_title: "Login",
        lbl_username: "Username",
        ph_username: "Enter username",
        lbl_password: "Password",
        ph_password: "Enter password",
        role_title: "Login As",
        role_student: "Student",
        role_teacher: "Teacher",
        role_admin: "Admin",
        btn_login: "Login",
        msg_fill_fields: "Please fill in all fields.",
        msg_logging_in: "Logging in as ",
        msg_login_success: "Login Successful! Welcome ",
        msg_login_failed: "Invalid credentials.",
        msg_server_error: "Server connection error. Please try again."
    }
};

// Default language state set to Marathi ('mr')
let currentLang = localStorage.getItem('appLanguage') || 'mr';

// Global toggle function bound to button onclick
function toggleLanguage() {
    currentLang = currentLang === 'mr' ? 'en' : 'mr';
    localStorage.setItem('appLanguage', currentLang);
    applyLanguage(currentLang);
}

// Function to apply active language to DOM elements
function applyLanguage(lang) {
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
        langBtn.innerText = loginTranslations[lang].lang_btn;
    }

    // Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (loginTranslations[lang] && loginTranslations[lang][key]) {
            element.innerText = loginTranslations[lang][key];
        }
    });

    // Update placeholders for elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (loginTranslations[lang] && loginTranslations[lang][key]) {
            element.placeholder = loginTranslations[lang][key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => { 
    // Apply default language (Marathi) on load
    applyLanguage(currentLang);

    // Default selected role
    let selectedRole = 'student';

    const loginForm = document.getElementById('loginForm');
    const messageElement = document.getElementById('message');
    const rolesContainer = document.querySelector('.roles');

    // 1. Role Selection Event Delegation (Click Handler)
    if (rolesContainer) {
        rolesContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.role');
            if (!button) return;

            e.preventDefault();

            // Remove active class from all role buttons
            document.querySelectorAll('.roles .role').forEach(btn => btn.classList.remove('active'));

            // Highlight the clicked role button
            button.classList.add('active');

            // Capture data-role attribute (fallback to button text)
            const roleAttr = button.getAttribute('data-role');
            if (roleAttr) {
                selectedRole = roleAttr.toLowerCase().trim();
            } else {
                selectedRole = button.innerText.toLowerCase().trim();
            }

            console.log("Active login role set to:", selectedRole);
        });
    }

    // 2. Form Submission Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            // Input validation check
            if (!username || !password) {
                if (messageElement) {
                    messageElement.innerText = loginTranslations[currentLang].msg_fill_fields;
                    messageElement.style.color = "red";
                }
                return;
            }

            if (messageElement) {
                const loggingInPrefix = loginTranslations[currentLang].msg_logging_in;
                messageElement.innerText = currentLang === 'mr' ? `${loggingInPrefix} (${selectedRole})...` : `${loggingInPrefix} ${selectedRole}...`;
                messageElement.style.color = "#0056b3";
            }

            try {
                // Send authentication request to Python Flask backend
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        role: selectedRole
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    if (messageElement) {
                        messageElement.innerText = `${loginTranslations[currentLang].msg_login_success}${data.user.name || ''}`;
                        messageElement.style.color = "green";
                    }

                    // Save session details to LocalStorage
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    localStorage.setItem('userRole', data.role);

                    // Redirect to corresponding dashboard page after 1 second
                    setTimeout(() => {
                        window.location.href = `${data.role}_dashboard.html`;
                    }, 1000);

                } else {
                    if (messageElement) {
                        messageElement.innerText = data.message || loginTranslations[currentLang].msg_login_failed;
                        messageElement.style.color = "red";
                    }
                }
            } catch (error) {
                console.error('Login backend connection error:', error);
                if (messageElement) {
                    messageElement.innerText = loginTranslations[currentLang].msg_server_error;
                    messageElement.style.color = "red";
                }
            }
        });
    }
});
