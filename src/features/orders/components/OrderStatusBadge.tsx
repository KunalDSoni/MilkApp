import { Badge, BadgeTone } from "@/components/ui/Badge";
import { OrderStatus } from "../schemas";

const map: Record<OrderStatus, { tone: BadgeTone; label: string }> = {
  DRAFT: { tone: "warning", label: "Draft" },
  SUBMITTED: { tone: "accent", label: "Submitted" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
  IN_PRODUCTION: { tone: "accent", label: "In production" },
  DISPATCHED: { tone: "accent", label: "Dispatched" },
  DELIVERED: { tone: "success", label: "Delivered" },
  SETTLED: { tone: "neutral", label: "Settled" },
  CANCELLED: { tone: "danger", label: "Cancelled" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = map[status];
  return <Badge label={s.label} tone={s.tone} />;
}
