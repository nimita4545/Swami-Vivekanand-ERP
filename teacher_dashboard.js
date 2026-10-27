const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-17.onrender.com';

// Global state for student data
let globalStudentsData = [];

// Chart Instances
let marksChart = null;
let subjectChart = null;
let individualSubjectChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Teacher Profile details
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

    // 2. Parse class and division
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

async function onClassDivChange() {
    const classVal = document.getElementById('classSelect')?.value || "5th";
    const divVal = document.getElementById('divSelect')?.value || "A";

    const labelStr = `${classVal} ${divVal}`;
    if (document.getElementById('assignedClassLabel')) document.getElementById('assignedClassLabel').innerText = labelStr;
    if (document.getElementById('analyticsClassLabel')) document.getElementById('analyticsClassLabel').innerText = labelStr;

    await fetchAndDisplayStudents(classVal, divVal);
}

async function fetchAndDisplayStudents(selectedClass, selectedDiv) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/students?class=${selectedClass}&div=${selectedDiv}`);
        const data = await response.json();

        if (response.ok && data.success && data.students && data.students.length > 0) {
            // First process the data
            let processedData = processStudentData(data.students);
            
            // 🔥 SORT THE STUDENTS BY ROLL NO 🔥
            processedData.sort((a, b) => Number(a['Roll No']) - Number(b['Roll No']));
            
            globalStudentsData = processedData;
        } else {
            loadFallbackData();
        }
    } catch (error) {
        console.error('Error loading students from API:', error);
        loadFallbackData();
    }
    renderAllViews();
}

function processStudentData(students) {
    return students.map((s, idx) => {
        const roll = s['Roll No'] || s.roll_no || (idx + 1);
        const name = s['Student Name'] || s.student_name || `Student ${roll}`;
        const school_id = s['School ID'] || s.school_id || `SCH${100 + roll}`;
        const father_name = s['Father Name'] || s.father_name || "Parent Name";

        const ut1 = s.ut1 !== undefined && s.ut1 !== null ? Number(s.ut1) : 0;
        const ut2 = s.ut2 !== undefined && s.ut2 !== null ? Number(s.ut2) : 0;
        const assign = s.assign !== undefined && s.assign !== null ? Number(s.assign) : 0;
        const oral = s.oral !== undefined && s.oral !== null ? Number(s.oral) : 0;
        const term = s.term !== undefined && s.term !== null ? Number(s.term) : 0;
        const total = ut1 + ut2 + assign + oral + term;

        const attendance = s.attendance !== undefined && s.attendance !== null ? Number(s.attendance) : 85;

        const subjects = s.subjects || {
            'Mathematics': total, 'English': total, 'Science': total, 'Hindi': total, 'Marathi': total
        };

        return {
            'Roll No': roll, 'Student Name': name, 'School ID': school_id, 'Father Name': father_name,
            ut1, ut2, assign, oral, term, total, attendance, subjects
        };
    });
}

function loadFallbackData() {
    const rawFallback = [
        { 'Roll No': 1, 'Student Name': "Nikhil Kokate", 'School ID': "SCH484", 'Father Name': "Omkar Kokate", ut1: 18, ut2: 17, assign: 9, oral: 9, term: 35, attendance: 92 },
        { 'Roll No': 2, 'Student Name': "Rutuparn Shinde", 'School ID': "SCH563", 'Father Name': "Tejas Shinde", ut1: 19, ut2: 18, assign: 10, oral: 10, term: 36, attendance: 96 }
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
    const attTableBody = document.getElementById('attendanceTableBody');
    const marksTableBody = document.getElementById('marksTableBody');

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
                    <td><input type="radio" name="att_${roll}" value="Present" class="att-radio" ${isPresent ? 'checked' : ''}></td>
                    <td><input type="radio" name="att_${roll}" value="Absent" class="att-radio" ${!isPresent ? 'checked' : ''}></td>
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
    if (id === 'analyticsSec') handleAnalyticsViewChange();
}

function renderClassAnalyticsCharts() {
    if (!globalStudentsData || globalStudentsData.length === 0) return;

    let distinction = 0, firstClass = 0, passClass = 0, failClass = 0;
    let totalScoreSum = 0, highestScore = -1, topperName = "-";

    globalStudentsData.forEach(s => {
        const total = s.total;
        totalScoreSum += total;
        if (total > highestScore) { highestScore = total; topperName = `${s['Student Name']} (${total})`; }
        if (total >= 75) distinction++; else if (total >= 60) firstClass++; else if (total >= 35) passClass++; else failClass++;
    });

    const totalStudents = globalStudentsData.length;
    const passedStudents = distinction + firstClass + passClass;
    const avgScore = (totalScoreSum / totalStudents).toFixed(1);
    const passPercentage = ((passedStudents / totalStudents) * 100).toFixed(1);

    if (document.getElementById('avgScore')) document.getElementById('avgScore').innerText = `${avgScore}%`;
    if (document.getElementById('passPercent')) document.getElementById('passPercent').innerText = `${passPercentage}%`;
    if (document.getElementById('classTopper')) document.getElementById('classTopper').innerText = topperName;
    if (document.getElementById('failCount')) document.getElementById('failCount').innerText = `${failClass} Students`;

    const mathAvg = globalStudentsData.reduce((sum, s) => sum + (s.subjects['Mathematics'] || 0), 0) / totalStudents || 0;

    const marksCtx = document.getElementById('marksDistributionChart');
    if (marksCtx && typeof Chart !== 'undefined') {
        if (marksChart) marksChart.destroy();
        marksChart = new Chart(marksCtx.getContext('2d'), {
            type: 'doughnut',
            data: { labels: ['Distinction', 'First Class', 'Pass Class', 'Needs Support'], datasets: [{ data: [distinction, firstClass, passClass, failClass], backgroundColor: ['#006633', '#0055a5', '#f39c12', '#c0392b'] }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const subjCtx = document.getElementById('subjectAvgChart');
    if (subjCtx && typeof Chart !== 'undefined') {
        if (subjectChart) subjectChart.destroy();
        subjectChart = new Chart(subjCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: ['Mathematics'], datasets: [{ label: 'Class Average (%)', data: [mathAvg.toFixed(1)], backgroundColor: '#003366' }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

function renderIndividualStudentAnalytics(rollNo) {
    const student = globalStudentsData.find(s => Number(s['Roll No']) === Number(rollNo));
    if (!student) return;

    if (document.getElementById('indStudentName')) document.getElementById('indStudentName').innerText = student['Student Name'];
    if (document.getElementById('indStudentRoll')) document.getElementById('indStudentRoll').innerText = student['Roll No'];
    
    const badgeInfo = getPerformanceBadge(student.total, student.attendance);
    const badgeEl = document.getElementById('indPerformanceBadge');
    if (badgeEl) { badgeEl.className = `badge ${badgeInfo.cssClass}`; badgeEl.innerText = badgeInfo.label; }

    if (document.getElementById('indTotalScore')) document.getElementById('indTotalScore').innerText = `${student.total} / 100`;
    if (document.getElementById('indAttendance')) document.getElementById('indAttendance').innerText = `${student.attendance}%`;

    let passedCount = 0, failedCount = 0;
    const subjectLabels = Object.keys(student.subjects || {});
    const subjectMarks = Object.values(student.subjects || {});

    subjectMarks.forEach(m => { if (m >= 35) passedCount++; else failedCount++; });

    if (document.getElementById('indPassedSubjects')) document.getElementById('indPassedSubjects').innerText = `${passedCount} Subjects`;
    if (document.getElementById('indFailedSubjects')) document.getElementById('indFailedSubjects').innerText = `${failedCount} Subjects`;

    const indCtx = document.getElementById('individualSubjectChart');
    if (indCtx && typeof Chart !== 'undefined') {
        if (individualSubjectChart) individualSubjectChart.destroy();
        individualSubjectChart = new Chart(indCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: subjectLabels, datasets: [{ label: 'Marks Obtained', data: subjectMarks, backgroundColor: subjectMarks.map(m => m >= 35 ? '#0055a5' : '#dc3545') }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

function openStudentModal(rollNo) {
    const student = globalStudentsData.find(s => Number(s['Roll No']) === Number(rollNo));
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
            tbody.innerHTML += `<tr><td>${subj}</td><td>100</td><td>${marks}</td><td style="font-weight:bold; color:${marks >= 35 ? '#006633' : '#dc3545'}">${marks}%</td></tr>`;
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
// DATA SUBMISSION (NOW WITH ERROR ALERTS)
// ==========================================
async function submitAttendance(e) {
    if (e && e.preventDefault) e.preventDefault();

    const selectedClass = document.getElementById('classSelect')?.value || "5th";
    const selectedDiv = document.getElementById('divSelect')?.value || "A";
    // Get date or fallback to today's date
    let attDate = document.getElementById('attDate')?.value;
    if (!attDate) attDate = new Date().toISOString().split('T')[0];

    const records = [];
    globalStudentsData.forEach(s => {
        const roll = s['Roll No'];
        const selectedRadio = document.querySelector(`input[name="att_${roll}"]:checked`);
        const status = selectedRadio ? selectedRadio.value : "Present";
        // Send student_name just in case the backend needs it
        records.push({ roll_no: roll, status: status, student_name: s['Student Name'] });
    });

    // Show loading so you know it clicked
    alert("⏳ Saving attendance, please wait...");

    try {
        const res = await fetch(`${BACKEND_URL}/api/teacher/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                class: selectedClass, 
                div: selectedDiv, 
                date: attDate, 
                attendance: records 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert(`✅ SUCCESS! Attendance saved. (${data.saved} students updated)`);
            await fetchAndDisplayStudents(selectedClass, selectedDiv);
        } else {
            alert('❌ Save failed: ' + (data.message || 'Unknown backend error'));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Network Error: Could not connect to backend. Check if Render is awake.");
    }
}

async function saveMarks(e) {
    if (e && e.preventDefault) e.preventDefault();

    const selectedClass = document.getElementById('classSelect')?.value || "5th";
    const selectedDiv = document.getElementById('divSelect')?.value || "A";
    const subject = document.getElementById('subjSelect')?.value || "Mathematics";

    const rows = document.querySelectorAll('#marksTableBody tr');
    const marks = [];

    rows.forEach(row => {
        const roll = Number(row.getAttribute('data-roll'));
        if (!roll) return;

        const ut1 = Number(row.querySelector('.input-ut1')?.value || 0);
        const ut2 = Number(row.querySelector('.input-ut2')?.value || 0);
        const assign = Number(row.querySelector('.input-assign')?.value || 0);
        const oral = Number(row.querySelector('.input-oral')?.value || 0);
        const term = Number(row.querySelector('.input-term')?.value || 0);

        marks.push({ roll_no: roll, ut1, ut2, assign, oral, term });
    });

    alert("⏳ Saving marks, please wait...");

    try {
        const res = await fetch(`${BACKEND_URL}/api/teacher/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                class: selectedClass, 
                div: selectedDiv, 
                subject: subject, 
                marks: marks 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert(`✅ SUCCESS! Marks for ${subject} saved. (${data.saved} students updated)`);
            await fetchAndDisplayStudents(selectedClass, selectedDiv); 
        } else {
            alert('❌ Save failed: ' + (data.message || 'Unknown backend error'));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Network Error: Could not connect to backend.");
    }
}

// AI Assistant Widget Logic
function toggleChat() {
    const win = document.getElementById('chatWindow');
    if (win) win.style.display = (win.style.display === 'flex' || win.style.display === 'block') ? 'none' : 'flex';
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

    const studentStats = globalStudentsData.map(s => ({ name: s['Student Name'], total: s.total, attendance: s.attendance })).sort((a, b) => b.total - a.total);
    const classAverage = globalStudentsData.length > 0 ? (globalStudentsData.reduce((sum, s) => sum + s.total, 0) / globalStudentsData.length).toFixed(1) : 0;

    const context = {
        teacher_info: userObj,
        class_average_score: classAverage,
        total_students: globalStudentsData.length,
        top_students: studentStats.slice(0, 3),
        failed_students: studentStats.filter(s => s.total < 35),
        full_student_list: studentStats
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'teacher', message: msg, lang: lang, user: userObj, context: context })
        });
        const data = await res.json();
        const lb = document.getElementById('loadingBubble');
        if (lb) lb.remove();
        const reply = (data && data.reply) ? data.reply : 'Sorry, no reply received.';
        appendMsg(reply.replace(/\n/g, '<br>'), 'bot');
    } catch (err) {
        const lb = document.getElementById('loadingBubble');
        if (lb) lb.remove();
        const errMsg = lang === 'mr' ? 'क्षमस्व, एआय सहाय्यक सध्या उपलब्ध नाही. कृपया ६० सेकंद थांबा.' : 'Sorry, AI temporarily unavailable. Please wait 60s.';
        appendMsg(errMsg, 'bot');
    }
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
