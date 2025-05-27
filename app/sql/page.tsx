'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { SQLQueryForm } from '@/lib/types';
import { rawQuery } from '@/services/LocalService';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const tableSchemas = {
    doctors: {
        columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'age', type: 'INTEGER' },
            { name: 'specialization', type: 'VARCHAR(255)' },
            { name: 'notes', type: 'TEXT' },
            { name: 'phone', type: 'VARCHAR(20)' },
        ],
    },
    patients: {
        columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'age', type: 'INTEGER' },
            { name: 'condition', type: 'VARCHAR(255)' },
            { name: 'notes', type: 'TEXT' },
            { name: 'phone', type: 'VARCHAR(20)' },
        ],
    },
    appointments: {
        columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'doctor_id', type: 'INTEGER REFERENCES doctors(id)' },
            { name: 'patient_id', type: 'INTEGER REFERENCES patients(id)' },
            { name: 'appointment_date', type: 'TIMESTAMP' },
            { name: 'status', type: 'VARCHAR(50)' },
            { name: 'notes', type: 'TEXT' },
        ],
    },
};

export default function SqlPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<string[][]>([]);

    const {
        handleSubmit,
        formState: { errors },
        reset,
        register,
    } = useForm<SQLQueryForm>();

    const onSubmit = async (data: SQLQueryForm) => {
        try {
            const { query } = data;
            setLoading(true);
            const results = await rawQuery(query);
            setResults(results.rows);
        } catch (error) {
            console.error('Failed to run query:', error);
            setError(error instanceof Error ? error.message : 'Failed to run query');
            reset();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Run Raw SQL Query</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Textarea
                            id="query"
                            placeholder="Enter your query..."
                            {...register('query')}
                        />
                        {errors.query && (
                            <p className="mt-1 text-sm text-red-600">{errors.query.message}</p>
                        )}
                        <Button type="submit">Run Query</Button>
                    </form>
                </CardContent>
            </Card>

            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Show table schemas</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(tableSchemas).map(([tableName, { columns }]) => (
                                <Card key={tableName}>
                                    <CardHeader>
                                        <CardTitle>
                                            {tableName.charAt(0).toUpperCase() + tableName.slice(1)}{' '}
                                            Table
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                {columns.map((column, index) => (
                                                    <div key={index} className="flex flex-col">
                                                        <span className="font-medium">
                                                            {column.name}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {column.type}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Card>
                <CardHeader>
                    <CardTitle>Query Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="text-red-600">Error: {error}</p>
                        ) : (
                            <pre>
                                {results.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(results[0]).map((key) => (
                                                    <TableHead key={key}>{key}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((row, index) => (
                                                <TableRow key={index}>
                                                    {Object.values(row).map((value, index) => (
                                                        <TableCell key={index}>{value}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p>No results found</p>
                                )}
                            </pre>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
