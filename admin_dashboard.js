const BASE_URL = 'https://swami-vivekanand-erp-backend2-12.onrender.com';

// ==========================================
// 1. FETCH & DISPLAY ALL STUDENTS (5th A, B, C)
// ==========================================
async function loadAdminStudents() {
    const divisions = ['A', 'B', 'C'];

    try {
        // Fetch Class 5th A, 5th B, and 5th C in parallel
        const fetchPromises = divisions.map(div =>
            fetch(`${BASE_URL}/api/teacher/students?class=5th&div=${div}`)
                .then(res => res.json())
        );

        const results = await Promise.all(fetchPromises);

        // Combine all 3 division student arrays into one list
        const allStudents = results.flatMap(res => res.students || []);

        renderStudentTable(allStudents);
    } catch (error) {
        console.error('Error fetching admin student list:', error);
    }
}

function renderStudentTable(students) {
    const tableBody = document.getElementById('adminStudentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear static sample rows

    students.forEach((student, index) => {
        const row = `
            <tr>
                <td>${student['Roll No'] || student.roll_no || (index + 1)}</td>
                <td>${student['Student Name'] || student.name}</td>
                <td>Class ${student['Class'] || '5th'} - ${student['Div'] || ''}</td>
                <td>${student['Father Name'] || 'N/A'}</td>
                <td>${student['School ID'] || 'N/A'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Update total student count badge
    const totalStudentBadge = document.getElementById('totalStudentCount');
    if (totalStudentBadge) {
        totalStudentBadge.innerText = students.length;
    }
}

// ==========================================
// 2. FETCH & DISPLAY ALL TEACHERS
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

    tableBody.innerHTML = ''; // Clear static sample rows

    teachers.forEach((teacher, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${teacher['Teacher Name'] || teacher.name}</td>
                <td>${teacher['Class Assigned'] || 'N/A'}</td>
                <td>${teacher['Education'] || 'N/A'}</td>
                <td>${teacher['Role'] || 'Teacher'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Update total teacher count badge
    const totalTeacherBadge = document.getElementById('totalTeacherCount');
    if (totalTeacherBadge) {
        totalTeacherBadge.innerText = teachers.length;
    }
}

// ==========================================
// INITIALIZE ON DASHBOARD LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadAdminStudents();
    loadAdminTeachers();
});
