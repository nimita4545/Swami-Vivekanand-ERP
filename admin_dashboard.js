const BASE_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

// ==========================================
// 1. INITIALIZATION & SESSION MANAGEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
    loadAdminStudents();
    loadAdminTeachers();
});

function initUserSession() {
    const rawUser = localStorage.getItem('userData');
    let user = rawUser ? JSON.parse(rawUser) : { name: "Admin Staff", designation: "System Administrator" };

    const admNameEl = document.getElementById('admName');
    const admRoleEl = document.getElementById('admRole');

    if (admNameEl) admNameEl.innerText = user.name || "Admin Staff";
    if (admRoleEl) admRoleEl.innerText = user.designation || "System Administrator";
}

// ==========================================
// 2. TAB NAVIGATION & LOGOUT
// ==========================================
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    if (btn) btn.classList.add('active');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ==========================================
// 3. FETCH & DISPLAY ALL STUDENTS (5th A, B, C)
// ==========================================
async function loadAdminStudents() {
    const divisions = ['A', 'B', 'C'];

    try {
        const fetchPromises = divisions.map(div =>
            fetch(`${BASE_URL}/api/teacher/students?class=5th&div=${div}`)
                .then(res => res.json())
        );

        const results = await Promise.all(fetchPromises);
        const allStudents = results.flatMap(res => res.students || []);

        renderStudentTable(allStudents);
    } catch (error) {
        console.error('Error fetching admin student list:', error);
    }
}

function renderStudentTable(students) {
    const tableBody = document.getElementById('adminStudentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student['Roll No'] || student.roll_no || (index + 1)}</td>
            <td>${student['Student Name'] || student.name || 'N/A'}</td>
            <td>Class ${student['Class'] || '5th'} - ${student['Div'] || ''}</td>
            <td>${student['Father Name'] || 'N/A'}</td>
            <td>${student['School ID'] || student.id || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });

    updateStudentCount(students.length);
}

function updateStudentCount(count) {
    const totalStudentBadge = document.getElementById('totalStudentCount');
    if (totalStudentBadge) {
        totalStudentBadge.innerText = count;
    }
}

// Register Student Form Handler
function addStudent() {
    const name = document.getElementById('stuName').value.trim();
    const cls = document.getElementById('stuClass').value.trim();
    const roll = document.getElementById('stuRoll').value.trim();
    const id = document.getElementById('stuId').value.trim();

    if (!name || !cls || !roll || !id) {
        alert("Please complete all student fields.");
        return;
    }

    const tbody = document.getElementById('adminStudentTableBody');
    if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${roll}</td>
            <td>${name}</td>
            <td>${cls}</td>
            <td>N/A</td>
            <td>${id}</td>
        `;
        tbody.prepend(tr);

        // Update counts dynamically
        const currentCount = tbody.children.length;
        updateStudentCount(currentCount);
    }

    // Reset Form Fields
    document.getElementById('stuName').value = '';
    document.getElementById('stuClass').value = '';
    document.getElementById('stuRoll').value = '';
    document.getElementById('stuId').value = '';
}

// ==========================================
// 4. FETCH & DISPLAY ALL TEACHERS
// ==========================================
async function loadAdminTeachers() {
    try {
        const response = await fetch(`${BASE_URL}/api/admin/teachers`);
        const data = await response.json();

        if (data.success && data.teachers) {
            renderTeacherTable(data.teachers);
        }
    } catch (error) {
        console.error('Error fetching admin teacher list:', error);
    }
}

function renderTeacherTable(teachers) {
    const tableBody = document.getElementById('adminTeacherTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    teachers.forEach((teacher, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${teacher['Teacher Name'] || teacher.name || 'N/A'}</td>
            <td>${teacher['Class Assigned'] || 'N/A'}</td>
            <td>${teacher['Education'] || 'N/A'}</td>
            <td>${teacher['Role'] || 'Teacher'}</td>
        `;
        tableBody.appendChild(row);
    });

    updateTeacherCount(teachers.length);
}

function updateTeacherCount(count) {
    const totalTeacherBadge = document.getElementById('totalTeacherCount');
    if (totalTeacherBadge) {
        totalTeacherBadge.innerText = count;
    }
}

// Assign Faculty Form Handler
function addTeacher() {
    const name = document.getElementById('tchNameInput').value.trim();
    const cls = document.getElementById('tchClassInput').value.trim();
    const edu = document.getElementById('tchEduInput').value.trim();
    const user = document.getElementById('tchUserInput').value.trim();

    if (!name || !cls || !edu || !user) {
        alert("Please complete all faculty fields.");
        return;
    }

    const tbody = document.getElementById('adminTeacherTableBody');
    if (tbody) {
        const count = tbody.children.length + 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${count}</td>
            <td>${name}</td>
            <td>${cls}</td>
            <td>${edu}</td>
            <td>Teacher</td>
        `;
        tbody.prepend(tr);

        // Update counts dynamically
        updateTeacherCount(tbody.children.length);
    }

    // Reset Form Fields
    document.getElementById('tchNameInput').value = '';
    document.getElementById('tchClassInput').value = '';
    document.getElementById('tchEduInput').value = '';
    document.getElementById('tchUserInput').value = '';
}

// ==========================================
// 5. NOTICE BOARD ANNOUNCEMENTS
// ==========================================
function postNotice() {
    const input = document.getElementById('noticeInput');
    const msg = input.value.trim();
    if (!msg) return;

    const list = document.getElementById('noticeList');
    if (list) {
        const li = document.createElement('li');
        li.style.cssText = "background: #f4f8fb; padding: 12px; border-left: 4px solid #0055a5; margin-bottom: 10px; border-radius: 4px;";
        
        const today = new Date().toISOString().split('T')[0];
        li.innerHTML = `<strong>[${today}]:</strong> ${msg}`;
        list.prepend(li);
    }

    input.value = '';
}

// ==========================================
// 6. AI ADMIN ASSISTANT CHATBOT WIDGET
// ==========================================
function toggleChat() {
    const win = document.getElementById('chatWindow');
    if (win) {
        win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
    }
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    appendMsg(msg, 'user');
    input.value = '';

    let response = "";
    const q = msg.toLowerCase();

    const studentCount = document.getElementById('totalStudentCount')?.innerText || '0';
    const teacherCount = document.getElementById('totalTeacherCount')?.innerText || '0';

    if (q.includes("student") || q.includes("admission")) {
        response = `There are currently ${studentCount} registered students dynamically fetched across standard 5th divisions.`;
    } else if (q.includes("teacher") || q.includes("staff") || q.includes("faculty")) {
        response = `There are currently ${teacherCount} active teaching staff details dynamically loaded from your faculty records.`;
    } else if (q.includes("notice") || q.includes("announcement")) {
        response = "You can publish real-time notices under the 'School Notice Board' tab.";
    } else {
        response = "I am your Admin Assistant. I can assist you with system stats, faculty records, and student directory queries.";
    }

    setTimeout(() => appendMsg(response, 'bot'), 400);
}

function appendMsg(text, type) {
    const body = document.getElementById('chatBody');
    if (body) {
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;
        div.innerHTML = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }
}
