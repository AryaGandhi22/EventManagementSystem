export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return "—";
  return `${formatDate(value)} ${formatTime(value)}`;
}

export function initials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

export function errorMessage(error) {
  const data = error?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const val = Array.isArray(value) ? value.join(", ") : String(value);
        if (["venue_id", "non_field_errors", "detail", "error"].includes(key)) {
          return val;
        }
        return `${key.replace(/_/g, " ")}: ${val}`;
      })
      .join(" | ");
  }
  return error?.message || "Something went wrong.";
}

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
