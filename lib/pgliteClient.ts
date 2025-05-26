import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;

export async function getDB() {
    if (db) {
        return db;
    }

    db = new PGlite('idb://patient_registration');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id SERIAL PRIMARY KEY,
            name TEXT,
            age INTEGER,
            specialization TEXT,
            notes TEXT,
            phone TEXT
        );

    CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            name TEXT,
            age INTEGER,
            condition TEXT,
            notes TEXT,
            phone TEXT
        );

    CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            doctor_id INTEGER,
            patient_id INTEGER,
            date TEXT,
            time TEXT,
            notes TEXT,
            FOREIGN KEY(doctor_id) REFERENCES doctors(id),
            FOREIGN KEY(patient_id) REFERENCES patients(id)
    );
    `);

    return db;
}
