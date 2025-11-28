"use client";

import React from "react";
import { cn } from "@/lib/utils";
import styles from "../../styles/ShineBorder.module.css";

interface ShineBorderProps {
  borderRadius?: number;         
  borderWidth?: number;          
  duration?: number;              
  color?: string | string[];      
  className?: string;
  children: React.ReactNode;
}

export default function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  const colorValue = Array.isArray(color) ? color.join(",") : color;

  return (
    <div
     
      style={
        {
          "--shine-radius":        `${borderRadius}px`,
          "--shine-border-width":  `${borderWidth}px`,
          "--shine-duration":      `${duration}s`,
          "--shine-colors":        colorValue,
        } as React.CSSProperties
      }
      className={cn(styles.wrapper, className)}
    >
      {children}
    </div>
  );
}
