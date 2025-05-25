'use client';

import { getDoctors, getPatients } from '@/services/LocalService';
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

interface Doctor {
    id: number;
    name: string;
    age: number;
    specialization: string;
    phone: string;
    notes: string;
}

interface Patient {
    id: number;
    name: string;
    age: number;
    condition: string;
    phone: string;
    notes: string;
}

export default function Home() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [patients, setPatients] = useState<Patient[]>([]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await getDoctors();
            setDoctors(data as Doctor[]);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getPatients();
            setPatients(data as Patient[]);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
    }, []);

    return (
        <div className="container mx-auto py-10 w-full">
            <div className="flex flex-row w-full gap-8">
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
