export interface DoctorFormData {
    name: string;
    age: number;
    specialization: string;
    notes: string;
    phoneNumber: string;
}

export interface Doctor {
    id: number;
    name: string;
    age: number;
    specialization: string;
    phone: string;
    notes: string;
}

export interface AppointmentFormData {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    notes: string;
}

export interface PatientFormData {
    name: string;
    age: number;
    condition: string;
    phone: string;
    notes: string;
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    condition: string;
    phone: string;
    notes: string;
}

export interface RawQueryResult {
    rows: any[];
}

export interface Appointment {
    id: number;
    doctor_id: number;
    patient_id: number;
    date: string;
    time: string;
    notes: string;
    doctor_name: string;
    patient_name: string;
}

export interface AppointmentStats {
    count: number;
}

export interface SQLQueryForm {
    query: string;
}