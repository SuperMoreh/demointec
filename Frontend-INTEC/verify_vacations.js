// Script para verificar la lógica de vacaciones en la consola (Terminal)
// Simula la lógica implementada en PermissionsVacationsComponent

const employeesMock = [
    { name: 'CRISTHIAN ALBERTO JUAREZ ROMERO', admission_date: '2008-01-01' },
    { name: 'CARLOS JUAREZ SANTIAGO', admission_date: '2008-06-01' },
    { name: 'JUAN PEDRO ECHEVERRIA LANDEROS', admission_date: '2015-03-01' },
    { name: 'EFRAIN GARCIA MAGALLANES', admission_date: '2019-09-09' },
    { name: 'HERIBERTO GUTIERREZ MADRIGAL', admission_date: '2021-12-15' },
    { name: 'JOSE FRANCISCO GUTIERREZ LUNA', admission_date: '2022-12-22' },
    { name: 'JOEL MIRAMONTES GUEVARA', admission_date: '2023-03-29' },
    { name: 'OLIVER MICHELLE MUÑOZ MORA', admission_date: '2024-03-11' },
    { name: 'JOSE ARTURO SILVA GABRIEL', admission_date: '2024-05-07' }
];

const currentYear = 2025;

function calculateVacationDays(years) {
    if (years <= 0) return 0;
    if (years === 1) return 12;
    if (years === 2) return 14;
    if (years === 3) return 16;
    if (years === 4) return 18;
    if (years === 5) return 20;

    // 6-10 -> 22
    // 11-15 -> 24
    // 16-20 -> 26
    // 21-25 -> 28
    // 26-30 -> 30
    if (years >= 6 && years <= 10) return 22;
    if (years >= 11 && years <= 15) return 24;
    if (years >= 16 && years <= 20) return 26;
    if (years >= 21 && years <= 25) return 28;
    if (years >= 26 && years <= 30) return 30;

    // Fallback formula logic
    const cycles5 = Math.floor((years - 1) / 5);
    return 22 + (cycles5 - 1) * 2;
}

console.log("--------------------------------------------------------------------------------");
console.log(" VERIFICACIÓN DE CÁLCULO DE VACACIONES (Simulación 2025) ");
console.log("--------------------------------------------------------------------------------");
console.log("| ANTIGÜEDAD | NOMBRE                           | FECHA INGRESO | DIAS VACACIONES |");
console.log("--------------------------------------------------------------------------------");

employeesMock.forEach(emp => {
    const admissionDate = new Date(emp.admission_date);
    const admissionYear = admissionDate.getFullYear();
    let yearsOfService = currentYear - admissionYear;
    if (yearsOfService < 0) yearsOfService = 0;

    const vacationDays = calculateVacationDays(yearsOfService);

    console.log(
        `| ${yearsOfService.toString().padEnd(10)} | ${emp.name.padEnd(32)} | ${emp.admission_date.padEnd(13)} | ${vacationDays.toString().padEnd(15)} |`
    );
});

console.log("--------------------------------------------------------------------------------");
