// 테이블 헬퍼 함수들

export const calAvg = (value) => {
  return value.reduce((acc, cur) => acc + cur, 0) / value.length;
};

export const calMed = (value) => {
  const sortedValue = [...value].sort((a, b) => a - b);
  const length = value.length;

  if (length % 2 === 0) {
    return (sortedValue[length / 2 - 1] + sortedValue[length / 2]) / 2;
  }

  return sortedValue[Math.floor(length / 2)];
};

export const calQ1 = (value) => {
  const sortedValue = [...value].sort((a, b) => a - b);
  const length = value.length;
  const pos = (length + 1) * 0.25;
  const base = Math.floor(pos) - 1;
  const rest = pos - Math.floor(pos);

  if (base < 0) return sortedValue[0];
  if (base >= length - 1) return sortedValue[length - 1];

  return (
    sortedValue[base] + rest * (sortedValue[base + 1] - sortedValue[base])
  );
};

export const calQ3 = (value) => {
  const sortedValue = [...value].sort((a, b) => a - b);
  const length = value.length;
  const pos = (length + 1) * 0.75;
  const base = Math.floor(pos) - 1;
  const rest = pos - Math.floor(pos);

  if (base < 0) return sortedValue[0];
  if (base >= length - 1) return sortedValue[length - 1];

  return (
    sortedValue[base] + rest * (sortedValue[base + 1] - sortedValue[base])
  );
};

export const calQ1Q3 = (q1Array, q3Array) => {
  const q1 = calQ1(q1Array);
  const q3 = calQ3(q3Array);
  return `${q1} ~ ${q3}`;
};

