/**
 * Splits a metric string into its figure and caption so the figure can be set
 * large: "~35% quality improvement" → { figure: "~35%", caption: "quality improvement" }.
 * A plain module, so server pages and client components share it.
 */
export function splitMetric(metric: string): {
  figure?: string;
  caption: string;
} {
  const m = metric.match(
    /^([~≈$]?\d[\d.,]*\s?(?:%|★|\+|x|k|K|M)*\+?)\s*[—–-]?\s*(.*)$/
  );
  if (!m) return { caption: metric };
  return { figure: m[1].trim(), caption: m[2].trim() };
}
