'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoctor, getDoctors } from '@/services/LocalService';
import { broadcastChannel } from '@/lib/broadcastChannel';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
interface DoctorFormData {
    name: string;
    age: number;
    specialization: string;
    notes: string;
    phoneNumber: string;
}

interface Doctor {
    id: number;
    name: string;
    age: number;
    specialization: string;
    phone: string;
    notes: string;
}

export default function AddDoctorPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DoctorFormData>();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

    useEffect(() => {
        fetchDoctors();

        const unsubscribe = broadcastChannel.subscribe('doctor-added', (newDoctor: any) => {
            setDoctors(prev => [...prev, newDoctor as Doctor]);
        });

        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: DoctorFormData) => {
        try {
            setLoading(true);
            const newDoctor = await addDoctor(data);
            console.log('Doctor added successfully');
            setDoctors(prev => [...prev, newDoctor as Doctor]);
            reset();
        } catch (error) {
            console.error('Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex flex-col mx-auto py-10 gap-12 max-h-[100%]">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Add Doctor</CardTitle>
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
                                    placeholder="Enter doctor name"
                                    {...register('name', {
                                        required: 'Name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Name must be at least 2 characters',
                                        },
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
                                        min: { value: 18, message: 'Age must be at least 18' },
                                        max: {
                                            value: 100,
                                            message: 'Age must be less than 100',
                                        },
                                    })}
                                />
                                {errors.age && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="specialization"
                                    className="block text-sm font-medium"
                                >
                                    Specialization
                                </label>
                                <Input
                                    id="specialization"
                                    placeholder="Enter specialization"
                                    {...register('specialization', {
                                        required: 'Specialization is required',
                                    })}
                                />
                                {errors.specialization && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.specialization.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium">
                                    Phone Number
                                </label>
                                <Input
                                    id="phoneNumber"
                                    placeholder="Enter phone number"
                                    {...register('phoneNumber', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Phone number must be 10 digits',
                                        },
                                    })}
                                />
                                {errors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.phoneNumber.message}
                                    </p>
                                )}
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
                        </div>

                        <Button type="submit" className="w-full">
                            Add Doctor
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Available Doctors</CardTitle>
                </CardHeader>
                <CardContent className="h-[50%]">
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
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
