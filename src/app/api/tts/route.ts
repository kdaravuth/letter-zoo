import { NextRequest, NextResponse } from "next/server";
import { stripZwsp } from "@/lib/khmer/numerals";

function splitTextChunks(text: string, maxLen = 170): string[] {
  const clean = stripZwsp(text).replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  let remaining = clean;

  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf(" ", maxLen);
    if (cut < 40) {
      cut = remaining.lastIndexOf("។", maxLen);
    }
    if (cut < 40) {
      cut = maxLen;
    }
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }
  return chunks;
}

export async function GET(request: NextRequest) {
  const rawText = request.nextUrl.searchParams.get("text") ?? "";
  const clean = stripZwsp(rawText).trim().slice(0, 420);

  if (!clean) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  const chunks = splitTextChunks(clean);
  const buffers: Uint8Array[] = [];

  try {
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=km&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const upstream = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (!upstream.ok) {
        return NextResponse.json(
          { error: "Upstream TTS unavailable" },
          { status: 502 }
        );
      }
      const arr = new Uint8Array(await upstream.arrayBuffer());
      if (arr.byteLength > 0) {
        buffers.push(arr);
      }
    }

    const totalLen = buffers.reduce((sum, b) => sum + b.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const buf of buffers) {
      merged.set(buf, offset);
      offset += buf.byteLength;
    }

    return new NextResponse(merged, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS fetch failed" }, { status: 502 });
  }
}
