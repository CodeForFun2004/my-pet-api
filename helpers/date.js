// helpers/date.js
function normalizeDateStr(s) {
  // ép về YYYY-MM-DD có zero padding
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!m) return s;
  const yyyy = m[1];
  const mm   = m[2].padStart(2, "0");
  const dd   = m[3].padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
exports.normalizeDateStr = normalizeDateStr;
