export interface DashboardRevenuePoint {
  month: string;
  revenue: number;
}

export interface DashboardBreakdownItem {
  name: string;
  value: number;
}

export interface DashboardTuitionItem {
  name: string;
  value: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface DashboardOverview {
  totals: {
    courses: number;
    users: number;
    students: number;
    registrations: number;
    approvedRegistrations: number;
    paidInvoices: number;
    openPeriods: number;
    totalRevenue: number;
  };
  revenueByMonth: DashboardRevenuePoint[];
  tuitionBreakdown: DashboardTuitionItem[];
  courseBreakdown: DashboardBreakdownItem[];
  conversionRate: {
    totalRegistrations: number;
    approvedRegistrations: number;
    rate: number;
  };
}
