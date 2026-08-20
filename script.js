let selectedRole = "student";

// Base API URL for your updated Render deployment
const API_URL = "https://swami-vivekanand-erp-backend2-6.onrender.com";

// Role selection setup
const roleButtons = document.querySelectorAll(".role");

roleButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        roleButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        selectedRole = button.getAttribute("data-role");
    });
});

// Login form submission handler
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (username === "" || password === "") {
        message.textContent = "Please enter username and password.";
        message.className = "message error";
        return;
    }

    message.textContent = "Checking login (Render free instances may take up to 30s to wake up)...";
    message.className = "message";

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                role: selectedRole
            })
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.message || "Invalid login details.";
            message.className = "message error";
            return;
        }

        // Display success message
        message.textContent = `Login successful. Redirecting ${result.name}...`;
        message.className = "message success";

        // Store active session data
        localStorage.setItem("currentUser", JSON.stringify(result));

        // Redirect to user dashboard after 1 second
        setTimeout(() => {
            window.location.href = `${result.role}-dashboard.html`;
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Unable to connect to the server. Please verify your Render URL status.";
        message.className = "message error";
    }
});
