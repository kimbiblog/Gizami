import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase Admin credentials missing. Skipping payment initiation check.");
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { courseId, userId, phoneNumber, gateway, amount, courseTitle } = await req.json();

    if (!courseId || !userId || !phoneNumber || !gateway || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique transaction ID
    const transactionId = `GIZ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const returnUrl = `${siteUrl}/payment/callback?courseId=${courseId}&txId=${transactionId}`;
    const notifyUrl = `${siteUrl}/api/payment/webhook`;

    // Store pending payment in DB
    await supabaseAdmin.from("payments").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      course_id: courseId,
      transaction_id: transactionId,
      amount,
      currency: "XAF",
      gateway,
      status: "pending",
    });

    // Call PayUnit
    const apiKey = process.env.PAYUNIT_API_KEY!;
    const apiToken = process.env.PAYUNIT_API_TOKEN!;
    const apiUrl = process.env.PAYUNIT_API_URL || "https://gateway.payunit.net";

    const payunitRes = await fetch(`${apiUrl}/api/gateway/makepayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${apiToken}`,
        mode: "live",
      },
      body: JSON.stringify({
        gateway,
        amount,
        transaction_id: transactionId,
        return_url: returnUrl,
        notify_url: notifyUrl,
        phone_number: phoneNumber,
        currency: "XAF",
        paymentType: "button",
        name: courseTitle || "Gizami Course",
        description: `Enrollment for: ${courseTitle}`,
      }),
    });

    const payunitData = await payunitRes.json();
    console.log("PayUnit response:", payunitData);

    if (!payunitRes.ok || payunitData.status === "error") {
      // Clean up pending record on failure
      await supabaseAdmin.from("payments").delete().eq("transaction_id", transactionId);
      return NextResponse.json(
        { error: payunitData.message || "PayUnit request failed" },
        { status: 400 }
      );
    }

    // Return the redirect URL from PayUnit
    const redirectUrl =
      payunitData.transaction_data?.payment_url ||
      payunitData.payment_url ||
      payunitData.url ||
      payunitData.redirect_url;

    return NextResponse.json({
      success: true,
      transactionId,
      redirectUrl,
      payunitData,
    });
  } catch (err: any) {
    console.error("Payment initiation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
