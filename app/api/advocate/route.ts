import { NextRequest, NextResponse } from "next/server";
import { runDevilsAdvocate, BusinessProfile } from "@/lib/ai/devil";
import { supabase } from "@/lib/db/supabase";
import type { Business } from "@/lib/db/supabase";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADVOCATE_API_KEY;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { businessId?: string; business?: BusinessProfile };
  try {
    body = (await request.json()) as { businessId?: string; business?: BusinessProfile };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let profile: BusinessProfile;

  if (body.businessId) {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", body.businessId)
      .single();

    if (!data) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const biz = data as Business;
    profile = {
      name: biz.name,
      products: biz.products,
      hours: biz.hours,
      whatsapp_number: biz.whatsapp_number,
    };
  } else if (body.business) {
    profile = body.business;
  } else {
    return NextResponse.json(
      { error: "Provide either businessId or business object" },
      { status: 400 }
    );
  }

  const report = await runDevilsAdvocate(profile);
  return NextResponse.json(report);
}
