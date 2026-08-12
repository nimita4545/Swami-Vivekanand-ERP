let selectedRole = "student";


// Select Student / Teacher / Admin
const roleButtons = document.querySelectorAll(".role");

roleButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove active class from all buttons
        roleButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        // Add active class to selected button
        button.classList.add("active");

        // Store selected role
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


    // Check empty fields
    if (username === "" || password === "") {

        message.textContent =
            "Please enter username and password.";

        message.className = "message error";

        return;
    }


    // Show loading message
    message.textContent = "Checking login...";
    message.className = "message";


    try {

        const response = await fetch("/api/login", {

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


        // Login failed
        if (!response.ok) {

            message.textContent =
                result.message || "Invalid login details.";

            message.className = "message error";

            return;
        }


        // Login successful
        message.textContent =
            "Login successful. Welcome, " + result.name + "!";

        message.className = "message success";


    } catch (error) {

        message.textContent =
            "Unable to connect to the server.";

        message.className = "message error";

        console.error(error);
    }

});