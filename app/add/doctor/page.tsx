'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoctor } from '@/services/LocalService';
interface DoctorFormData {
    name: string;
    age: number;
    specialization: string;
    notes: string;
    phoneNumber: string;
}

export default function AddDoctorPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DoctorFormData>();

    const onSubmit = async (data: DoctorFormData) => {
        try {
            await addDoctor(data);
            console.log('Doctor added successfully');
            reset();
        } catch (error) {
            console.error('Failed to add doctor');
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Add Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2">Name</div>
                                <Input
                                    id="name"
                                    placeholder="Enter doctor's name"
                                    {...register('name', {
                                        required: 'Name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Name must be at least 2 characters',
                                        },
                                    })}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2">Age</div>
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
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2">Specialization</div>
                                <Input
                                    id="specialization"
                                    placeholder="Enter specialization"
                                    {...register('specialization', {
                                        required: 'Specialization is required',
                                    })}
                                />
                                {errors.specialization && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.specialization.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2">Phone Number</div>
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
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.phoneNumber.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2">Additional Notes</div>
                                <Textarea
                                    id="notes"
                                    placeholder="Enter any additional notes about the doctor"
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
        </div>
    );
}
