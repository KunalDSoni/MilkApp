import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowDownLeft, ArrowUpRight, MessageCircle, Wallet } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useOutletLedger } from "@/features/ledger/hooks";
import { LedgerEntry } from "@/features/ledger/schemas";
import { useCustomers } from "@/features/customers/hooks";
import { normalizeError } from "@/core/api/errors";
import { openWhatsApp } from "@/lib/whatsapp";
import { formatCurrency, formatDate } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function OutletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ledger = useOutletLedger(id);
  const customers = useCustomers();

  // Phone/WhatsApp live on the customer record, not the ledger response.
  const customer = useMemo(
    () => customers.data?.find((c) => c.id === id),
    [customers.data, id],
  );

  const data = ledger.data;
  const overLimit = !!data && data.creditLimit > 0 && data.balance > data.creditLimit;
  const usedPct =
    data && data.creditLimit > 0
      ? Math.min(Math.round((data.balance / data.creditLimit) * 100), 100)
      : 0;

  const sendStatement = () => {
    if (!data) return;
    const phone = customer?.whatsapp ?? customer?.phone ?? "";
    openWhatsApp(phone, statementMessage(data.outletName, data.balance, data.entries));
  };

  const sendReminder = () => {
    if (!data) return;
    const phone = customer?.whatsapp ?? customer?.phone ?? "";
    openWhatsApp(phone, reminderMessage(data.outletName, data.balance));
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: data?.outletName ?? "Outlet" }} />
      {ledger.isLoading ? (
        <LoadingState />
      ) : ledger.isError || !data ? (
        <ErrorState message={normalizeError(ledger.error).message} onRetry={ledger.refetch} />
      ) : (
        <ScrollView contentContainerClassName="p-4 gap-4">
          {/* Balance + credit limit */}
          <Card className="gap-4" variant="elevated">
            <View className="flex-row items-center justify-between">
              <Txt variant="overline">Outstanding balance</Txt>
              {overLimit ? (
                <Badge label="Over limit" tone="danger" />
              ) : data.balance > 0 ? (
                <Badge label="Dues pending" tone="warning" />
              ) : (
                <Badge label="Account clear" tone="success" />
              )}
            </View>
            <Txt variant="numXl" className={overLimit ? "text-danger" : "text-ink"}>
              {formatCurrency(data.balance)}
            </Txt>

            {data.creditLimit > 0 ? (
              <View className="gap-1.5">
                <View className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <View
                    className={overLimit ? "h-2 rounded-full bg-danger" : "h-2 rounded-full bg-accent"}
                    style={{ width: `${Math.max(usedPct, 4)}%` }}
                  />
                </View>
                <Txt variant="caption" className="text-ink-muted">
                  {overLimit
                    ? `Over the ${formatCurrency(data.creditLimit)} limit by ${formatCurrency(data.balance - data.creditLimit)}`
                    : `${formatCurrency(data.balance)} of ${formatCurrency(data.creditLimit)} limit · ${formatCurrency(Math.max(data.creditLimit - data.balance, 0))} available`}
                </Txt>
              </View>
            ) : (
              <Txt variant="caption" className="text-ink-muted">
                No credit limit set
              </Txt>
            )}
          </Card>

          {/* Actions */}
          <Button
            label="Record payment"
            icon={<Wallet size={18} color={colors.white} strokeWidth={2.3} />}
            onPress={() => router.push(`/(app)/customers/${id}/collect`)}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Send statement" variant="secondary" size="md" onPress={sendStatement} />
            </View>
            {data.balance > 0 ? (
              <View className="flex-1">
                <Button
                  label="Payment reminder"
                  variant="secondary"
                  size="md"
                  icon={<MessageCircle size={16} color={colors.accent} strokeWidth={2.3} />}
                  onPress={sendReminder}
                />
              </View>
            ) : null}
          </View>

          {/* Statement */}
          <View className="gap-2">
            <Txt variant="overline" className="mt-1">
              Statement
            </Txt>
            {data.entries.length === 0 ? (
              <Card variant="flat">
                <Txt variant="muted">No transactions yet.</Txt>
              </Card>
            ) : (
              <Card variant="flat" className="gap-0 p-0">
                {data.entries.map((e, i) => (
                  <LedgerRow key={e.id} entry={e} last={i === data.entries.length - 1} />
                ))}
              </Card>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function LedgerRow({ entry, last }: { entry: LedgerEntry; last: boolean }) {
  const isDebit = entry.type === "DEBIT";
  const label =
    entry.refType === "ORDER"
      ? "Order"
      : entry.refType === "PAYMENT"
        ? "Payment"
        : entry.refType.charAt(0) + entry.refType.slice(1).toLowerCase();
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-border"}`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${isDebit ? "bg-danger-soft" : "bg-success-soft"}`}
      >
        {isDebit ? (
          <ArrowUpRight size={18} color={colors.danger} strokeWidth={2.4} />
        ) : (
          <ArrowDownLeft size={18} color={colors.success} strokeWidth={2.4} />
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Txt variant="label">{label}</Txt>
        <Txt variant="caption" className="text-ink-muted">
          {entry.note ? `${entry.note} · ` : ""}
          {formatDate(entry.createdAt)}
        </Txt>
      </View>
      <View className="items-end gap-0.5">
        <Txt variant="num" className={isDebit ? "text-danger" : "text-success"}>
          {isDebit ? "+" : "−"}
          {formatCurrency(entry.amount)}
        </Txt>
        <Txt variant="caption" className="text-ink-subtle">
          Bal {formatCurrency(entry.balanceAfter)}
        </Txt>
      </View>
    </View>
  );
}

function statementMessage(name: string, balance: number, entries: LedgerEntry[]): string {
  const recent = entries
    .slice(0, 5)
    .map(
      (e) =>
        `${formatDate(e.createdAt)}  ${e.type === "DEBIT" ? "+" : "−"}${formatCurrency(e.amount)}  (bal ${formatCurrency(e.balanceAfter)})`,
    )
    .join("\n");
  return (
    `*${name} — Account statement*\n\n` +
    `Outstanding balance: ${formatCurrency(balance)}\n\n` +
    (recent ? `Recent:\n${recent}\n\n` : "") +
    `Please clear the outstanding amount at your earliest. Thank you!`
  );
}

function reminderMessage(name: string, balance: number): string {
  return (
    `Hello ${name}, this is a gentle reminder that ${formatCurrency(balance)} is ` +
    `outstanding on your account. Kindly arrange the payment at your convenience. Thank you!`
  );
}
