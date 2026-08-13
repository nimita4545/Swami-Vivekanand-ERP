let selectedRole = "student";

const API_URL = "https://swami-vivekanand-erp-backend2-2.onrender.com";


// Select Student / Teacher / Admin
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


// Login form
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");


    if (username === "" || password === "") {

        message.textContent =
            "Please enter username and password.";

        message.className = "message error";

        return;
    }


    message.textContent = "Checking login...";
    message.className = "message";


    try {

        const response = await fetch(
            `${API_URL}/api/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: selectedRole
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            message.textContent =
                result.message || "Invalid login details.";

            message.className = "message error";

            return;
        }


        message.textContent =
            "Login successful. Welcome, " + result.name + "!";

        message.className = "message success";


    } catch (error) {

        console.error("Login error:", error);

        message.textContent =
            "Unable to connect to the server.";

        message.className = "message error";
    }

});
