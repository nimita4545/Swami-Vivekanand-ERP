const BACKEND_URL = 'https://swami-vivekanand-erp-backend2-13.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayStudents('5th', 'A');
});

async function fetchAndDisplayStudents(selectedClass, selectedDiv) {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/students?class=${selectedClass}&div=${selectedDiv}`);
        const data = await response.json();

        if (response.ok && data.success) {
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
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}
