import { getDB } from '@/lib/pgliteClient';

export async function addDoctor(data: any) {
    try {
        const db = await getDB();
        const { name, age, condition, notes, phone } = data;
        await db.exec(
            `INSERT INTO doctors (name, age, condition, notes, phone)
        VALUES (${name}, ${age}, ${condition}, ${notes}, ${phone})`,
        );
        return true;
    } catch (err) {
        console.log('ADD_DOCTOR: Something went wrong: %o', err);
        return false;
    }
}

export async function addPatient(data: any) {
    try {
        const db = await getDB();
        const { name, age, specialization, notes } = data;
        await db.exec(
            `INSERT INTO patients (name, age, specialization, notes)
        VALUES (${name}, ${age}, ${specialization}, ${notes})`,
        );
        return true;
    } catch (err) {
        console.log('ADD_PATIENT: Something went wrong: %o', err);
        return false;
    }
}

export async function scheduleAppointment(data: any) {
    try {
        const db = await getDB();
        const { doctorId, patientId, date, time } = data;
        const query = `INSERT INTO appointments (doctor_id, patient_id, date, time)
        VALUES (${doctorId}, ${patientId}, ${date}, ${time})`;
        await db.exec(query);
        return true;
    } catch (err) {
        console.log('SCHEDULE_APPOINTMENT: Something went wrong: %o', err);
        return false;
    }
}

export async function getDoctors() {
    try {
        const db = await getDB();
        const queryResult = await db.query(`SELECT * FROM doctors`);
        return queryResult.rows;
    } catch (err) {
        console.log('GET_DOCTORS: Something went wrong: %o', err);
        return [];
    }
}

export async function getPatients() {
    try {
        const db = await getDB();
        const queryResult = await db.query(`SELECT * FROM patients`);
        return queryResult.rows;
    } catch (err) {
        console.log('GET_PATIENTS: Something went wrong: %o', err);
        return [];
    }
}

export async function getAppointments() {
    try {
        const db = await getDB();
        const queryResult = await db.query(`
        SELECT a.*, d.name AS doctor_name, p.name AS patient_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN patients p ON a.patient_id = p.id
    `);
        return queryResult.rows;
    } catch (err) {
        console.log('GET_APPOINTMENTS: Something went wrong: %o', err);
        return [];
    }
}
