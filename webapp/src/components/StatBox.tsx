interface StatBoxProps {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
}

export default function StatBox({ value, label, icon }: StatBoxProps) {
  return (
    <div className="stat-box bg-white rounded-lg border border-[var(--border)]">
      {icon && <div className="text-[var(--violet)] mb-2">{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
