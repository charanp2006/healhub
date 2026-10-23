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
    <title>HealHub API demo credentials</title>
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
      @media (prefers-color-scheme: dark) {
        body { background: #001e2b; color: #e6edf3; }
        main { background: #062733; border-color: #134e4a; }
        p, th { color: #9ca3af; }
        th, td { border-color: #134e4a; }
        code { background: #0a3a3a; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>HealHub API demo credentials</h1>
      <p>Backend admin credentials. Keep this page out of navigation.</p>
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
  const html = page([
    ["Admin", "Email", process.env.ADMIN_EMAIL],
    ["Admin", "Password", process.env.ADMIN_PW],
  ]);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
