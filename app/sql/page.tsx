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
        <div className="container mx-auto py-10 flex flex-col gap-4">
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
