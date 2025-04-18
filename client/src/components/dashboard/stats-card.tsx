import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  className,
  iconClassName,
}: StatsCardProps) {
  // Determine if the change is positive or negative
  const isPositive = change && !change.startsWith('-');
  
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn(
            "p-3 rounded-full text-primary-700",
            iconClassName || "bg-primary-100"
          )}>
            {icon}
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
            <p className="text-xl font-semibold text-neutral-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className="mt-3 text-sm">
            <span className={cn(
              "font-medium",
              isPositive ? "text-success" : "text-error"
            )}>
              {change}
            </span>
            <span className="text-neutral-500"> from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
