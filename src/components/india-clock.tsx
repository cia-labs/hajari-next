"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

export function IndiaClock() {
    const [time, setTime] = useState("")

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const formatted = format(now, "hh:mm:ss", { timeZone: "Asia/Kolkata" })
            setTime(formatted)
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="text-sm font-mono text-muted-foreground">
            {time}
        </div>
    )
}
