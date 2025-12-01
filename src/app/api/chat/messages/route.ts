import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  id: number;
  userName: string;
  text: string;
  createdAt: string;
};

let MESSAGES: ChatMessage[] = [];
let NEXT_ID = 1;

export async function GET() {
  // trả mới nhất trước hoặc sau tùy bạn
  const data = MESSAGES.slice(-200); // limit 200 msg
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.text || "").toString().trim();
    const userName = (body.userName || "Khách").toString().trim() || "Khách";

    if (!text) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const msg: ChatMessage = {
      id: NEXT_ID++,
      userName,
      text,
      createdAt: new Date().toISOString(),
    };

    MESSAGES.push(msg);
    // limit cho nhẹ
    if (MESSAGES.length > 1000) {
      MESSAGES = MESSAGES.slice(-500);
    }

    return NextResponse.json(msg, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
