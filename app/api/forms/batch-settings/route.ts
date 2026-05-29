import { NextResponse } from "next/server";
import {
  buildBatchId,
  formatBatchRegistrationLabel,
  getCurrentBatchSettings,
} from "@/lib/batch-settings";

export async function GET() {
  try {
    const settings = await getCurrentBatchSettings();

    return NextResponse.json(
      {
        batchMonth: settings.batchMonth,
        batchNumber: settings.batchNumber,
        batchLabel: formatBatchRegistrationLabel(settings),
        batchIdExamples: {
          dmOffline: buildBatchId("DM", "offline", settings.batchNumber),
          hrOffline: buildBatchId("HR", "offline", settings.batchNumber),
          dmOnline: buildBatchId("DM", "online", settings.batchNumber),
          hrOnline: buildBatchId("HR", "online", settings.batchNumber),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching batch settings:", error);
    return NextResponse.json({ error: "Unable to load batch settings." }, { status: 500 });
  }
}
