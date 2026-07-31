import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/token";

const CSV_FORMULA_CHARS = ["=", "+", "-", "@"];
const VALID_KATEGORI = ["reguler", "vip", "vvip"];

function sanitize(value) {
  if (typeof value !== "string") return "";
  let v = value.trim();
  for (const char of CSV_FORMULA_CHARS) {
    if (v.startsWith(char)) {
      v = "'" + v;
      break;
    }
  }
  return v.replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { guests: guestData } = await request.json();

    if (!Array.isArray(guestData) || guestData.length === 0) {
      return NextResponse.json({ error: "Data tamu tidak valid" }, { status: 400 });
    }

    const guests = guestData.map((g) => {
      const kategori = String(g.kategori_tamu || "reguler").toLowerCase();
      const acaraId = Number(g.acara_id);
      return {
        nama: sanitize(g.nama) || "Tamu",
        instansi: sanitize(g.instansi) || "—",
        no_hp: g.no_hp ? sanitize(g.no_hp).slice(0, 20) : null,
        tujuan: g.tujuan ? sanitize(g.tujuan) : null,
        kategori_tamu: VALID_KATEGORI.includes(kategori) ? kategori : "reguler",
        status_kehadiran: "tidak_hadir",
        acara_id: Number.isFinite(acaraId) ? acaraId : null,
        qr_token: generateToken(),
      };
    });

    if (guests.some((g) => !Number.isInteger(g.acara_id))) {
      return NextResponse.json({ error: "Data acara (acara_id) tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase.from("guests").insert(guests).select();

    if (error) return NextResponse.json({ error: "Gagal mengimpor tamu" }, { status: 500 });
    return NextResponse.json({ count: data.length }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
}
