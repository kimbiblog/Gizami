import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import TRANZAK from "tranzak-node";

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
    console.log("Webhook received:", body);

    let transactionId = body.transaction_id || body.transactionId;
    let status = body.status || body.transaction_status;
    let isTranzak = false;

    // Try to validate as Tranzak Webhook
    const appId = process.env.TRANZAK_APP_ID;
    const appKey = process.env.TRANZAK_APP_KEY;
    
    if (appId && appKey) {
      try {
        const client = new TRANZAK({ appId, appKey, mode: process.env.TRANZAK_MODE || "sandbox" });
        const isValid = await client.webhook.process(body);
        if (isValid) {
          isTranzak = true;
          // Tranzak webhook structure
          transactionId = body.data?.mchTransactionRef || body.data?.requestId;
          status = body.data?.status;
        }
      } catch (e) {
        // Not a valid Tranzak webhook, fallback to PayUnit
      }
    }

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

    const isSuccess =
      status === "SUCCESSFUL" ||
      status === "SUCCESS" ||
      status === "success" ||
      status === "COMPLETED";

    if (isSuccess) {
      // Mark payment as paid
      await supabaseAdmin
        .from("payments")
        .update({ status: "paid" })
        .eq("transaction_id", transactionId);

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
    } else {
      // Mark as failed
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("transaction_id", transactionId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PayUnit may send GET pings
export async function GET() {
  return NextResponse.json({ ok: true });
}
