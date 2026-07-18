import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// DrimzWallet Integration (Generic)

// Helper: dig a status value out of whatever shape DrimzWallet sends.
// Their payload nests the real status under data.payment.status (see sample
// checkout responses). We check every plausible location so we don't depend
// on one exact shape.
function extractStatus(body: any): string {
  return (
    body?.data?.payment?.status ??
    body?.data?.status ??
    body?.payment?.status ??
    body?.status ??
    body?.transaction_status ??
    ""
  )
    .toString()
    .toUpperCase();
}

// Helper: pull the transaction reference out of the body if it isn't in the query string.
function extractTxId(body: any): string | null {
  return (
    body?.transaction_id ||
    body?.transactionId ||
    body?.reference ||
    body?.data?.session_id ||
    body?.session_id ||
    null
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase Admin credentials missing during webhook execution.");
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Prefer the txId we attached to the webhook_url query string on initiation.
    let transactionId = req.nextUrl.searchParams.get("txId");
    if (!transactionId) {
      transactionId = extractTxId(body);
    }

    const status = extractStatus(body);

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    // Look up the pending payment
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (payment.status === "paid") {
      // Already processed — idempotent response
      return NextResponse.json({ success: true, already: true });
    }

    // DrimzWallet uses PAYMENT_* codes (PAYMENT_PENDING, PAYMENT_SUCCESS, etc.).
    // Match on substrings so we survive minor naming differences
    // (SUCCESS vs SUCCESSFUL vs SUCCEEDED, COMPLETED vs COMPLETE, PAID).
    const isSuccess = /SUCCE|COMPLET|PAID/.test(status);
    const isFailure = /FAIL|CANCEL|EXPIR|DECLIN|REJECT/.test(status);

    if (isSuccess) {
      // Mark payment as paid
      await supabaseAdmin
        .from("payments")
        .update({ status: "paid" })
        .eq("transaction_id", transactionId);

      if (payment.course_id === "subscription") {
        // Calculate new end date (30 days from now)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // Update user profile with subscription_end_date
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_end_date: endDate.toISOString() })
          .eq("id", payment.user_id);
      } else {
        // Create enrollment if not already enrolled
        const { data: existing } = await supabaseAdmin
          .from("enrollments")
          .select("user_id")
          .eq("user_id", payment.user_id)
          .eq("course_id", payment.course_id)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from("enrollments").insert({
            user_id: payment.user_id,
            course_id: payment.course_id,
            progress: 0,
            status: "active",
          });
        }
      }
    } else if (isFailure) {
      // Only mark failed on an explicit failure status.
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("transaction_id", transactionId);
    } else {
      // PENDING / unknown: DrimzWallet often fires an initial pending webhook
      // before the final one. Leave the record untouched so the final webhook
      // can still resolve it. (The old code wrongly marked these as "failed".)
      console.log(`Webhook status "${status}" for ${transactionId} — leaving as pending.`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PayUnit / DrimzWallet may send GET pings
export async function GET() {
  return NextResponse.json({ ok: true });
}
