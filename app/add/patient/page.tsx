'use client';

import { addPatient } from '@/services/LocalService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

interface PatientFormData {
    name: string;
    age: number;
    condition: string;
    phone: string;
    notes: string;
}

export default function AddPatientPage() {
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormData>();

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
        <div className="container mx-auto py-10">
            <Card className="w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Add Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium">
                                Additional Notes
                            </label>
                            <Textarea
                                id="notes"
                                placeholder="Enter any additional notes..."
                                {...register('notes')}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Patient'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
