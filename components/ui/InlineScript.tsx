"use client";

type Props = {
  /** Unique id for the rendered <script> tag. */
  id?: string;
  /** Raw JS to run synchronously during HTML parsing (before first paint). */
  html: string;
};

/**
 * Renders an inline `<script>` that executes during HTML parsing on hard
 * navigations (initial load / refresh) — e.g. to apply a persisted theme
 * before the first paint, avoiding a flash.
 *
 * React 19 warns when a component render produces a `<script>` tag, because
 * scripts inserted via client DOM updates never execute. On soft navigations
 * (like switching language via `<Link>`) this layout re-renders on the client,
 * which is exactly when that warning fires. The fix (per the Next.js
 * "preventing flash before hydration" guide) is to emit `type="text/javascript"`
 * on the server so the browser runs it, and `type="text/plain"` on the client
 * so it's inert and silent. `suppressHydrationWarning` accepts the type mismatch.
 *
 * This MUST be a Client Component (`"use client"`). The `typeof window` check is
 * evaluated wherever the component renders: as a Server Component it would render
 * on the server during *both* hard loads and soft-navigation RSC re-renders,
 * always emitting `text/javascript`, so the client would reconcile a real
 * `<script>` into the DOM and fire the warning anyway. As a Client Component it
 * SSRs as `text/javascript` (runs on hard load) but renders `text/plain` on the
 * client, so soft navigations (e.g. the language switcher's `<Link>`) stay silent.
 */
export function InlineScript({ id, html }: Props) {
  return (
    <script
      id={id}
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
