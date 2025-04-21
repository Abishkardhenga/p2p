
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium mr-1",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.positive ? "+" : "-"}{trend.value}
            </span>
            <span className="text-xs text-gray-500">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
