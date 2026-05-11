import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import TRANZAK from "tranzak-node";

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

    // Check which payment provider is active from settings, default to tranzak if not set
    // In our implementation plan, the user wants to use tranzak.
    // If the provider isn't stored in a generic 'settings' table yet, we'll default to 'tranzak'.
    let activeProvider = "tranzak";
    // We'll also check if the user selected Tranzak explicitly if we had frontend support for it
    
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

    if (activeProvider === "tranzak") {
      const appId = process.env.TRANZAK_APP_ID;
      const appKey = process.env.TRANZAK_APP_KEY;
      const mode = process.env.TRANZAK_MODE || "sandbox";

      if (!appId || !appKey) {
        return NextResponse.json({ error: "Tranzak credentials missing" }, { status: 503 });
      }

      const client = new TRANZAK({ appId, appKey, mode });
      
      // We pass the transactionId as customTransactionRef or mchTransactionRef
      // Tranzak requires the phone number without the +
      const cleanPhone = phoneNumber.replace("+", "");

      // Send the prompt directly to the user's phone!
      const transaction = await client.payment.collection.simple.chargeMobileMoney({
        amount,
        currencyCode: "XAF",
        description: `Enrollment for: ${courseTitle}`,
        payerNote: `Payment for Gizami course`,
        mchTransactionRef: transactionId,
        mobileWalletNumber: cleanPhone,
      });

      // Update the DB record with Tranzak's internal request ID so the webhook can match it
      // Wait, the callback page polls using transactionId (which is mchTransactionRef).
      // So we don't strictly need to overwrite it, but it's good to keep Tranzak's requestId.
      await supabaseAdmin
        .from("payments")
        .update({ provider_ref: transaction.data.requestId })
        .eq("transaction_id", transactionId);

      // Tranzak processes it directly. We redirect the user to our callback page to poll!
      return NextResponse.json({
        success: true,
        transactionId,
        redirectUrl: returnUrl,
      });

    } else {
      // Call PayUnit
      const apiKey = process.env.PAYUNIT_API_KEY!;
      const apiToken = process.env.PAYUNIT_API_TOKEN!;
      const apiUser = process.env.PAYUNIT_API_USER!;
      const apiUrl = process.env.PAYUNIT_API_URL || "https://gateway.payunit.net";

      // Create Basic Auth header
      const authHeader = `Basic ${Buffer.from(`${apiUser}:${apiToken}`).toString("base64")}`;

      // PayUnit requires HTTPS for callback URLs in live mode.
      let finalReturnUrl = returnUrl;
      let finalNotifyUrl = notifyUrl;
      
      const mode = "live";
      if (mode === "live" && finalReturnUrl.startsWith("http://")) {
        console.warn("PayUnit requires HTTPS for callback URLs in live mode. Replacing http with https for request.");
        finalReturnUrl = finalReturnUrl.replace("http://", "https://");
        finalNotifyUrl = finalNotifyUrl.replace("http://", "https://");
      }

      const payunitRes = await fetch(`${apiUrl}/api/gateway/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-api-user": apiUser,
          "Authorization": authHeader,
          "mode": "live",
        },
        body: JSON.stringify({
          total_amount: amount,
          transaction_id: transactionId,
          return_url: finalReturnUrl,
          notify_url: finalNotifyUrl,
          phone_number: phoneNumber,
          currency: "XAF",
          paymentType: "button",
          name: courseTitle || "Gizami Course",
          description: `Enrollment for: ${courseTitle}`,
        }),
      });

      const responseText = await payunitRes.text();
      let payunitData: any;
      
      try {
        payunitData = JSON.parse(responseText);
      } catch (e) {
        console.error("PayUnit returned non-JSON response:", responseText);
        return NextResponse.json(
          { error: "Payment gateway returned an invalid response. Please contact support." },
          { status: 502 }
        );
      }

      if (!payunitRes.ok || payunitData.status === "error") {
        await supabaseAdmin.from("payments").delete().eq("transaction_id", transactionId);
        return NextResponse.json(
          { error: payunitData.message || "PayUnit initialization failed" },
          { status: 400 }
        );
      }

      const redirectUrl =
        payunitData.data?.transaction_url ||
        payunitData.transaction_url ||
        payunitData.payment_url ||
        payunitData.url ||
        payunitData.redirect_url;

      return NextResponse.json({
        success: true,
        transactionId,
        redirectUrl,
        payunitData,
      });
    }
  } catch (err: any) {
    console.error("Payment initiation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
