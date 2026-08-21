// Define your deployed backend API URL
const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-11.onrender.com';

document.addEventListener('DOMContentLoaded', () => { 
    // Default role state matches the default active HTML button
    let selectedRole = 'student';

    const roleButtons = document.querySelectorAll('.roles .role');
    const loginForm = document.getElementById('loginForm');
    const messageElement = document.getElementById('message');

    // 1. Role Selection Click Handler
    roleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any form submission side-effects
            
            // Remove 'active' class from all role buttons
            roleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Highlight the clicked button
            button.classList.add('active');
            
            // Read data-role ('student', 'teacher', or 'admin')
            selectedRole = button.getAttribute('data-role');
            console.log("Selected Role updated to:", selectedRole);
        });
    });

    // 2. Form Submission Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            messageElement.innerText = "Please fill in all fields.";
            messageElement.style.color = "red";
            return;
        }

        messageElement.innerText = "Logging in...";
        messageElement.style.color = "#0056b3";

        try {
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
                messageElement.innerText = `Login Successful! Welcome ${data.user.name}`;
                messageElement.style.color = "green";

                // Save session info
                localStorage.setItem('userData', JSON.stringify(data.user));
                localStorage.setItem('userRole', data.role);

                // Redirect based on selected role
                setTimeout(() => {
                    window.location.href = `${data.role}_dashboard.html`;
                }, 1000);

            } else {
                messageElement.innerText = data.message || "Invalid credentials.";
                messageElement.style.color = "red";
            }
        } catch (error) {
            console.error('Error connecting to backend:', error);
            messageElement.innerText = "Server connection error.";
            messageElement.style.color = "red";
        }
    });
});
