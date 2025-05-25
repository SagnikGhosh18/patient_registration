import { getDB } from '@/lib/pgliteClient';

export async function addDoctor(data: any) {
    try {
        const db = await getDB();
        const { name, age, specialization, notes, phone } = data;
        await db.query(
            `INSERT INTO doctors (name, age, specialization, notes, phone) VALUES ($1, $2, $3, $4, $5)`,
            [name, age, specialization, notes, phone],
        );
        return true;
    } catch (err) {
        console.log('ADD_DOCTOR: Something went wrong: %o', err);
        throw new Error('Failed to add doctor');
    }
}

export async function addPatient(data: any) {
    try {
        const db = await getDB();
        const { name, age, condition, notes, phone } = data;
        await db.query(
            `INSERT INTO patients (name, age, condition, notes, phone)
        VALUES ($1, $2, $3, $4, $5)`,
            [name, age, condition, notes, phone],
        );
        return true;
    } catch (err) {
        console.log('ADD_PATIENT: Something went wrong: %o', err);
        throw new Error('Failed to add patient');
    }
}

export async function scheduleAppointment(data: any) {
    try {
        const db = await getDB();
        const { doctorId, patientId, date, time } = data;
        await db.query(
            `INSERT INTO appointments (doctor_id, patient_id, date, time)
        VALUES ($1, $2, $3, $4)`,
            [doctorId, patientId, date, time],
        );
        return true;
    } catch (err) {
        console.log('SCHEDULE_APPOINTMENT: Something went wrong: %o', err);
        throw new Error('Failed to schedule appointment');
    }
}

export async function getDoctors() {
    try {
        const db = await getDB();
        const queryResult = await db.query(`SELECT * FROM doctors`);
        return queryResult.rows;
    } catch (err) {
        console.log('GET_DOCTORS: Something went wrong: %o', err);
        throw new Error('Failed to get doctors');
    }
}

export async function getPatients() {
    try {
        const db = await getDB();
        const queryResult = await db.query(`SELECT * FROM patients`);
        return queryResult.rows;
    } catch (err) {
        console.log('GET_PATIENTS: Something went wrong: %o', err);
        throw new Error('Failed to get patients');
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
        throw new Error('Failed to get appointments');
    }
}
