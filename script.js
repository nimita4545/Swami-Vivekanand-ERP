// Track the selected role ('student', 'teacher', or 'admin')
let selectedRole = 'student'; 

// Live backend Render URL
const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-8.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Role Selector Buttons
    const studentBtn = document.querySelector('#studentBtn') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim().toLowerCase() === 'student');
    const teacherBtn = document.querySelector('#teacherBtn') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim().toLowerCase() === 'teacher');
    const adminBtn = document.querySelector('#adminBtn') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim().toLowerCase() === 'admin');

    if (studentBtn) studentBtn.addEventListener('click', (e) => { e.preventDefault(); selectedRole = 'student'; });
    if (teacherBtn) teacherBtn.addEventListener('click', (e) => { e.preventDefault(); selectedRole = 'teacher'; });
    if (adminBtn) adminBtn.addEventListener('click', (e) => { e.preventDefault(); selectedRole = 'admin'; });

    // 2. Handle Login Form Submission
    const loginForm = document.querySelector('form') || document.querySelector('#loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get username and password from inputs
            const username = document.querySelector('input[type="text"], input[placeholder*="username"]').value.trim();
            const password = document.querySelector('input[type="password"], input[placeholder*="password"]').value.trim();

            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }

            try {
                // Send credentials to backend
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        role: selectedRole
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert(`Welcome ${data.user.name}! Login successful.`);
                    
                    // Save user information locally
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    localStorage.setItem('userRole', data.role);

                    // Redirect based on role
                    window.location.href = `${data.role}_dashboard.html`;
                } else {
                    alert(data.message || 'Invalid username or password.');
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to backend server.');
            }
        });
    }
});
