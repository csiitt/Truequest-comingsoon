import { sql } from "@/lib/db";
import {
  DEFAULT_BATCH_MONTH,
  DEFAULT_BATCH_NUMBER,
  normalizeBatchMonth,
  normalizeBatchNumber,
  resolveBatchMonth,
  type CurrentBatchSettings,
} from "@/lib/batch-settings-shared";

export {
  BATCH_MONTH_OPTIONS,
  DEFAULT_BATCH_MONTH,
  DEFAULT_BATCH_NUMBER,
  buildBatchId,
  formatBatchRegistrationLabel,
  isBatchMonthOption,
  normalizeBatchMonth,
  normalizeBatchNumber,
  resolveBatchMonth,
  type BatchMonthOption,
  type CurrentBatchSettings,
} from "@/lib/batch-settings-shared";

export async function ensureBatchSettingsSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id integer PRIMARY KEY,
      next_batch_start_date date,
      updated_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS current_batch_month text
  `;

  await sql`
    ALTER TABLE admin_settings
    ADD COLUMN IF NOT EXISTS current_batch_number text
  `;
}

export async function getCurrentBatchSettings(): Promise<CurrentBatchSettings> {
  await ensureBatchSettingsSchema();

  const rows = (await sql`
    SELECT current_batch_month, current_batch_number
    FROM admin_settings
    WHERE id = 1
    LIMIT 1
  `) as Array<{
    current_batch_month: string | null;
    current_batch_number: string | null;
  }>;

  const storedMonth = rows[0]?.current_batch_month?.trim();
  const storedNumber = rows[0]?.current_batch_number?.trim();

  let batchNumber = DEFAULT_BATCH_NUMBER;
  if (storedNumber) {
    try {
      batchNumber = normalizeBatchNumber(storedNumber);
    } catch {
      batchNumber = DEFAULT_BATCH_NUMBER;
    }
  }

  return {
    batchMonth: resolveBatchMonth(storedMonth || DEFAULT_BATCH_MONTH),
    batchNumber,
  };
}

export async function saveCurrentBatchSettings(
  monthInput: string,
  batchNumberInput: string,
): Promise<CurrentBatchSettings> {
  const batchMonth = normalizeBatchMonth(monthInput);
  const batchNumber = normalizeBatchNumber(batchNumberInput);

  await sql`
    INSERT INTO admin_settings (id, current_batch_month, current_batch_number, updated_at)
    VALUES (1, ${batchMonth}, ${batchNumber}, now())
    ON CONFLICT (id) DO UPDATE SET
      current_batch_month = EXCLUDED.current_batch_month,
      current_batch_number = EXCLUDED.current_batch_number,
      updated_at = now()
  `;

  return { batchMonth, batchNumber };
}
