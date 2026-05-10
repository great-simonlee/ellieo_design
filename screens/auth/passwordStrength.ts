/** Same rules as email sign-up (10+ chars + upper + lower + digit + special). */
export function evaluatePassword(pw: string) {
  const lenOk = pw.length >= 10;
  const upperOk = /[A-Z]/.test(pw);
  const lowerOk = /[a-z]/.test(pw);
  const numOk = /\d/.test(pw);
  const specialOk = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw);
  const score =
    [lenOk, upperOk, lowerOk, numOk, specialOk].filter(Boolean).length;
  let label = 'Weak';
  let hue: [string, string] = ['#FB923C', '#EA580C'];
  if (score >= 5) {
    label = 'Very Strong';
    hue = ['#34D399', '#059669'];
  } else if (score >= 4) {
    label = 'Strong';
    hue = ['#86EFAC', '#16A34A'];
  } else if (score >= 3) {
    label = 'Fair';
    hue = ['#FDE047', '#CA8A04'];
  }
  return {
    lenOk,
    upperOk,
    lowerOk,
    numOk,
    specialOk,
    score,
    label,
    hue,
    pct: score / 5,
  };
}
