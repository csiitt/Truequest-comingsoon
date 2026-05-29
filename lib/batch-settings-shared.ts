export const DEFAULT_BATCH_MONTH = "May";
export const DEFAULT_BATCH_NUMBER = "01";

export const BATCH_MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type BatchMonthOption = (typeof BATCH_MONTH_OPTIONS)[number];

export type CurrentBatchSettings = {
  batchMonth: string;
  batchNumber: string;
};

export function normalizeBatchNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return DEFAULT_BATCH_NUMBER;
  }

  const parsed = Number(digits);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 99) {
    throw new Error("Batch number must be between 01 and 99.");
  }

  return String(parsed).padStart(2, "0");
}

export function isBatchMonthOption(value: string): value is BatchMonthOption {
  return (BATCH_MONTH_OPTIONS as readonly string[]).includes(value);
}

export function resolveBatchMonth(value: string): BatchMonthOption {
  const month = value.trim();
  if (isBatchMonthOption(month)) {
    return month;
  }

  return DEFAULT_BATCH_MONTH;
}

export function normalizeBatchMonth(value: string): BatchMonthOption {
  const month = value.trim();
  if (!isBatchMonthOption(month)) {
    throw new Error("Please select a valid batch month.");
  }

  return month;
}

export function buildBatchId(
  course: "DM" | "HR" | null,
  attendanceMode: "online" | "offline" | null,
  batchNumber: string,
): string | null {
  const suffix = normalizeBatchNumber(batchNumber);

  if (course === "DM" && attendanceMode === "offline") {
    return `TQLDM${suffix}`;
  }
  if (course === "HR" && attendanceMode === "offline") {
    return `TQLHR${suffix}`;
  }
  if (course === "DM" && attendanceMode === "online") {
    return `TQLODM${suffix}`;
  }
  if (course === "HR" && attendanceMode === "online") {
    return `TQLOHR${suffix}`;
  }

  return null;
}

export function formatBatchRegistrationLabel(settings: CurrentBatchSettings): string {
  return `${settings.batchMonth} Batch Registration`;
}
