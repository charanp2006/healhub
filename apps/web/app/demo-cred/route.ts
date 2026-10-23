export const dynamic = "force-dynamic";

const page = (rows: Array<[string, string, string | undefined]>) => {
  const body = rows
    .map(
      ([role, label, value]) => `
        <tr>
          <td>${role}</td>
          <td>${label}</td>
          <td><code>${escapeHtml(value || "not configured")}</code></td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>HealHub demo credentials</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; padding: 40px 20px; font-family: ui-sans-serif, system-ui, sans-serif; background: #f6f8fa; color: #111827; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px; }
      h1 { margin: 0 0 4px; font-size: 22px; }
      p { margin: 0 0 20px; color: #6b7280; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
      th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
      code { font-family: ui-monospace, SFMono-Regular, monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
      a { color: #179e8d; }
      @media (prefers-color-scheme: dark) {
        body { background: #001e2b; color: #e6edf3; }
        main { background: #062733; border-color: #134e4a; }
        p, th { color: #9ca3af; }
        th, td { border-color: #134e4a; }
        code { background: #0a3a3a; }
        a { color: #20c3ae; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>HealHub demo credentials</h1>
      <p>Patient web app. Keep this page out of navigation.</p>
      <table>
        <thead>
          <tr><th>Role</th><th>Field</th><th>Value</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </main>
  </body>
</html>`;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const adminLink = process.env.NEXT_PUBLIC_ADMIN_PAGE_LINK || "";

  const html = page([
    ["Patient", "Email", process.env.NEXT_PUBLIC_USER_EMAIL],
    ["Patient", "Password", process.env.NEXT_PUBLIC_USER_PASSWORD],
    ["Admin", "Email", process.env.NEXT_PUBLIC_ADMIN_EMAIL],
    ["Admin", "Password", process.env.NEXT_PUBLIC_ADMIN_PASSWORD],
    ["Admin", "Console", adminLink],
  ]);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
