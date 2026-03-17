import { NextRequest, NextResponse } from "next/server";
import { supabase, getRecentOrders } from "@/lib/db/supabase";
import { sendMessage } from "@/lib/whatsapp/client";
import type { Business } from "@/lib/db/supabase";

function authGuard(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authGuard(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("*");

    for (const biz of (businesses as Business[]) ?? []) {
      const orders = await getRecentOrders(biz.id, 8);
      if (orders.length === 0) continue;

      const total = orders.reduce((sum, o) => sum + o.total, 0);
      const paid = orders.filter((o) => o.payment_status === "paid").length;

      const summary =
        `🌅 Good morning! Here's your overnight summary for *${biz.name}*:\n\n` +
        `📦 New orders: ${orders.length}\n` +
        `💰 Revenue: R${total.toFixed(2)}\n` +
        `✅ Paid: ${paid} | ⏳ Unpaid: ${orders.length - paid}\n\n` +
        `Reply *ORDERS* to see details.`;

      await sendMessage(biz.whatsapp_number, summary);
    }

    return NextResponse.json({ sent: businesses?.length ?? 0 });
  } catch (err) {
    console.error("Morning summary error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
