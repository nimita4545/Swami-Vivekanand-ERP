const BASE_URL = 'https://swami-vivekanand-erp-backend2-17.onrender.com';

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

        // SORT BY ROLL NO
        allStudents.sort((a, b) => Number(a.roll_no) - Number(b.roll_no));

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
        // Match the EXACT column names from Supabase
        row.innerHTML = `
            <td>${student.roll_no || (index + 1)}</td>
            <td>${student.student_name || 'N/A'}</td>
            <td>Class ${student.class || '5th'} - ${student.div || ''}</td>
            <td>${student.father_name || 'N/A'}</td>
            <td>${student.school_id || 'N/A'}</td>
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
async function addStudent() {
    const name = document.getElementById('stuName').value.trim();
    const cls = document.getElementById('stuClass').value.trim();
    const roll = document.getElementById('stuRoll').value.trim();
    const id = document.getElementById('stuId').value.trim();

    if (!name || !cls || !roll || !id) {
        alert("Please complete all student fields.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/admin/add-student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, class: cls, roll: roll, id: id })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Student added successfully to the database!");
            // Reset Form Fields
            document.getElementById('stuName').value = '';
            document.getElementById('stuClass').value = '';
            document.getElementById('stuRoll').value = '';
            document.getElementById('stuId').value = '';
            
            // Reload table from database
            await loadAdminStudents();
        } else {
            alert("❌ Failed to add student: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        alert("❌ Network Error: Could not connect to backend.");
    }
}

// ==========================================
// 4. FETCH & DISPLAY ALL TEACHERS
// ==========================================
async function loadAdminTeachers() {
    try {
        const response = await fetch(`${BASE_URL}/api/admin/teachers`);
        const data = await response.json();

        if (data.success && data.teachers) {
            // SORT ALPHABETICALLY BY NAME
            data.teachers.sort((a, b) => (a.teacher_name || "").localeCompare(b.teacher_name || ""));
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
        // Match the EXACT column names from Supabase
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${teacher.teacher_name || 'N/A'}</td>
            <td>${teacher.class_assigned || 'N/A'}</td>
            <td>${teacher.education || 'N/A'}</td>
            <td>${teacher.role || 'Teacher'}</td>
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
async function addTeacher() {
    const name = document.getElementById('tchNameInput').value.trim();
    const cls = document.getElementById('tchClassInput').value.trim();
    const edu = document.getElementById('tchEduInput').value.trim();
    const user = document.getElementById('tchUserInput').value.trim();

    if (!name || !cls || !edu || !user) {
        alert("Please complete all faculty fields.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/admin/add-teacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, class: cls, education: edu, username: user })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Teacher added successfully to the database!");
            // Reset Form Fields
            document.getElementById('tchNameInput').value = '';
            document.getElementById('tchClassInput').value = '';
            document.getElementById('tchEduInput').value = '';
            document.getElementById('tchUserInput').value = '';
            
            // Reload table from database
            await loadAdminTeachers();
        } else {
            alert("❌ Failed to add teacher: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        alert("❌ Network Error: Could not connect to backend.");
    }
}

// ==========================================
// 5. NOTICE BOARD ANNOUNCEMENTS
// ==========================================
async function postNotice() {
    const input = document.getElementById('noticeInput');
    const msg = input.value.trim();
    if (!msg) return;

    try {
        const res = await fetch(`${BASE_URL}/api/admin/post-notice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        
        const data = await res.json();
        
        if (data.success) {
            const list = document.getElementById('noticeList');
            const li = document.createElement('li');
            li.style.cssText = "background: #f4f8fb; padding: 12px; border-left: 4px solid #0055a5; margin-bottom: 10px; border-radius: 4px;";
            
            const today = new Date().toISOString().split('T')[0];
            li.innerHTML = `<strong>[${today}]:</strong> ${msg}`;
            list.prepend(li);
            
            input.value = '';
        } else {
            alert("❌ Failed to post notice: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        alert("❌ Network Error: Could not connect to backend.");
    }
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

async function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input ? input.value.trim() : '';
    if (!msg) return;

    appendMsg(msg, 'user');
    input.value = '';

    const chatBody = document.getElementById('chatBody');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-msg bot';
    loadingDiv.id = 'loadingBubble';
    loadingDiv.innerHTML = '...';
    chatBody.appendChild(loadingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    let userObj = {};
    try { userObj = JSON.parse(localStorage.getItem('userData') || '{}'); } catch (e) { userObj = {}; }
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';

    const context = {
        admin_info: userObj,
        total_students: document.getElementById('totalStudentCount')?.innerText || '0',
        total_teachers: document.getElementById('totalTeacherCount')?.innerText || '0',
        recent_students: [...document.querySelectorAll('#adminStudentTableBody tr')].slice(0, 20).map(r => ({
            roll: r.cells[0]?.innerText, name: r.cells[1]?.innerText,
            class: r.cells[2]?.innerText, school_id: r.cells[4]?.innerText
        })),
        recent_teachers: [...document.querySelectorAll('#adminTeacherTableBody tr')].slice(0, 20).map(r => ({
            name: r.cells[1]?.innerText, class: r.cells[2]?.innerText,
            education: r.cells[3]?.innerText, role: r.cells[4]?.innerText
        })),
        notices: [...document.querySelectorAll('#noticeList li')].slice(0, 5).map(li => li.innerText)
    };

    try {
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'admin', message: msg, lang: lang, user: userObj, context: context })
        });
        
        const data = await res.json();
        const lb = document.getElementById('loadingBubble');
        if (lb) lb.remove();
        
        const reply = (data && data.reply) ? data.reply : 'Sorry, no reply received.';
        appendMsg(reply.replace(/\n/g, '<br>'), 'bot');
    } catch (err) {
        const lb = document.getElementById('loadingBubble');
        if (lb) lb.remove();
        
        const errMsg = lang === 'mr' 
            ? 'क्षमस्व, एआय सहाय्यक सध्या उपलब्ध नाही. कृपया ६० सेकंद थांबा.' 
            : 'Sorry, AI temporarily unavailable. Please wait 60s.';
        appendMsg(errMsg, 'bot');
    }
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
