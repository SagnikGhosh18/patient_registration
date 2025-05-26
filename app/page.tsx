'use client';

import {
    getDoctors,
    getPatients,
    getCurrentAppointmentsCount,
    getUpcomingWeekAppointments,
    getCompletedAppointmentsLastMonth,
} from '@/services/LocalService';
import { broadcastChannel } from '@/lib/broadcastChannel';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Appointment, Doctor, Patient } from '@/lib/types';

export default function Home() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [currentAppointmentsCount, setCurrentAppointmentsCount] = useState<number>(0);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [completedAppointmentsLastMonth, setCompletedAppointmentsLastMonth] = useState<
        Appointment[]
    >([]);

    const handleDoctorAdded = (doctor: Doctor) => {
        setDoctors((prev) => [...prev, doctor]);
    };

    const handlePatientAdded = (patient: Patient) => {
        setPatients((prev) => [...prev, patient]);
    };

    const handleAppointmentAdded = (appointment: Appointment) => {
        setCurrentAppointmentsCount((prev) => prev + 1);
        setUpcomingAppointments((prev) => {
            const newAppointments = [...prev, appointment];
            return newAppointments.sort((a, b) => {
                if (a.date === b.date) {
                    return a.time.localeCompare(b.time);
                }
                return a.date.localeCompare(b.date);
            });
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                doctorsData,
                patientsData,
                appointmentsCountData,
                upcomingAppointmentsData,
                completedAppointmentsData,
            ] = await Promise.all([
                getDoctors(),
                getPatients(),
                getCurrentAppointmentsCount(),
                getUpcomingWeekAppointments(),
                getCompletedAppointmentsLastMonth(),
            ]);

            setDoctors(doctorsData as Doctor[]);
            setPatients(patientsData as Patient[]);
            setCurrentAppointmentsCount(appointmentsCountData.count);
            setUpcomingAppointments(upcomingAppointmentsData as Appointment[]);
            setCompletedAppointmentsLastMonth(completedAppointmentsData as Appointment[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribeDoctorAdded = broadcastChannel.subscribe(
            'doctor-added',
            handleDoctorAdded,
        );
        const unsubscribePatientAdded = broadcastChannel.subscribe(
            'patient-added',
            handlePatientAdded,
        );
        const unsubscribeAppointmentAdded = broadcastChannel.subscribe(
            'appointment-added',
            handleAppointmentAdded,
        );
        fetchData();

        return () => {
            unsubscribeDoctorAdded();
            unsubscribePatientAdded();
            unsubscribeAppointmentAdded();
        };
    }, []);

    return (
        <div className="container flex flex-col mx-auto py-10 w-full flex-4 gap-6">
            <div className="flex flex-row flex-1 w-full gap-2 justify-between">
                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div>
                                <p>{currentAppointmentsCount} appointments scheduled today</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Next 7 Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    {upcomingAppointments.length} appointments scheduled in the next
                                    7 days
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Completed this Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    {completedAppointmentsLastMonth.length} appointments completed
                                    this month
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-row flex-2 w-full gap-8">
                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Available Doctors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Specialization</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {doctors.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No doctors available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            doctors.map((doctor) => (
                                                <TableRow key={doctor.id}>
                                                    <TableCell>{doctor.name}</TableCell>
                                                    <TableCell>{doctor.age}</TableCell>
                                                    <TableCell>{doctor.specialization}</TableCell>
                                                    <TableCell>{doctor.phone || '-'}</TableCell>
                                                    <TableCell>{doctor.notes || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="max-w-4xl mx-auto flex-1/2">
                    <CardHeader>
                        <CardTitle>Available Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Condition</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No patients available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            patients.map((patient) => (
                                                <TableRow key={patient.id}>
                                                    <TableCell>{patient.name}</TableCell>
                                                    <TableCell>{patient.age}</TableCell>
                                                    <TableCell>{patient.condition}</TableCell>
                                                    <TableCell>{patient.phone || '-'}</TableCell>
                                                    <TableCell>{patient.notes || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
