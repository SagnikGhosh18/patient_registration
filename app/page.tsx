'use client';

import {
    getDoctors,
    getPatients,
    getCurrentAppointmentsCount,
    getUpcomingWeekAppointments,
    getCompletedAppointmentsLastMonth,
    getNextMonthAppointments,
    getTodaysAppointments,
} from '@/services/LocalService';
import { broadcastChannel } from '@/lib/broadcastChannel';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Appointment, Doctor, Patient } from '@/lib/types';

export default function Home() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [currentAppointmentsCount, setCurrentAppointmentsCount] = useState<number>(0);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [completedAppointmentsLastMonth, setCompletedAppointmentsLastMonth] = useState<Appointment[]>([]);
    const [nextMonthAppointments, setNextMonthAppointments] = useState<Appointment[]>([]);
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
    const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>('today');
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const handleViewChange = (view: 'today' | 'week' | 'month') => {
        setSelectedView(view);

        switch (view) {
            case 'today':
                setAppointments(todaysAppointments);
                break;
            case 'week':
                const today = format(new Date(), 'yyyy-MM-dd');
                const nextWeek = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                setAppointments(nextMonthAppointments.filter((app) => app.date <= nextWeek));
                break;
            case 'month':
                const allAppointments = [
                    ...nextMonthAppointments,
                    ...completedAppointmentsLastMonth,
                ];

                const sortedAppointments = allAppointments.sort((a, b) => {
                    if (a.date === b.date) {
                        return a.time.localeCompare(b.time);
                    }
                    return a.date.localeCompare(b.date);
                });

                setAppointments(sortedAppointments);
                break;
        }
    };

    const handleDoctorAdded = (doctor: Doctor) => {
        setDoctors((prev) => [...prev, doctor]);
    };

    const handlePatientAdded = (patient: Patient) => {
        setPatients((prev) => [...prev, patient]);
    };

    const handleAppointmentAdded = (appointment: Appointment) => {
        setCurrentAppointmentsCount((prev) => prev + 1);
        
        // Update today's appointments if it's for today
        if (appointment.date === format(new Date(), 'yyyy-MM-dd')) {
            setTodaysAppointments((prev) => {
                const newAppointments = [...prev, appointment];
                return newAppointments.sort((a, b) => a.time.localeCompare(b.time));
            });
        }

        // Update next month appointments if it's within the next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (appointment.date <= format(nextMonth, 'yyyy-MM-dd')) {
            setNextMonthAppointments((prev) => {
                const newAppointments = [...prev, appointment];
                return newAppointments.sort((a, b) => {
                    if (a.date === b.date) {
                        return a.time.localeCompare(b.time);
                    }
                    return a.date.localeCompare(b.date);
                });
            });
        }

        // Update the currently displayed appointments if we're in the relevant view
        switch (selectedView) {
            case 'today':
                if (appointment.date === format(new Date(), 'yyyy-MM-dd')) {
                    setAppointments((prev) => {
                        const newAppointments = [...prev, appointment];
                        return newAppointments.sort((a, b) => a.time.localeCompare(b.time));
                    });
                }
                break;
            case 'week':
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                if (appointment.date <= format(nextWeek, 'yyyy-MM-dd')) {
                    setAppointments((prev) => {
                        const newAppointments = [...prev, appointment];
                        return newAppointments.sort((a, b) => {
                            if (a.date === b.date) {
                                return a.time.localeCompare(b.time);
                            }
                            return a.date.localeCompare(b.date);
                        });
                    });
                }
                break;
            case 'month':
                setAppointments((prev) => {
                    const newAppointments = [...prev, appointment];
                    return newAppointments.sort((a, b) => {
                        if (a.date === b.date) {
                            return a.time.localeCompare(b.time);
                        }
                        return a.date.localeCompare(b.date);
                    });
                });
                break;
        }
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
                nextMonthAppointmentsData,
                todaysAppointmentsData,
            ] = await Promise.all([
                getDoctors(),
                getPatients(),
                getCurrentAppointmentsCount(),
                getUpcomingWeekAppointments(),
                getCompletedAppointmentsLastMonth(),
                getNextMonthAppointments(),
                getTodaysAppointments(),
            ]);

            setDoctors(doctorsData as Doctor[]);
            setPatients(patientsData as Patient[]);
            setCurrentAppointmentsCount(appointmentsCountData.count);
            setUpcomingAppointments(upcomingAppointmentsData as Appointment[]);
            setCompletedAppointmentsLastMonth(completedAppointmentsData as Appointment[]);
            setNextMonthAppointments(nextMonthAppointmentsData as Appointment[]);
            setTodaysAppointments(todaysAppointmentsData as Appointment[]);
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
            <div className="flex flex-row flex-1/4 w-full gap-2 justify-between">
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
            <div className="flex flex-row flex-3/4 overflow-scroll w-full gap-8">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Select
                            value={selectedView}
                            onValueChange={(value) =>
                                handleViewChange(value as 'today' | 'week' | 'month')
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a view" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Next 7 Days</SelectItem>
                                <SelectItem value="month">Next Month</SelectItem>
                            </SelectContent>
                        </Select>
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
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No appointments found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            appointments.map((appointment) => (
                                                <TableRow key={appointment.id}>
                                                    <TableCell>
                                                        {patients.find(
                                                            (p) => p.id === appointment.patient_id,
                                                        )?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {doctors.find(
                                                            (d) => d.id === appointment.doctor_id,
                                                        )?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(
                                                            new Date(appointment.date),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{appointment.time}</TableCell>
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
