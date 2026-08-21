let selectedRole = "student";

// Base API URL for your updated Render deployment
const API_URL = "https://swami-vivekanand-erp-backend2-6.onrender.com";

// ==========================================
// 1. LOGIN FORM LOGIC (FOR INDEX / LOGIN PAGE)
// ==========================================
const roleButtons = document.querySelectorAll(".role");

if (roleButtons.length > 0) {
    roleButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            roleButtons.forEach(function(btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            selectedRole = button.getAttribute("data-role");
        });
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
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
            localStorage.setItem("loggedInUser", result.username);

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
}

// ==========================================
// 2. TEACHER DASHBOARD LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // Check if on teacher dashboard page
    if (window.location.pathname.includes("teacher-dashboard.html")) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const username = currentUser.username || localStorage.getItem("loggedInUser") || "dilip1";

        await loadTeacherDashboard(username);
    }
});

async function loadTeacherDashboard(username) {
    try {
        const response = await fetch(`${API_URL}/api/teacher-students/${username}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(result.message || "Failed to load teacher dashboard data.");
            return;
        }

        // Update header & assigned class info
        const teacherHeader = document.getElementById("teacherHeader");
        const classAssignedText = document.getElementById("classAssignedText");

        if (teacherHeader) {
            teacherHeader.textContent = `Welcome, ${result.teacherName}`;
        }
        if (classAssignedText) {
            classAssignedText.textContent = `Class Assigned: ${result.classAssigned}`;
        }

        // Populate table with students
        const tbody = document.getElementById("studentTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!result.students || result.students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No students found for this class.</td></tr>`;
            return;
        }

        result.students.forEach((student) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student["Roll No"] || "-"}</td>
                <td>${student["Student Name"] || "-"}</td>
                <td>${student["School ID"] || "-"}</td>
                <td>${student["Father Name"] || "-"}</td>
                <td>${student["Mother Name"] || "-"}</td>
                <td>${student["Class"]} - ${student["Div"]}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading teacher dashboard:", error);
    }
}

// Client-side search filter for table
function filterStudents() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll("#studentTableBody tr");

    rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}
