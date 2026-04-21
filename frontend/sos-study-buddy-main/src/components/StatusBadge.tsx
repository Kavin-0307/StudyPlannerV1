import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  missed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unprocessed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[typeof status === 'string' ? status.toLowerCase() : 'pending'] || statusStyles.pending;
  return (
    <Badge variant="outline" className={`${style} border-0 capitalize`}>
      {status}
    </Badge>
  );
}
