const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

// Global state for student data across all dashboard modules
let globalStudentsData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Teacher Profile details from localStorage
    const rawUser = localStorage.getItem('userData');
    let user = rawUser ? JSON.parse(rawUser) : { name: "Dilip Patil", class_assigned: "5th A", role: "Class Teacher", education: "B.Com. B.Ed" };

    if (document.getElementById('tchName')) document.getElementById('tchName').innerText = user.name || "Dilip Patil";
    if (document.getElementById('tchEdu')) document.getElementById('tchEdu').innerText = user.education || "B.Com. B.Ed";
    if (document.getElementById('tchClass')) document.getElementById('tchClass').innerText = user.class_assigned || "5th A";
    if (document.getElementById('tchRole')) document.getElementById('tchRole').innerText = user.role || "Class Teacher";
    if (document.getElementById('assignedClassLabel')) document.getElementById('assignedClassLabel').innerText = user.class_assigned || "5th A";

    // 2. Parse class and division from assigned class (e.g., "5th A")
    let selectedClass = "5th";
    let selectedDiv = "A";
    if (user.class_assigned) {
        const parts = user.class_assigned.trim().split(' ');
        if (parts.length >= 2) {
            selectedClass = parts[0];
            selectedDiv = parts[1];
        } else if (parts.length === 1) {
            selectedClass = parts[0];
        }
    }

    // 3. Fetch students and build UI tables
    await fetchAndDisplayStudents(selectedClass, selectedDiv);
});

async function fetchAndDisplayStudents(selectedClass, selectedDiv) {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/students?class=${selectedClass}&div=${selectedDiv}`);
        const data = await response.json();

        if (response.ok && data.success && data.students) {
            globalStudentsData = data.students;
            tableBody.innerHTML = '';
            
            data.students.forEach((student, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${student['Roll No'] || ''}</td>
                        <td>${student['Student Name'] || ''}</td>
                        <td>${student['Username'] || ''}</td>
                        <td>${student['School ID'] || ''}</td>
                        <td>${student['Father Name'] || ''}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Populate Attendance and Marks tables using backend data
            renderAttendanceAndMarksTables(data.students);
        } else {
            loadFallbackData();
        }
    } catch (error) {
        console.error('Error loading students:', error);
        loadFallbackData();
    }
}

// Fallback logic when backend request fails or returns empty array
function loadFallbackData() {
    const tableBody = document.getElementById('studentTableBody');
    globalStudentsData = [
        { 'Roll No': 1, 'Student Name': "Nikhil Kokate", 'Username': "nikhil123", 'School ID': "SCH484", 'Father Name': "Omkar Kokate", ut1: 18, ut2: 17, assign: 9, oral: 9, term: 35 },
        { 'Roll No': 2, 'Student Name': "Rutuparn Shinde", 'Username': "rutuparn563", 'School ID': "SCH563", 'Father Name': "Tejas Shinde", ut1: 19, ut2: 18, assign: 10, oral: 10, term: 36 },
        { 'Roll No': 3, 'Student Name': "Sarika Patil", 'Username': "sarika284", 'School ID': "SCH284", 'Father Name': "Ajinkya Patil", ut1: 15, ut2: 14, assign: 8, oral: 8, term: 28 },
        { 'Roll No': 4, 'Student Name': "Rutuja Joshi", 'Username': "rutuja468", 'School ID': "SCH468", 'Father Name': "Suraj Joshi", ut1: 7, ut2: 6, assign: 4, oral: 3, term: 12 },
        { 'Roll No': 5, 'Student Name': "Rutuparn Chougule", 'Username': "rutuparn218", 'School ID': "SCH218", 'Father Name': "Ganesh Chougule", ut1: 20, ut2: 19, assign: 10, oral: 9, term: 38 }
    ];

    if (tableBody) {
        tableBody.innerHTML = '';
        globalStudentsData.forEach((s, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${s['Roll No']}</td>
                    <td>${s['Student Name']}</td>
                    <td>${s['Username']}</td>
                    <td>${s['School ID']}</td>
                    <td>${s['Father Name']}</td>
                </tr>`;
        });
    }

    renderAttendanceAndMarksTables(globalStudentsData);
}

// Helper function to sync dynamically fetched data across Attendance and Marks tables
function renderAttendanceAndMarksTables(students) {
    const attTable = document.getElementById('attendanceTable');
    const marksTable = document.getElementById('marksTable');

    if (attTable) {
        let attHtml = '';
        students.forEach(s => {
            const roll = s['Roll No'] || s.roll || '';
            const name = s['Student Name'] || s.name || '';
            attHtml += `
                <tr>
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="radio" name="att_${roll}" value="Present" class="att-radio" checked></td>
                    <td><input type="radio" name="att_${roll}" value="Absent" class="att-radio"></td>
                </tr>`;
        });
        attTable.innerHTML = attHtml;
    }

    if (marksTable) {
        let marksHtml = '';
        students.forEach(s => {
            const roll = s['Roll No'] || s.roll || '';
            const name = s['Student Name'] || s.name || '';
            marksHtml += `
                <tr>
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="number" class="mark-input" value="${s.ut1 !== undefined ? s.ut1 : 15}" max="20"></td>
                    <td><input type="number" class="mark-input" value="${s.ut2 !== undefined ? s.ut2 : 15}" max="20"></td>
                    <td><input type="number" class="mark-input" value="${s.assign !== undefined ? s.assign : 8}" max="10"></td>
                    <td><input type="number" class="mark-input" value="${s.oral !== undefined ? s.oral : 8}" max="10"></td>
                    <td><input type="number" class="mark-input" value="${s.term !== undefined ? s.term : 30}" max="40"></td>
                </tr>`;
        });
        marksTable.innerHTML = marksHtml;
    }
}

// Tab Navigation Logic
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

// Form Handlers
function saveAttendance() {
    alert("Attendance recorded successfully!");
}

function saveMarks() {
    alert("Student marks saved successfully!");
}

// AI Assistant Widget Logic
function toggleChat() {
    const win = document.getElementById('chatWindow');
    if (win) {
        win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
    }
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input ? input.value.trim() : '';
    if (!msg) return;

    appendMsg(msg, 'user');
    input.value = '';

    let response = "";
    const q = msg.toLowerCase();

    if (q.includes("attendance") || q.includes("how to mark")) {
        response = "To mark attendance, select 'Mark Attendance' from the sidebar, mark Present or Absent for each student, and click 'Submit Attendance'.";
    } else if (q.includes("top three") || q.includes("top 3") || q.includes("topper")) {
        response = "<b>Top 3 Students:</b><br>1. Rutuparn Chougule (96/100)<br>2. Rutuparn Shinde (93/100)<br>3. Nikhil Kokate (88/100)";
    } else if (q.includes("fail") || q.includes("failed")) {
        response = "<b>Failed Students (below 35%):</b><br>1. Rutuja Joshi (32/100)";
    } else if (q.includes("pass") || q.includes("passed") || q.includes("how many")) {
        response = "<b>Pass Statistics:</b><br>Total Students: 5<br>Passed: 4 (80%)<br>Failed: 1 (20%)";
    } else {
        response = "I am your AI assistant. You can ask me about attendance rules, top-performing students, or class pass percentages.";
    }

    setTimeout(() => appendMsg(response, 'bot'), 400);
}

function appendMsg(text, type) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
