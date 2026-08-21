const API_URL = "https://swami-vivekanand-erp-backend2-6.onrender.com";

let globalStudents = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (window.location.pathname.includes("teacher-dashboard.html")) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const username = currentUser.username || "dilip1";
        await loadTeacherDashboard(username);
    }
});

async function loadTeacherDashboard(username) {
    try {
        const res = await fetch(`${API_URL}/api/teacher-dashboard/${username}`);
        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Error loading teacher dashboard");
            return;
        }

        // Populate Profile
        document.getElementById("profName").textContent = data.teacher.name || "N/A";
        document.getElementById("profEdu").textContent = data.teacher.education || "N/A";
        document.getElementById("profRole").textContent = data.teacher.role || "Teacher";

        globalStudents = data.students || [];
        renderTable();
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

function renderTable() {
    const tbody = document.getElementById("studentTableBody");
    const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
    const sortBy = document.getElementById("sortSelect")?.value || "roll";

    if (!tbody) return;

    let students = globalStudents.filter(s => 
        (s.name || "").toLowerCase().includes(search) || 
        (s.roll_no || "").toString().includes(search)
    );

    if (sortBy === "name") students.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "roll") students.sort((a, b) => a.roll_no - b.roll_no);
    if (sortBy === "marks") students.sort((a, b) => (b.exam_marks || 0) - (a.exam_marks || 0));

    tbody.innerHTML = "";

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">No student records found.</td></tr>`;
        return;
    }

    students.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.roll_no}</td>
                <td><strong>${s.name}</strong></td>
                <td>
                    <select id="att_${s.username}">
                        <option value="Present" ${s.attendance === 'Present' ? 'selected' : ''}>Present</option>
                        <option value="Absent" ${s.attendance === 'Absent' ? 'selected' : ''}>Absent</option>
                    </select>
                </td>
                <td><input type="number" class="mark-input" id="ut1_${s.username}" value="${s.ut1_marks || 0}" min="0" max="20" style="width:50px;"></td>
                <td><input type="number" class="mark-input" id="ut2_${s.username}" value="${s.ut2_marks || 0}" min="0" max="20" style="width:50px;"></td>
                <td><input type="number" class="mark-input" id="ass_${s.username}" value="${s.assignment_marks || 0}" min="0" max="10" style="width:50px;"></td>
                <td><input type="number" class="mark-input" id="oral_${s.username}" value="${s.oral_marks || 0}" min="0" max="10" style="width:50px;"></td>
                <td><input type="number" class="mark-input" id="final_${s.username}" value="${s.exam_marks || 0}" min="0" max="40" style="width:50px;"></td>
                <td><button class="tab-btn" style="padding: 4px 8px;" onclick="saveRecord('${s.username}')">Save</button></td>
            </tr>
        `;
    });
}

async function saveRecord(username) {
    const att = document.getElementById(`att_${username}`).value;
    const ut1 = document.getElementById(`ut1_${username}`).value;
    const ut2 = document.getElementById(`ut2_${username}`).value;
    const ass = document.getElementById(`ass_${username}`).value;
    const oral = document.getElementById(`oral_${username}`).value;
    const finalExam = document.getElementById(`final_${username}`).value;

    try {
        const res = await fetch(`${API_URL}/api/update-records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                attendance: att,
                ut1_marks: ut1,
                ut2_marks: ut2,
                assignment_marks: ass,
                oral_marks: oral,
                exam_marks: finalExam
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Record updated successfully!");
        } else {
            alert("Error saving record: " + data.message);
        }
    } catch (err) {
        console.error("Save Error:", err);
        alert("Server error while updating student marks.");
    }
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    
    const target = document.getElementById(tabId);
    if (target) target.style.display = "block";
    
    event.currentTarget.classList.add("active");
}
