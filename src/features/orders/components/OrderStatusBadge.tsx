import { View } from "react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { OrderStatus } from "../schemas";

const styles: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-warning/15", text: "text-warning", label: "Draft" },
  SUBMITTED: { bg: "bg-brand-light", text: "text-brand-dark", label: "Submitted" },
  APPROVED: { bg: "bg-success/15", text: "text-success", label: "Approved" },
  REJECTED: { bg: "bg-danger/15", text: "text-danger", label: "Rejected" },
  IN_PRODUCTION: { bg: "bg-brand-light", text: "text-brand-dark", label: "In production" },
  DISPATCHED: { bg: "bg-brand-light", text: "text-brand-dark", label: "Dispatched" },
  DELIVERED: { bg: "bg-success/15", text: "text-success", label: "Delivered" },
  SETTLED: { bg: "bg-ink-subtle/20", text: "text-ink-muted", label: "Settled" },
  CANCELLED: { bg: "bg-danger/15", text: "text-danger", label: "Cancelled" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = styles[status];
  return (
    <View className={cn("rounded-full px-3 py-1", s.bg)}>
      <Txt variant="caption" className={cn("font-semibold", s.text)}>
        {s.label}
      </Txt>
    </View>
  );
}
