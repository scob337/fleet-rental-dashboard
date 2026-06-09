interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Map of status values to Arabic labels and color classes
const statusMap: Record<string, { label: string; className: string }> = {
  // Vehicle statuses
  AVAILABLE:       { label: 'متاحة',           className: 'status-active' },
  RENTED:          { label: 'نشطة',             className: 'status-info' },
  MAINTENANCE:     { label: 'في الصيانة',       className: 'status-warning' },
  DAMAGED:         { label: 'معطلة',            className: 'status-danger' },
  RETIRED:         { label: 'متقاعدة',          className: 'status-inactive' },

  // Driver statuses
  ACTIVE:          { label: 'متاح',             className: 'status-active' },
  INACTIVE:        { label: 'غير نشط',          className: 'status-inactive' },
  ON_LEAVE:        { label: 'إجازة',            className: 'status-warning' },
  TERMINATED:      { label: 'موقوف',            className: 'status-danger' },
  ON_TRIP:         { label: 'في رحلة',          className: 'status-info' },

  // Contract statuses
  DRAFT:           { label: 'مسودة',            className: 'status-inactive' },
  COMPLETED:       { label: 'مكتمل',            className: 'status-active' },
  CANCELLED:       { label: 'ملغي',             className: 'status-danger' },
  PENDING:         { label: 'معلق',             className: 'status-warning' },

  // Revenue statuses
  RECEIVED:        { label: 'محصّل',            className: 'status-active' },
  PARTIAL:         { label: 'جزئي',             className: 'status-warning' },

  // Maintenance statuses
  SCHEDULED:       { label: 'مجدولة',           className: 'status-info' },
  IN_PROGRESS:     { label: 'جارية',            className: 'status-warning' },

  // Customer statuses
  BLACKLISTED:     { label: 'محظور',            className: 'status-danger' },

  // Invoice statuses
  PAID:            { label: 'مدفوع',            className: 'status-active' },
  PARTIALLY_PAID:  { label: 'مدفوع جزئياً',    className: 'status-warning' },
  OVERDUE:         { label: 'متأخر',            className: 'status-danger' },

  // Rental statuses
  RENTAL_ACTIVE:   { label: 'نشط',              className: 'status-active' },
  RENTAL_COMPLETED:{ label: 'مكتمل',           className: 'status-inactive' },

  // Expense categories
  FUEL:            { label: 'وقود',             className: 'status-info' },
  SALARIES:        { label: 'رواتب',            className: 'status-purple' },
  OPERATION:       { label: 'تشغيل',            className: 'status-warning' },
  OTHER:           { label: 'أخرى',             className: 'status-inactive' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, className: 'status-inactive' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: string): string {
  return statusMap[status]?.label ?? status;
}
