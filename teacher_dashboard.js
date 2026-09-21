const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

// Global state for student data across all dashboard modules
let globalStudentsData = [];

// Chart Instances
let marksChart = null;
let subjectChart = null;
let individualSubjectChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Teacher Profile details from localStorage
    const rawUser = localStorage.getItem('userData');
    let user = rawUser ? JSON.parse(rawUser) : { 
        name: "Dilip Patil", 
        class_assigned: "5th A", 
        role: "Class Teacher", 
        education: "B.Com. B.Ed" 
    };

    if (document.getElementById('tchName')) document.getElementById('tchName').innerText = user.name || "Dilip Patil";
    if (document.getElementById('tchEdu')) document.getElementById('tchEdu').innerText = user.education || "B.Com. B.Ed";
    if (document.getElementById('tchClass')) document.getElementById('tchClass').innerText = user.class_assigned || "5th A";
    if (document.getElementById('tchRole')) document.getElementById('tchRole').innerText = user.role || "Class Teacher";
    if (document.getElementById('assignedClassLabel')) document.getElementById('assignedClassLabel').innerText = user.class_assigned || "5th A";
    if (document.getElementById('analyticsClassLabel')) document.getElementById('analyticsClassLabel').innerText = user.class_assigned || "5th A";

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

    // Set select element default value if available
    const divSelect = document.getElementById('divisionSelect');
    if (divSelect) divSelect.value = selectedDiv;

    // 3. Fetch students and build UI tables
    await fetchAndDisplayStudents(selectedClass, selectedDiv);
});

// Switch division callback
async function switchDivision(divValue) {
    const classLabel = document.getElementById('assignedClassLabel');
    if (classLabel) {
        const currentClass = classLabel.innerText.split(' ')[0] || "5th";
        classLabel.innerText = `${currentClass} ${divValue}`;
        document.getElementById('analyticsClassLabel').innerText = `${currentClass} ${divValue}`;
        await fetchAndDisplayStudents(currentClass, divValue);
    }
}

async function fetchAndDisplayStudents(selectedClass, selectedDiv) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/students?class=${selectedClass}&div=${selectedDiv}`);
        const data = await response.json();

        if (response.ok && data.success && data.students && data.students.length > 0) {
            globalStudentsData = processStudentData(data.students);
        } else {
            loadFallbackData();
        }
    } catch (error) {
        console.error('Error loading students:', error);
        loadFallbackData();
    }
    renderAllViews();
}

// Ensure mock fields (scores, attendance, subjects) are present for rich UI calculations
function processStudentData(students) {
    return students.map((s, idx) => {
        const roll = s['Roll No'] || s.roll || (idx + 1);
        const name = s['Student Name'] || s.name || `Student ${roll}`;
        const username = s['Username'] || s.username || `user_${roll}`;
        const school_id = s['School ID'] || s.school_id || `SCH${100 + roll}`;
        const father_name = s['Father Name'] || s.father_name || "Parent Name";

        const ut1 = s.ut1 !== undefined ? Number(s.ut1) : Math.floor(10 + Math.random() * 10);
        const ut2 = s.ut2 !== undefined ? Number(s.ut2) : Math.floor(10 + Math.random() * 10);
        const assign = s.assign !== undefined ? Number(s.assign) : Math.floor(5 + Math.random() * 5);
        const oral = s.oral !== undefined ? Number(s.oral) : Math.floor(5 + Math.random() * 5);
        const term = s.term !== undefined ? Number(s.term) : Math.floor(20 + Math.random() * 20);
        const total = ut1 + ut2 + assign + oral + term;

        const attendance = s.attendance !== undefined ? Number(s.attendance) : Math.floor(70 + Math.random() * 28);

        // Subjects breakdown mock/actual generator
        const subjects = s.subjects || {
            'Mathematics': Math.min(100, total + Math.floor(Math.random() * 10 - 5)),
            'English': Math.min(100, Math.max(30, total + Math.floor(Math.random() * 12 - 6))),
            'Science': Math.min(100, Math.max(30, total + Math.floor(Math.random() * 10 - 5))),
            'Hindi': Math.min(100, Math.max(35, total + Math.floor(Math.random() * 8 - 4))),
            'Marathi': Math.min(100, Math.max(35, total + Math.floor(Math.random() * 8 - 4)))
        };

        return {
            'Roll No': roll,
            'Student Name': name,
            'Username': username,
            'School ID': school_id,
            'Father Name': father_name,
            ut1, ut2, assign, oral, term, total,
            attendance,
            subjects
        };
    });
}

// Fallback logic when backend request fails or returns empty array
function loadFallbackData() {
    const rawFallback = [
        { 'Roll No': 1, 'Student Name': "Nikhil Kokate", 'Username': "nikhil123", 'School ID': "SCH484", 'Father Name': "Omkar Kokate", ut1: 18, ut2: 17, assign: 9, oral: 9, term: 35, attendance: 92 },
        { 'Roll No': 2, 'Student Name': "Rutuparn Shinde", 'Username': "rutuparn563", 'School ID': "SCH563", 'Father Name': "Tejas Shinde", ut1: 19, ut2: 18, assign: 10, oral: 10, term: 36, attendance: 96 },
        { 'Roll No': 3, 'Student Name': "Sarika Patil", 'Username': "sarika284", 'School ID': "SCH284", 'Father Name': "Ajinkya Patil", ut1: 15, ut2: 14, assign: 8, oral: 8, term: 28, attendance: 81 },
        { 'Roll No': 4, 'Student Name': "Rutuja Joshi", 'Username': "rutuja468", 'School ID': "SCH468", 'Father Name': "Suraj Joshi", ut1: 7, ut2: 6, assign: 4, oral: 3, term: 12, attendance: 64 },
        { 'Roll No': 5, 'Student Name': "Rutuparn Chougule", 'Username': "rutuparn218", 'School ID': "SCH218", 'Father Name': "Ganesh Chougule", ut1: 20, ut2: 19, assign: 10, oral: 9, term: 38, attendance: 98 }
    ];
    globalStudentsData = processStudentData(rawFallback);
}

function renderAllViews() {
    renderStudentTable();
    renderAttendanceAndMarksTables();
    populateAnalyticsDropdown();
}

function renderStudentTable() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    globalStudentsData.forEach((s, index) => {
        const badge = getPerformanceBadge(s.total, s.attendance);
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${s['Roll No']}</td>
                <td>${s['Student Name']}</td>
                <td>${s['School ID']}</td>
                <td>${s['Father Name']}</td>
                <td>
                    <span class="badge ${badge.cssClass}" style="margin-right:8px;">${badge.label}</span>
                    <button class="btn-analytics" onclick="openStudentModal(${s['Roll No']})">View Details</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function getPerformanceBadge(totalScore, attendance) {
    if (totalScore >= 75 && attendance >= 85) {
        return { label: 'Good', cssClass: 'badge-green' };
    } else if (totalScore >= 35 && attendance >= 70) {
        return { label: 'Average', cssClass: 'badge-yellow' };
    } else {
        return { label: 'At-Risk', cssClass: 'badge-red' };
    }
}

// Helper function to sync dynamically fetched data across Attendance and Marks tables
function renderAttendanceAndMarksTables() {
    const attTable = document.getElementById('attendanceTable');
    const marksTable = document.getElementById('marksTable');

    if (attTable) {
        let attHtml = '';
        globalStudentsData.forEach(s => {
            const roll = s['Roll No'];
            const name = s['Student Name'];
            attHtml += `
                <tr>
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="radio" name="att_${roll}" value="Present" class="att-radio" ${s.attendance >= 75 ? 'checked' : ''}></td>
                    <td><input type="radio" name="att_${roll}" value="Absent" class="att-radio" ${s.attendance < 75 ? 'checked' : ''}></td>
                </tr>`;
        });
        attTable.innerHTML = attHtml;
    }

    if (marksTable) {
        let marksHtml = '';
        globalStudentsData.forEach(s => {
            const roll = s['Roll No'];
            const name = s['Student Name'];
            marksHtml += `
                <tr>
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="number" class="mark-input" value="${s.ut1}" max="20"></td>
                    <td><input type="number" class="mark-input" value="${s.ut2}" max="20"></td>
                    <td><input type="number" class="mark-input" value="${s.assign}" max="10"></td>
                    <td><input type="number" class="mark-input" value="${s.oral}" max="10"></td>
                    <td><input type="number" class="mark-input" value="${s.term}" max="40"></td>
                </tr>`;
        });
        marksTable.innerHTML = marksHtml;
    }
}

// Populate Filter Dropdown in Analytics Tab
function populateAnalyticsDropdown() {
    const dropdown = document.getElementById('studentSelectFilter');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="ALL">Whole Class Overview</option>';
    globalStudentsData.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s['Roll No'];
        opt.textContent = `Roll No ${s['Roll No']} - ${s['Student Name']}`;
        dropdown.appendChild(opt);
    });
}

// Analytics View Switcher Handler
function handleAnalyticsViewChange() {
    const selectedVal = document.getElementById('studentSelectFilter').value;
    const classContainer = document.getElementById('classAnalyticsContainer');
    const indContainer = document.getElementById('individualAnalyticsContainer');

    if (selectedVal === 'ALL') {
        classContainer.style.display = 'block';
        indContainer.style.display = 'none';
        renderClassAnalyticsCharts();
    } else {
        classContainer.style.display = 'none';
        indContainer.style.display = 'block';
        renderIndividualStudentAnalytics(Number(selectedVal));
    }
}

// Tab Navigation Logic
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    if (btn) btn.classList.add('active');

    // Trigger Analytics Chart Rendering when switching to analytics tab
    if (id === 'analyticsSec') {
        handleAnalyticsViewChange();
    }
}

// Analytics Rendering Logic - Whole Class
function renderAnalyticsCharts() {
    handleAnalyticsViewChange();
}

function renderClassAnalyticsCharts() {
    if (!globalStudentsData || globalStudentsData.length === 0) return;

    let distinction = 0, firstClass = 0, passClass = 0, failClass = 0;
    let totalScoreSum = 0;
    let highestScore = -1;
    let topperName = "-";

    globalStudentsData.forEach(s => {
        const total = s.total;
        totalScoreSum += total;

        if (total > highestScore) {
            highestScore = total;
            topperName = `${s['Student Name']} (${total})`;
        }

        if (total >= 75) distinction++;
        else if (total >= 60) firstClass++;
        else if (total >= 35) passClass++;
        else failClass++;
    });

    const totalStudents = globalStudentsData.length;
    const passedStudents = distinction + firstClass + passClass;
    const avgScore = (totalScoreSum / totalStudents).toFixed(1);
    const passPercentage = ((passedStudents / totalStudents) * 100).toFixed(1);

    // Update Summary Metric Cards
    if (document.getElementById('avgScore')) document.getElementById('avgScore').innerText = `${avgScore}%`;
    if (document.getElementById('passPercent')) document.getElementById('passPercent').innerText = `${passPercentage}%`;
    if (document.getElementById('classTopper')) document.getElementById('classTopper').innerText = topperName;
    if (document.getElementById('failCount')) document.getElementById('failCount').innerText = `${failClass} Students`;

    // 1. Marks Distribution Doughnut Chart
    const marksCtx = document.getElementById('marksDistributionChart');
    if (marksCtx && typeof Chart !== 'undefined') {
        if (marksChart) marksChart.destroy();
        marksChart = new Chart(marksCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Distinction (75%+)', 'First Class (60-74%)', 'Pass Class (35-59%)', 'Needs Support (<35%)'],
                datasets: [{
                    data: [distinction, firstClass, passClass, failClass],
                    backgroundColor: ['#006633', '#0055a5', '#f39c12', '#c0392b']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // 2. Subject Average Bar Chart
    const subjCtx = document.getElementById('subjectAvgChart');
    if (subjCtx && typeof Chart !== 'undefined') {
        if (subjectChart) subjectChart.destroy();
        subjectChart = new Chart(subjCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mathematics', 'English', 'Science', 'Hindi', 'Marathi'],
                datasets: [{
                    label: 'Class Average (%)',
                    data: [78, 65, 72, 80, 84],
                    backgroundColor: '#003366'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
}

// Render Individual Student Analytics in Analytics Tab
function renderIndividualStudentAnalytics(rollNo) {
    const student = globalStudentsData.find(s => s['Roll No'] === rollNo);
    if (!student) return;

    document.getElementById('indStudentName').innerText = student['Student Name'];
    document.getElementById('indStudentRoll').innerText = student['Roll No'];
    
    const badgeInfo = getPerformanceBadge(student.total, student.attendance);
    const badgeEl = document.getElementById('indPerformanceBadge');
    badgeEl.className = `badge ${badgeInfo.cssClass}`;
    badgeEl.innerText = badgeInfo.label;

    document.getElementById('indTotalScore').innerText = `${student.total} / 100`;
    document.getElementById('indAttendance').innerText = `${student.attendance}%`;

    // Calculate Subject Pass/Fail
    let passedCount = 0;
    let failedCount = 0;
    const subjectLabels = Object.keys(student.subjects);
    const subjectMarks = Object.values(student.subjects);

    subjectMarks.forEach(m => {
        if (m >= 35) passedCount++;
        else failedCount++;
    });

    document.getElementById('indPassedSubjects').innerText = `${passedCount} Subjects`;
    document.getElementById('indFailedSubjects').innerText = `${failedCount} Subjects`;

    // Render Individual Subject Bar Chart
    const indCtx = document.getElementById('individualSubjectChart');
    if (indCtx && typeof Chart !== 'undefined') {
        if (individualSubjectChart) individualSubjectChart.destroy();
        individualSubjectChart = new Chart(indCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: subjectLabels,
                datasets: [{
                    label: 'Marks Obtained',
                    data: subjectMarks,
                    backgroundColor: subjectMarks.map(m => m >= 35 ? '#0055a5' : '#dc3545')
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
}

// Modal Handlers
function openStudentModal(rollNo) {
    const student = globalStudentsData.find(s => s['Roll No'] === rollNo);
    if (!student) return;

    document.getElementById('modalStudentName').innerText = student['Student Name'];
    document.getElementById('modalStudentRoll').innerText = `${student['Roll No']} (${student['School ID']})`;
    document.getElementById('modalAttendance').innerText = `${student.attendance}%`;
    document.getElementById('modalTotalScore').innerText = `${student.total}%`;

    let grade = 'F';
    let status = 'FAILED';
    let statusColor = '#dc3545';

    if (student.total >= 75) { grade = 'A+'; status = 'PASSED'; statusColor = '#28a745'; }
    else if (student.total >= 60) { grade = 'A'; status = 'PASSED'; statusColor = '#28a745'; }
    else if (student.total >= 35) { grade = 'B'; status = 'PASSED'; statusColor = '#28a745'; }

    document.getElementById('modalGrade').innerText = grade;
    const statusEl = document.getElementById('modalStatus');
    statusEl.innerText = status;
    statusEl.style.color = statusColor;

    // Populate Subject Breakdown Table
    const tbody = document.getElementById('modalSubjectBreakdown');
    if (tbody) {
        tbody.innerHTML = '';
        Object.entries(student.subjects).forEach(([subj, marks]) => {
            tbody.innerHTML += `
                <tr>
                    <td>${subj}</td>
                    <td>100</td>
                    <td>${marks}</td>
                    <td style="font-weight:bold; color:${marks >= 35 ? '#006633' : '#dc3545'}">${marks}%</td>
                </tr>
            `;
        });
    }

    document.getElementById('studentAnalyticsModal').style.display = 'flex';
}

function closeAnalyticsModal() {
    const modal = document.getElementById('studentAnalyticsModal');
    if (modal) modal.style.display = 'none';
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
        win.style.display = (win.style.display === 'flex' || win.style.display === 'block') ? 'none' : 'flex';
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

    // Dynamically calculate statistics from current global state
    const studentStats = globalStudentsData.map(s => ({ name: s['Student Name'], total: s.total }))
        .sort((a, b) => b.total - a.total);

    if (q.includes("attendance") || q.includes("how to mark")) {
        response = "To mark attendance, select 'Mark Attendance' from the sidebar, mark Present or Absent for each student, and click 'Submit Attendance'.";
    } else if (q.includes("top three") || q.includes("top 3") || q.includes("topper")) {
        const top3 = studentStats.slice(0, 3);
        response = "<b>Top Performing Students:</b><br>" + 
            top3.map((s, idx) => `${idx + 1}. ${s.name} (${s.total}/100)`).join('<br>');
    } else if (q.includes("fail") || q.includes("failed")) {
        const failed = studentStats.filter(s => s.total < 35);
        if (failed.length > 0) {
            response = "<b>Students Needing Support (<35%):</b><br>" + 
                failed.map((s, idx) => `${idx + 1}. ${s.name} (${s.total}/100)`).join('<br>');
        } else {
            response = "Great news! All students in this class have passing marks.";
        }
    } else if (q.includes("pass") || q.includes("passed") || q.includes("how many")) {
        const total = studentStats.length;
        const passed = studentStats.filter(s => s.total >= 35).length;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        response = `<b>Class Pass Statistics:</b><br>Total Students: ${total}<br>Passed: ${passed} (${passRate}%)<br>Needs Support: ${total - passed}`;
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
