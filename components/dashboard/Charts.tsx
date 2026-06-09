'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

const monthlyRevenue = [
  { month: 'يناير', revenue: 45000, expenses: 28000 },
  { month: 'فبراير', revenue: 52000, expenses: 31000 },
  { month: 'مارس', revenue: 48000, expenses: 29000 },
  { month: 'أبريل', revenue: 61000, expenses: 35000 },
  { month: 'مايو', revenue: 55000, expenses: 32000 },
  { month: 'يونيو', revenue: 67000, expenses: 38000 },
  { month: 'يوليو', revenue: 72000, expenses: 41000 },
  { month: 'أغسطس', revenue: 68000, expenses: 39000 },
  { month: 'سبتمبر', revenue: 74000, expenses: 43000 },
  { month: 'أكتوبر', revenue: 80000, expenses: 46000 },
  { month: 'نوفمبر', revenue: 76000, expenses: 44000 },
  { month: 'ديسمبر', revenue: 85000, expenses: 50000 },
];

const dailyTrips = [
  { day: 'السبت', trips: 24 },
  { day: 'الأحد', trips: 31 },
  { day: 'الاثنين', trips: 28 },
  { day: 'الثلاثاء', trips: 35 },
  { day: 'الأربعاء', trips: 29 },
  { day: 'الخميس', trips: 38 },
  { day: 'الجمعة', trips: 18 },
];

const expensesPie = [
  { name: 'وقود', value: 35, color: '#3b82f6' },
  { name: 'رواتب', value: 28, color: '#a855f7' },
  { name: 'صيانة', value: 20, color: '#f59e0b' },
  { name: 'تشغيل', value: 12, color: '#10b981' },
  { name: 'أخرى', value: 5, color: '#6b7280' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
        <p className="font-bold mb-1 text-foreground">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('ar-SA')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueVsExpensesChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <h3 className="font-bold text-base mb-4">مقارنة الإيرادات بالمصروفات</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="#f59e0b" fill="url(#colorExpenses)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyTripsChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <h3 className="font-bold text-base mb-4">عدد الرحلات اليومية</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dailyTrips} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="trips" name="الرحلات" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensesPieChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <h3 className="font-bold text-base mb-4">توزيع المصروفات</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={expensesPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {expensesPie.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 text-sm min-w-max">
          {expensesPie.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-bold mr-auto">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MonthlyRevenueChart() {
  const recent = monthlyRevenue.slice(-6);
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <h3 className="font-bold text-base mb-4">الإيرادات الشهرية</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={recent} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="المصروفات" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
