import { Badge } from "@/components/ui/badge";

interface ReportPriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
}

export function ReportPriorityBadge({ priority }: ReportPriorityBadgeProps) {
  let color = "bg-gray-500 hover:bg-gray-600";
  if (priority === "HIGH") color = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  else if (priority === "MEDIUM") color = "bg-amber-500 text-white hover:bg-amber-600";
  else if (priority === "LOW") color = "bg-emerald-500 text-white hover:bg-emerald-600";
  
  return <Badge className={color}>{priority}</Badge>;
}

interface ReportStatusBadgeProps {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | string;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let colorClass = "";

  if (status === "OPEN") {
    variant = "default";
    colorClass = "bg-blue-500 hover:bg-blue-600";
  } else if (status === "IN_PROGRESS") {
    variant = "secondary";
    colorClass = "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-100";
  } else if (status === "RESOLVED") {
    variant = "default";
    colorClass = "bg-emerald-500 hover:bg-emerald-600 text-white";
  } else if (status === "REJECTED") {
    variant = "destructive";
  }

  return <Badge variant={variant} className={colorClass}>{status}</Badge>;
}
