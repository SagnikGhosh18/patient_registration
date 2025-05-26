'use client';
import { scheduleAppointment, getAppointments } from '@/services/LocalService';
import { getDoctors, getPatients } from '@/services/LocalService';
import { broadcastChannel } from '@/lib/broadcastChannel';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppointmentFormData } from '@/lib/types';

export default function SchedulePage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchAllData = async () => {
        try {
            const [doctorsData, patientsData, appointmentsData] = await Promise.all([
                getDoctors(),
                getPatients(),
                getAppointments(),
            ]);
            setDoctors(doctorsData);
            setPatients(patientsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Subscribe to broadcast events
        const unsubscribeDoctor = broadcastChannel.subscribe('doctor-added', (newDoctor: any) => {
            setDoctors((prev) => [...prev, newDoctor as any]);
        });
        const unsubscribePatient = broadcastChannel.subscribe(
            'patient-added',
            (newPatient: any) => {
                setPatients((prev) => [...prev, newPatient as any]);
            },
        );
        const unsubscribeAppointment = broadcastChannel.subscribe(
            'appointment-scheduled',
            (newAppointment: any) => {
                setAppointments((prev) => [...prev, newAppointment as any]);
            },
        );

        fetchAllData();

        return () => {
            unsubscribeDoctor();
            unsubscribePatient();
            unsubscribeAppointment();
        };
    }, []);

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        register,
    } = useForm<AppointmentFormData>();

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            setLoading(true);
            const newAppointment = await scheduleAppointment({
                doctorId: data.doctorId,
                patientId: data.patientId,
                date: selectedDate?.toISOString() || new Date().toISOString(),
                time: data.appointmentTime,
                notes: data.notes,
            });
            console.log('Appointment created successfully');
            setAppointments((prev) => [...prev, newAppointment as any]);
            reset();
            setSelectedDate(undefined);
        } catch (error) {
            console.error('Failed to create appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Schedule Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="patientId"
                                        className="block text-sm font-medium"
                                    >
                                        Select Patient
                                    </label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue('patientId', parseInt(value))
                                        }
                                        defaultValue={watch('patientId')?.toString()}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem
                                                    key={patient.id}
                                                    value={patient.id.toString()}
                                                >
                                                    {patient.name} ({patient.age} years)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patientId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.patientId.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="doctorId" className="block text-sm font-medium">
                                        Select Doctor
                                    </label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue('doctorId', parseInt(value))
                                        }
                                        defaultValue={watch('doctorId')?.toString()}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map((doctor) => (
                                                <SelectItem
                                                    key={doctor.id}
                                                    value={doctor.id.toString()}
                                                >
                                                    {doctor.name} ({doctor.specialization})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.doctorId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.doctorId.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Appointment Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !selectedDate && 'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? (
                                                    format(selectedDate, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.appointmentDate && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.appointmentDate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Appointment Time</label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue('appointmentTime', value)
                                        }
                                        defaultValue={watch('appointmentTime')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                '09:00',
                                                '10:00',
                                                '11:00',
                                                '12:00',
                                                '13:00',
                                                '14:00',
                                                '15:00',
                                                '16:00',
                                                '17:00',
                                            ].map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.appointmentTime && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.appointmentTime.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    {...register('notes')}
                                    className="w-full rounded-md border p-2"
                                    placeholder="Add any notes about the appointment..."
                                />
                            </div>

                            <div className="mt-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Schedule Appointment'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                {
                                                    patients.find(
                                                        (p) => p.id === appointment.patient_id,
                                                    )?.name
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    doctors.find(
                                                        (d) => d.id === appointment.doctor_id,
                                                    )?.name
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {new Date(appointment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{appointment.time}</TableCell>
                                            <TableCell>{appointment.notes || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
