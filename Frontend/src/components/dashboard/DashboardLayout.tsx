
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none z-0"></div>
      <div className="flex-1 overflow-auto bg-background relative">
        <div className="relative z-10 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
