import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// DrimzWallet Integration (Generic)

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

    if (!courseId || !userId || !phoneNumber || !gateway) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let finalAmount = amount;
    let finalTitle = courseTitle;

    // If it's a subscription, fetch the price from settings to be safe
    if (courseId === "subscription") {
      const { data: settings } = await supabaseAdmin
        .from("settings")
        .select("subscription_price")
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .single();
      
      finalAmount = settings?.subscription_price || 1000;
      finalTitle = "Gizami Monthly Subscription";
    }

    if (!finalAmount) {
      return NextResponse.json({ error: "Missing payment amount" }, { status: 400 });
    }

    // NOTE: removed hardcoded "finalAmount = 100" test override — charges now use the real price.

    // Generate a unique transaction ID
    const transactionId = `GIZ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // DrimzWallet cannot reach localhost/http — force https so the webhook is reachable.
    if (siteUrl.startsWith("http://") && !siteUrl.includes("localhost")) {
      siteUrl = siteUrl.replace("http://", "https://");
    }
    const returnUrl = `${siteUrl}/payment/callback?courseId=${courseId}&txId=${transactionId}`;
    const notifyUrl = `${siteUrl}/api/payment/webhook`;

    // Check which payment provider is active from settings, default to tranzak if not set
    let activeProvider = "drimzwallet";
    
    // Store pending payment in DB
    await supabaseAdmin.from("payments").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      course_id: courseId,
      transaction_id: transactionId,
      amount: finalAmount,
      currency: "XAF",
      gateway,
      status: "pending",
    });

    // Fetch user details to pre-fill the checkout session
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    const userName = profile?.full_name || "Gizami Student";
    const userEmail = profile?.email || "student@gizami.com";
    const names = userName.split(" ");
    const firstName = names[0] || "Gizami";
    const lastName = names.slice(1).join(" ") || "Student";

    if (activeProvider === "drimzwallet") {
      const apiKey = process.env.GIZAMI_BANKING_API_KEY;
      const apiUrl = process.env.GIZAMI_BANKING_API_URL || "https://api.deepdrimz.dev";

      if (!apiKey) {
        return NextResponse.json({ error: "Gizami Banking API credentials missing" }, { status: 503 });
      }

      try {
        const checkoutPayload = {
          merchant_app_key: apiKey,
          fee_payer: "CLIENT",
          customer: {
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
            phone_number: phoneNumber
          },
          invoice: {
            currency: "XAF",
            total_amount: finalAmount,
            due_amount: finalAmount,
            items: [
              {
                title: finalTitle,
                description: `Payment for: ${finalTitle}`,
                quantity: 1,
                unit_price: finalAmount
              }
            ]
          },
          callbacks: {
            redirect_success_url: returnUrl,
            redirect_failure_url: returnUrl,
            webhook_url: `${notifyUrl}?txId=${transactionId}`
          }
        };

        const response = await fetch(`${apiUrl}/banking/transactions/checkouts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify(checkoutPayload),
        });

        if (!response.ok) {
           const errorText = await response.text();
           console.error("Gizami Banking API Error:", errorText);
           throw new Error(errorText || "Payment gateway rejected the request");
        }

        const data = await response.json();
        const sessionId = data?.data?.session_id;

        if (sessionId) {
           // Map frontend gateway ID to Gizami provider IDs
           const providerMap: Record<string, string> = {
             "CM_ORANGE": "ORANGE_MONEY_CM",
             "CM_MTN": "MTN_MOMO_CM",
           };
           const provider = providerMap[gateway] || "MTN_MOMO_CM";
           
           // Clean phone number (Gizami API expects raw phone or +237)
           const cleanPhone = phoneNumber.replace("+", "");

           // Initiate Mobile Money push directly
           const pushResponse = await fetch(`${apiUrl}/banking/transactions/checkouts/${sessionId}/payment`, {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
               "X-API-Key": apiKey,
             },
             body: JSON.stringify({
               method_type: "MOBILE_MONEY",
               provider,
               mobile_money_account: {
                 phone_number: cleanPhone
               }
             })
           });

           if (!pushResponse.ok) {
             console.error("Mobile Money Push Error:", await pushResponse.text());
             // We won't throw here; if push fails, we can optionally fallback to the redirect url
             return NextResponse.json({
               success: true,
               transactionId,
               redirectUrl: data?.data?.session_url || returnUrl,
             });
           }
        }
        
        // Return success WITHOUT redirectUrl, so the frontend triggers the polling screen
        return NextResponse.json({
          success: true,
          transactionId,
        });

      } catch (error: any) {
        console.error("Gizami Banking API Init Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initiate payment with Gizami Banking API." }, { status: 502 });
      }

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
