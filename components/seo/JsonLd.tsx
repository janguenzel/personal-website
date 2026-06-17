// Renders structured data. A native <script> is correct here —
// JSON-LD is data, not executable code. Escapes "<" to avoid XSS via injected text.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
