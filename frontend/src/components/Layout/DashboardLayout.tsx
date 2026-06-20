import type { ReactNode } from "react";

interface DashboardLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

const DashboardLayout = ({ left, center, right }: DashboardLayoutProps) => (
  <main className="dashboard-layout">
    <section className="dashboard-col col-left">{left}</section>
    <section className="dashboard-col col-center">{center}</section>
    <section className="dashboard-col col-right">{right}</section>
  </main>
);

export default DashboardLayout;
