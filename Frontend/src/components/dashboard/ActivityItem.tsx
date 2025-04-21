
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
  iconClassName?: string;
}

const ActivityItem = ({
  icon,
  title,
  description,
  time,
  iconClassName,
}: ActivityItemProps) => {
  return (
    <div className="flex space-x-3">
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", iconClassName)}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <p className="font-medium text-gray-900">{title}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
