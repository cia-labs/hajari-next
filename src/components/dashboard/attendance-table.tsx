"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AttendanceTable({ data, loading }: { data: any[]; loading: boolean }) {
    if (loading) {
        return (
            <Card className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </Card>
        )
    }

    if (!data.length) {
        return (
            <Card className="p-4 text-muted-foreground text-center">
                No attendance data available.
            </Card>
        )
    }

    const subjects = Object.keys(data[0]?.subjects || {})

    return (
        <Card className="p-4 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        {subjects.map((subject) => (
                            <TableHead key={subject}>{subject} %</TableHead>
                        ))}
                        <TableHead>Total %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((student, idx) => {
                        const total = Object.values(student.subjects).reduce(
                            (acc: any, s: any) => {
                                acc.present += s.stats.present
                                acc.total += s.stats.total
                                return acc
                            },
                            { present: 0, total: 0 }
                        )
                        const overall = total.total
                            ? Math.round((total.present / total.total) * 1000) / 10
                            : 0

                        return (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">
                                    <div>{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.usnNumber}</div>
                                </TableCell>
                                {subjects.map((sub) => (
                                    <TableCell key={sub}>
                                        {student.subjects?.[sub]?.stats?.percentage ?? "N/A"}%
                                    </TableCell>
                                ))}
                                <TableCell className="font-semibold">{overall}%</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    )
}
