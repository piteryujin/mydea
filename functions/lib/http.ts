export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

export async function readJson(request: Request) {
  const type = request.headers.get("Content-Type") ?? "";
  if (!type.includes("application/json")) {
    throw new Error("JSON 요청만 지원합니다.");
  }
  return request.json();
}
