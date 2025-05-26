import { getDB } from '@/lib/pgliteClient';
import { broadcastChannel } from '@/lib/broadcastChannel';
import { Appointment, AppointmentStats, RawQueryResult } from '@/lib/types';

export async function addDoctor(data: any) {
    try {
        const db = await getDB();
        const { name, age, specialization, notes, phone } = data;
        await db.query(
            `INSERT INTO doctors (name, age, specialization, notes, phone)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, age, specialization, notes, phone],
        );
        const result = await db.query('SELECT * FROM doctors ORDER BY id DESC LIMIT 1');
        const newDoctor = result.rows[0];
        broadcastChannel.broadcast('doctor-added', newDoctor);
        return newDoctor;
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
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, age, condition, notes, phone],
        );
        const result = await db.query('SELECT * FROM patients ORDER BY id DESC LIMIT 1');
        const newPatient = result.rows[0];
        broadcastChannel.broadcast('patient-added', newPatient);
        return newPatient;
    } catch (err) {
        console.log('ADD_PATIENT: Something went wrong: %o', err);
        throw new Error('Failed to add patient');
    }
}

export async function scheduleAppointment(data: any) {
    try {
        const db = await getDB();
        const { doctorId, patientId, date, time, notes } = data;
        await db.query(
            `INSERT INTO appointments (doctor_id, patient_id, date, time, notes)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [doctorId, patientId, date, time, notes],
        );
        const result = await db.query('SELECT * FROM appointments ORDER BY id DESC LIMIT 1');
        const newAppointment = result.rows[0];
        broadcastChannel.broadcast('appointment-scheduled', newAppointment);
        return newAppointment;
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

export async function rawQuery(query: string, params: any[] = []): Promise<RawQueryResult> {
    try {
        const db = await getDB();
        const result = await db.query(query, params);
        return result;
    } catch (err) {
        console.log('RAW_QUERY: Something went wrong: %o', err);
        throw new Error('Failed to execute query');
    }
}

export async function getCurrentAppointmentsCount(): Promise<AppointmentStats> {
    const query = `SELECT COUNT(*) as count 
                    FROM appointments 
                    WHERE date = to_char(CURRENT_DATE, 'YYYY-MM-DD')`;
    const result = await rawQuery(query);
    return result.rows[0];
}

export async function getUpcomingWeekAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const query = `SELECT * 
                    FROM appointments 
                    WHERE date::text >= $1 
                    AND date::text <= $2
                    ORDER BY date, time`;
    return (await rawQuery(query, [todayStr, nextWeekStr])).rows;
}

export async function getCompletedAppointmentsLastMonth(): Promise<Appointment[]> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    const query = `SELECT * 
                    FROM appointments 
                    WHERE date::text >= $1 
                    AND date::text < $2
                    ORDER BY date DESC, time DESC`;
    return (await rawQuery(query, [lastMonthStr, todayStr])).rows;
}

export async function getTodaysAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const query = `SELECT * 
                    FROM appointments 
                    WHERE date::text = $1
                    ORDER BY time`;
    return (await rawQuery(query, [todayStr])).rows;
}

export async function getNextMonthAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const query = `SELECT * 
                    FROM appointments 
                    WHERE date::text >= $1 
                    AND date::text <= $2
                    ORDER BY date, time`;
    return (await rawQuery(query, [todayStr, nextMonthStr])).rows;
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
