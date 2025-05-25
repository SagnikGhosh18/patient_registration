'use client';

import { getPatients } from '@/services/LocalService';
import { addPatient } from '@/services/LocalService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface PatientFormData {
    name: string;
    age: number;
    condition: string;
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

export default function AddPatientPage() {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormData>();

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
        fetchPatients();
    }, []);

    const onSubmit: SubmitHandler<PatientFormData> = async (data) => {
        try {
            setLoading(true);
            await addPatient(data);
            console.log('Patient added successfully');
            reset();
        } catch (error) {
            console.error('Error adding patient:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex flex-col mx-auto py-10 gap-12">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Add Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">
                                    Name
                                </label>
                                <Input
                                    id="name"
                                    placeholder="Enter patient name"
                                    {...register('name', {
                                        required: 'Name is required',
                                    })}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium">
                                    Age
                                </label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="Enter age"
                                    {...register('age', {
                                        required: 'Age is required',
                                        min: { value: 0, message: 'Age must be positive' },
                                        max: { value: 150, message: 'Age must be less than 150' },
                                    })}
                                />
                                {errors.age && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium">
                                    Medical Condition
                                </label>
                                <Input
                                    id="condition"
                                    placeholder="Enter medical condition"
                                    {...register('condition', {
                                        required: 'Medical condition is required',
                                    })}
                                />
                                {errors.condition && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.condition.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium">
                                    Phone Number
                                </label>
                                <Input
                                    id="phone"
                                    placeholder="Enter phone number"
                                    {...register('phone', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/, // 10 digit phone number
                                            message: 'Please enter a valid 10 digit phone number',
                                        },
                                    })}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium">
                                Additional Notes
                            </label>
                            <Textarea
                                id="notes"
                                placeholder="Enter any additional notes..."
                                {...register('notes')}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Patient'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Available Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border h-full overflow-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
