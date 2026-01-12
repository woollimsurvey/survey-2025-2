/**
 * form 테이블 숫자 필드 기반 통계 유틸
 * - 평균(mean) 계산
 * - 평균에서 가장 가까운 50% 값(closest half)의 min/max 범위 계산
 */

export function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function computeMean(values) {
  const nums = (values || [])
    .map(normalizeNumber)
    .filter((v) => v !== null);

  if (nums.length === 0) return null;

  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

export function computeClosestFractionRange(values, fraction = 0.5) {
  const nums = (values || [])
    .map(normalizeNumber)
    .filter((v) => v !== null);

  if (nums.length === 0) return null;

  const mean = nums.reduce((sum, v) => sum + v, 0) / nums.length;
  const k = Math.max(1, Math.ceil(nums.length * fraction));

  const closest = nums
    .map((v) => ({ v, d: Math.abs(v - mean) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((x) => x.v);

  return {
    mean,
    min: Math.min(...closest),
    max: Math.max(...closest),
    n: nums.length,
    k,
  };
}

export function buildMeansByCode(rows, fields, { digits = 1 } = {}) {
  const valuesByCode = {};

  for (const row of rows || []) {
    const code = row?.code;
    if (!code) continue;

    valuesByCode[code] ??= {};
    for (const field of fields) {
      valuesByCode[code][field] ??= [];
      valuesByCode[code][field].push(row?.[field]);
    }
  }

  const result = {};
  for (const [code, fieldMap] of Object.entries(valuesByCode)) {
    result[code] = {};
    for (const field of fields) {
      const mean = computeMean(fieldMap[field]);
      result[code][field] =
        mean === null ? null : Number(mean.toFixed(digits));
    }
  }

  return result;
}

export function buildClosestHalfRangesByCode(rows, fields, fraction = 0.5) {
  const valuesByCode = {};

  for (const row of rows || []) {
    const code = row?.code;
    if (!code) continue;

    valuesByCode[code] ??= {};
    for (const field of fields) {
      valuesByCode[code][field] ??= [];
      valuesByCode[code][field].push(row?.[field]);
    }
  }

  const result = {};
  for (const [code, fieldMap] of Object.entries(valuesByCode)) {
    result[code] = {};
    for (const field of fields) {
      result[code][field] = computeClosestFractionRange(fieldMap[field], fraction);
    }
  }

  return result;
}

export function computeMode(values, { tieBreak } = {}) {
  const counts = new Map();

  for (const raw of values || []) {
    if (raw === null || raw === undefined || raw === "") continue;
    const key = String(raw);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  if (counts.size === 0) return undefined;

  const defaultTieBreak = (a, b) => {
    const na = Number(a);
    const nb = Number(b);
    const aNum = Number.isFinite(na);
    const bNum = Number.isFinite(nb);
    if (aNum && bNum) return na - nb; // 숫자면 작은 값 우선
    return a.localeCompare(b, "en"); // 그 외는 사전순
  };

  const cmp = tieBreak || defaultTieBreak;

  let bestValue;
  let bestCount = -1;

  for (const [value, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
      continue;
    }
    if (count === bestCount && bestValue != null && cmp(value, bestValue) < 0) {
      bestValue = value;
    }
  }

  return bestValue;
}

export function buildModesByCode(rows, fields, { tieBreakByField } = {}) {
  const valuesByCode = {};

  for (const row of rows || []) {
    const code = row?.code;
    if (!code) continue;

    valuesByCode[code] ??= {};
    for (const field of fields) {
      valuesByCode[code][field] ??= [];
      valuesByCode[code][field].push(row?.[field]);
    }
  }

  const result = {};
  for (const [code, fieldMap] of Object.entries(valuesByCode)) {
    result[code] = {};
    for (const field of fields) {
      const tieBreak = tieBreakByField?.[field];
      result[code][field] = computeMode(fieldMap[field], { tieBreak });
    }
  }

  return result;
}


