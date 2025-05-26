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