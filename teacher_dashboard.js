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

    // 2. Parse class and division from assigned class
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

    // Set UI select defaults
    const classSelect = document.getElementById('classSelect');
    const divSelect = document.getElementById('divSelect');
    if (classSelect) classSelect.value = selectedClass;
    if (divSelect) divSelect.value = selectedDiv;

    // Attach subject switch handler if subject dropdown exists
    const subjSelect = document.getElementById('subjSelect');
    if (subjSelect) {
        subjSelect.addEventListener('change', renderAttendanceAndMarksTables);
    }

    // 3. Fetch students and build UI tables
    await fetchAndDisplayStudents(selectedClass, selectedDiv);
});

// Class / Division change listener callback
async function onClassDivChange() {
    const classVal = document.getElementById('classSelect')?.value || "5th";
    const divVal = document.getElementById('divSelect')?.value || "A";

    const labelStr = `${classVal} ${divVal}`;
    if (document.getElementById('assignedClassLabel')) {
        document.getElementById('assignedClassLabel').innerText = labelStr;
    }
    if (document.getElementById('analyticsClassLabel')) {
        document.getElementById('analyticsClassLabel').innerText = labelStr;
    }

    await fetchAndDisplayStudents(classVal, divVal);
}

// Legacy support for single division switch calls
async function switchDivision(divValue) {
    if (document.getElementById('divSelect')) document.getElementById('divSelect').value = divValue;
    await onClassDivChange();
}

async function fetchAndDisplayStudents(selectedClass, selectedDiv) {
    const storageKey = `studentsData_${selectedClass}_${selectedDiv}`;
    const savedLocalData = localStorage.getItem(storageKey);

    // Load local storage if present
    if (savedLocalData) {
        console.log("Loading saved data from LocalStorage...");
        globalStudentsData = JSON.parse(savedLocalData);
        renderAllViews();
        return; 
    }

    // Fallback to API call if local storage is empty
    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/students?class=${selectedClass}&div=${selectedDiv}`);
        const data = await response.json();

        if (response.ok && data.success && data.students && data.students.length > 0) {
            globalStudentsData = processStudentData(data.students);
        } else {
            loadFallbackData();
        }
    } catch (error) {
        console.error('Error loading students from API:', error);
        loadFallbackData();
    }

    // Cache initial load to local storage
    saveLocalState(selectedClass, selectedDiv);
    renderAllViews();
}

function saveLocalState(selectedClass, selectedDiv) {
    const cls = selectedClass || document.getElementById('classSelect')?.value || "5th";
    const div = selectedDiv || document.getElementById('divSelect')?.value || "A";
    const storageKey = `studentsData_${cls}_${div}`;
    
    localStorage.setItem(storageKey, JSON.stringify(globalStudentsData));
    console.log(`Saved to local storage under key: ${storageKey}`);
}

function processStudentData(students) {
    return students.map((s, idx) => {
        const roll = s['Roll No'] || s.roll || (idx + 1);
        const name = s['Student Name'] || s.name || `Student ${roll}`;
        const username = s['Username'] || s.username || `user_${roll}`;
        const school_id = s['School ID'] || s.school_id || `SCH${100 + roll}`;
        const father_name = s['Father Name'] || s.father_name || "Parent Name";

        const ut1 = s.ut1 !== undefined ? Number(s.ut1) : 15;
        const ut2 = s.ut2 !== undefined ? Number(s.ut2) : 15;
        const assign = s.assign !== undefined ? Number(s.assign) : 8;
        const oral = s.oral !== undefined ? Number(s.oral) : 8;
        const term = s.term !== undefined ? Number(s.term) : 30;
        const total = ut1 + ut2 + assign + oral + term;

        const attendance = s.attendance !== undefined ? Number(s.attendance) : 85;

        const subjects = s.subjects || {
            'Mathematics': total,
            'English': total,
            'Science': total,
            'Hindi': total,
            'Marathi': total
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
                    <button type="button" class="btn-analytics" onclick="openStudentModal(${s['Roll No']})">View Details</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function getPerformanceBadge(totalScore, attendance) {
    if (totalScore >= 75 && attendance >= 85) return { label: 'Good', cssClass: 'badge-green' };
    else if (totalScore >= 35 && attendance >= 70) return { label: 'Average', cssClass: 'badge-yellow' };
    else return { label: 'At-Risk', cssClass: 'badge-red' };
}

function renderAttendanceAndMarksTables() {
    const attTableBody = document.getElementById('attendanceTableBody') || document.getElementById('attendanceTable');
    const marksTableBody = document.getElementById('marksTableBody') || document.getElementById('marksTable');

    if (attTableBody) {
        let attHtml = '';
        globalStudentsData.forEach(s => {
            const roll = s['Roll No'];
            const name = s['Student Name'];
            const isPresent = s.attendance >= 70;
            attHtml += `
                <tr data-roll="${roll}">
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="radio" name="att_${roll}" value="Present" class="att-radio attendance-checkbox" ${isPresent ? 'checked' : ''}></td>
                    <td><input type="radio" name="att_${roll}" value="Absent" class="att-radio attendance-checkbox" ${!isPresent ? 'checked' : ''}></td>
                    <td><strong class="attendance-value">${s.attendance}%</strong></td>
                </tr>`;
        });
        attTableBody.innerHTML = attHtml;
    }

    if (marksTableBody) {
        let marksHtml = '';
        globalStudentsData.forEach(s => {
            const roll = s['Roll No'];
            const name = s['Student Name'];
            marksHtml += `
                <tr data-roll="${roll}">
                    <td>${roll}</td>
                    <td>${name}</td>
                    <td><input type="number" class="mark-input input-ut1" value="${s.ut1}" min="0" max="20"></td>
                    <td><input type="number" class="mark-input input-ut2" value="${s.ut2}" min="0" max="20"></td>
                    <td><input type="number" class="mark-input input-assign" value="${s.assign}" min="0" max="10"></td>
                    <td><input type="number" class="mark-input input-oral" value="${s.oral}" min="0" max="10"></td>
                    <td><input type="number" class="mark-input input-term" value="${s.term}" min="0" max="40"></td>
                </tr>`;
        });
        marksTableBody.innerHTML = marksHtml;
    }
}

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

function handleAnalyticsViewChange() {
    const selectedVal = document.getElementById('studentSelectFilter')?.value || 'ALL';
    const classContainer = document.getElementById('classAnalyticsContainer');
    const indContainer = document.getElementById('individualAnalyticsContainer');

    if (selectedVal === 'ALL') {
        if (classContainer) classContainer.style.display = 'block';
        if (indContainer) indContainer.style.display = 'none';
        renderClassAnalyticsCharts();
    } else {
        if (classContainer) classContainer.style.display = 'none';
        if (indContainer) indContainer.style.display = 'block';
        renderIndividualStudentAnalytics(Number(selectedVal));
    }
}

function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    if (btn) btn.classList.add('active');

    if (id === 'analyticsSec') {
        handleAnalyticsViewChange();
    }
}

function renderAnalyticsCharts() { handleAnalyticsViewChange(); }

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

    if (document.getElementById('avgScore')) document.getElementById('avgScore').innerText = `${avgScore}%`;
    if (document.getElementById('passPercent')) document.getElementById('passPercent').innerText = `${passPercentage}%`;
    if (document.getElementById('classTopper')) document.getElementById('classTopper').innerText = topperName;
    if (document.getElementById('failCount')) document.getElementById('failCount').innerText = `${failClass} Students`;

    const marksCtx = document.getElementById('marksDistributionChart');
    if (marksCtx && typeof Chart !== 'undefined') {
        if (marksChart) marksChart.destroy();
        marksChart = new Chart(marksCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Distinction', 'First Class', 'Pass Class', 'Needs Support'],
                datasets: [{
                    data: [distinction, firstClass, passClass, failClass],
                    backgroundColor: ['#006633', '#0055a5', '#f39c12', '#c0392b']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

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
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

function renderIndividualStudentAnalytics(rollNo) {
    const student = globalStudentsData.find(s => s['Roll No'] === rollNo);
    if (!student) return;

    if (document.getElementById('indStudentName')) document.getElementById('indStudentName').innerText = student['Student Name'];
    if (document.getElementById('indStudentRoll')) document.getElementById('indStudentRoll').innerText = student['Roll No'];
    
    const badgeInfo = getPerformanceBadge(student.total, student.attendance);
    const badgeEl = document.getElementById('indPerformanceBadge');
    if (badgeEl) {
        badgeEl.className = `badge ${badgeInfo.cssClass}`;
        badgeEl.innerText = badgeInfo.label;
    }

    if (document.getElementById('indTotalScore')) document.getElementById('indTotalScore').innerText = `${student.total} / 100`;
    if (document.getElementById('indAttendance')) document.getElementById('indAttendance').innerText = `${student.attendance}%`;

    let passedCount = 0, failedCount = 0;
    const subjectLabels = Object.keys(student.subjects || {});
    const subjectMarks = Object.values(student.subjects || {});

    subjectMarks.forEach(m => {
        if (m >= 35) passedCount++;
        else failedCount++;
    });

    if (document.getElementById('indPassedSubjects')) document.getElementById('indPassedSubjects').innerText = `${passedCount} Subjects`;
    if (document.getElementById('indFailedSubjects')) document.getElementById('indFailedSubjects').innerText = `${failedCount} Subjects`;

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
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

function openStudentModal(rollNo) {
    const student = globalStudentsData.find(s => s['Roll No'] === rollNo);
    if (!student) return;

    if (document.getElementById('modalStudentName')) document.getElementById('modalStudentName').innerText = student['Student Name'];
    if (document.getElementById('modalStudentRoll')) document.getElementById('modalStudentRoll').innerText = `${student['Roll No']} (${student['School ID']})`;
    if (document.getElementById('modalAttendance')) document.getElementById('modalAttendance').innerText = `${student.attendance}%`;
    if (document.getElementById('modalTotalScore')) document.getElementById('modalTotalScore').innerText = `${student.total}%`;

    let grade = 'F', status = 'FAILED', statusColor = '#dc3545';
    if (student.total >= 75) { grade = 'A+'; status = 'PASSED'; statusColor = '#28a745'; }
    else if (student.total >= 60) { grade = 'A'; status = 'PASSED'; statusColor = '#28a745'; }
    else if (student.total >= 35) { grade = 'B'; status = 'PASSED'; statusColor = '#28a745'; }

    if (document.getElementById('modalGrade')) document.getElementById('modalGrade').innerText = grade;
    const statusEl = document.getElementById('modalStatus');
    if (statusEl) { statusEl.innerText = status; statusEl.style.color = statusColor; }

    const tbody = document.getElementById('modalSubjectBreakdown');
    if (tbody) {
        tbody.innerHTML = '';
        Object.entries(student.subjects || {}).forEach(([subj, marks]) => {
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

    const modal = document.getElementById('studentAnalyticsModal');
    if (modal) modal.style.display = 'flex';
}

function closeAnalyticsModal() {
    const modal = document.getElementById('studentAnalyticsModal');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// DATA SUBMISSION & PERMANENT LOCAL SAVING
// ==========================================
async function submitAttendance(e) {
    if (e && e.preventDefault) e.preventDefault();

    const selectedClass = document.getElementById('classSelect')?.value || "5th";
    const selectedDiv = document.getElementById('divSelect')?.value || "A";
    const attDate = document.getElementById('attDate')?.value || new Date().toISOString().split('T')[0];

    const records = [];
    globalStudentsData.forEach(s => {
        const roll = s['Roll No'];
        const selectedRadio = document.querySelector(`input[name="att_${roll}"]:checked`);
        const status = selectedRadio ? selectedRadio.value : "Present";
        
        if (status === "Absent") {
            s.attendance = Math.max(0, s.attendance - 2); 
        } else {
            s.attendance = Math.min(100, s.attendance + 1);
        }

        records.push({ roll_no: roll, student_name: s['Student Name'], status: status });
    });

    // Save to LocalStorage
    saveLocalState(selectedClass, selectedDiv);

    // Optional API Sync
    try {
        await fetch(`${BACKEND_URL}/api/teacher/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ class: selectedClass, division: selectedDiv, date: attDate, records: records })
        });
    } catch (err) {
        console.warn("API Sync skipped/failed:", err);
    }

    alert(`Attendance saved permanently for ${selectedClass} ${selectedDiv}!`);
    renderStudentTable();
}

async function saveMarks(e) {
    if (e && e.preventDefault) e.preventDefault();

    const selectedClass = document.getElementById('classSelect')?.value || "5th";
    const selectedDiv = document.getElementById('divSelect')?.value || "A";
    const subject = document.getElementById('subjSelect')?.value || "Mathematics";

    const rows = document.querySelectorAll('#marksTableBody tr, #marksTable tr');

    rows.forEach(row => {
        const roll = Number(row.getAttribute('data-roll'));
        if (!roll) return;

        const ut1 = Number(row.querySelector('.input-ut1')?.value || 0);
        const ut2 = Number(row.querySelector('.input-ut2')?.value || 0);
        const assign = Number(row.querySelector('.input-assign')?.value || 0);
        const oral = Number(row.querySelector('.input-oral')?.value || 0);
        const term = Number(row.querySelector('.input-term')?.value || 0);
        const total = ut1 + ut2 + assign + oral + term;

        const st = globalStudentsData.find(item => item['Roll No'] === roll);
        if (st) {
            st.ut1 = ut1; 
            st.ut2 = ut2; 
            st.assign = assign;
            st.oral = oral; 
            st.term = term;
            st.total = total;
            
            if (!st.subjects) st.subjects = {};
            st.subjects[subject] = total;
        }
    });

    // 1. Write to local database
    saveLocalState(selectedClass, selectedDiv);

    // 2. Background API Push
    try {
        await fetch(`${BACKEND_URL}/api/teacher/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ class: selectedClass, division: selectedDiv, subject: subject, marks: globalStudentsData })
        });
    } catch (err) {
        console.warn("API Sync skipped/failed:", err);
    }

    alert(`Marks for ${subject} saved successfully!`);
    renderStudentTable();
}

// AI Assistant Widget Logic
function toggleChat() {
    const win = document.getElementById('chatWindow');
    if (win) win.style.display = (win.style.display === 'flex' || win.style.display === 'block') ? 'none' : 'flex';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input ? input.value.trim() : '';
    if (!msg) return;

    appendMsg(msg, 'user');
    input.value = '';

    let response = "";
    const q = msg.toLowerCase();

    const studentStats = globalStudentsData.map(s => ({ name: s['Student Name'], total: s.total }))
        .sort((a, b) => b.total - a.total);

    if (q.includes("attendance") || q.includes("how to mark")) {
        response = "To mark attendance, navigate to 'Mark Attendance' in the left menu, select status options, and click 'Submit Attendance'.";
    } else if (q.includes("top three") || q.includes("top 3") || q.includes("topper")) {
        const top3 = studentStats.slice(0, 3);
        response = "<b>Top Performing Students:</b><br>" + top3.map((s, idx) => `${idx + 1}. ${s.name} (${s.total}/100)`).join('<br>');
    } else if (q.includes("fail") || q.includes("failed")) {
        const failed = studentStats.filter(s => s.total < 35);
        if (failed.length > 0) {
            response = "<b>Students Needing Support (<35%):</b><br>" + failed.map((s, idx) => `${idx + 1}. ${s.name} (${s.total}/100)`).join('<br>');
        } else {
            response = "Great news! All students in this class have passing scores.";
        }
    } else if (q.includes("pass") || q.includes("passed") || q.includes("how many")) {
        const total = studentStats.length;
        const passed = studentStats.filter(s => s.total >= 35).length;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        response = `<b>Class Pass Statistics:</b><br>Total Students: ${total}<br>Passed: ${passed} (${passRate}%)<br>Needs Support: ${total - passed}`;
    } else {
        response = "I am your AI assistant. Ask me about class attendance, toppers, overall class pass performance, or failed student statistics.";
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
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}
