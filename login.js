// Backend API base URL
const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

document.addEventListener('DOMContentLoaded', () => { 
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
                    messageElement.innerText = "Please fill in all fields.";
                    messageElement.style.color = "red";
                }
                return;
            }

            if (messageElement) {
                messageElement.innerText = `Logging in as ${selectedRole}...`;
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
                        messageElement.innerText = `Login Successful! Welcome ${data.user.name || ''}`;
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
                        messageElement.innerText = data.message || "Invalid credentials.";
                        messageElement.style.color = "red";
                    }
                }
            } catch (error) {
                console.error('Login backend connection error:', error);
                if (messageElement) {
                    messageElement.innerText = "Server connection error. Please try again.";
                    messageElement.style.color = "red";
                }
            }
        });
    }
});
