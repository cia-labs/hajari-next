"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MoonStar, Sun } from "lucide-react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={18} /> : <MoonStar size={18} />}
        </Button>
    )
}
