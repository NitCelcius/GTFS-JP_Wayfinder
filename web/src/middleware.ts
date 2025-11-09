import { NextRequest, NextResponse } from "next/server";

import { getEnvValue } from "./lib/envUtils";

export function middleware(req: NextRequest) {
  // BASIC認証が有効でない場合はスキップする
  if (getEnvValue("ENABLE_BASIC_AUTH", "false") !== "true") {
    return NextResponse.next();
  }

  // 環境変数の設定がない場合はスキップする
  const username = getEnvValue("BASIC_AUTH_USERNAME", "");
  const password = getEnvValue("BASIC_AUTH_PASSWORD", "");

  if (!username || !password) {
    return NextResponse.next();
  }

  // BASIC認証のチェック
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [inputUsername, inputPassword] = Buffer.from(authValue, "base64")
      .toString()
      .split(":");

    if (inputUsername === username && inputPassword === password) {
      // BASIC認証に成功した場合、アクセスを許可する
      return NextResponse.next();
    }
  }

  // BASIC認証に失敗した場合、エラーを表示する
  return NextResponse.json(
    { error: "Basic Auth Required" },
    {
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      status: 401,
    }
  );
}
