import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;

export async function getDB() {
    if (db) {
        return db;
    }

    db = new PGlite('idb://patient_registration');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY NOT NULL AUTOINCREMENT,
            name TEXT,
            age INTEGER,
            condition TEXT,
            notes TEXT,
            phone TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY NOT NULL AUTOINCREMENT,
            name TEXT,
            age INTEGER,
            specialization TEXT,
            notes TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY NOT NULL AUTOINCREMENT,
            doctor_id TEXT,
            patient_id TEXT,
            date TEXT,
            time TEXT,
            FOREIGN KEY(doctor_id) REFERENCES doctors(id),
            FOREIGN KEY(patient_id) REFERENCES patients(id)
    );
    `);

    return db;
}
