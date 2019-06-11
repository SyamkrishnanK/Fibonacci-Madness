const fs = require("fs");
const { fibonacciSeries } = require("./fibonacci");

const readInputFile = (filename = "input2.txt") => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

const shiftPQR_Internal = (p, q, r) => {
  const min = Math.min(p, q, r);

  if (min < 0) {
    const absMin = Math.abs(min);
    return { p: p + absMin, q: q + absMin, r: r + absMin };
  } else {
    return { p, q, r };
  }
};

const shiftPQR = (a, b, c) => {
  const { p, q, r } = shiftPQR_Internal(a, b, c);
  if (p == 1 || q == 1 || p == 0 || q == 0 || r == 0 || r == 1) {
    return { p: p + 2, q: q + 2, r: r + 2 };
  }
  return { p, q, r };
};
function* getInput(fileData) {
  const lines = fileData.split(/\r?\n/);
  const n = parseInt(lines[0]);

  for (let i = 0; i < n; i = i + 1) {
    const j = i * 3;
    const [pRaw, pf] = lines[j + 1].split(" ").map(t => parseInt(t));
    const [qRaw, qf] = lines[j + 2].split(" ").map(t => parseInt(t));
    const [rRaw] = lines[j + 3].split(" ").map(t => parseInt(t));
    const { p, q, r } = shiftPQR(pRaw, qRaw, rRaw);

    yield {
      p,
      pf,
      q,
      qf,
      r
    };
  }
}

const bigIntAbs = a => {
  if (a < 0n) {
    return -1n * a;
  }
  return a;
};
// const gcd_Internal = (aParam, bParam) => {
//   let a = bigIntAbs(aParam);
//   let b = bigIntAbs(bParam);

//   while (true) {
//     if (a == 0) {
//       return b;
//     }
//     if (b == 0) {
//       return a;
//     }
//     if (a == b) {
//       return a;
//     }
//     if (a > b) {
//       a = a - b;
//       // return gcd(a - b, b);
//     } else {
//       b = b - a;
//     }
//     //   return gcd(a, b - a);
//   }
// };

const gcd_Internal = (a, b) => {
  if (a == 0) return b;
  return gcd_Internal(b % a, a);
};
const gcd = (aParam, bParam) => {
  let a = bigIntAbs(aParam);
  let b = bigIntAbs(bParam);
  // if(b>a){
  //     return gcd_Internal(b,a)
  // }
  return gcd_Internal(a, b);
};

const lcm = (a, b) => {
  return (a * b) / gcd(a, b);
};

const multiplyEquation = (eq, multiplier) => {
  return {
    res: eq.res * multiplier,
    f1: eq.f1 * multiplier,
    f0: eq.f0 * multiplier
  };
};

const subtractEquation = (eq1, eq2) => {
  return {
    res: eq1.res - eq2.res,
    f1: eq1.f1 - eq2.f1,
    f0: eq1.f0 - eq2.f0
  };
};

const makeFraction = a => {
  if (!(a instanceof Object)) {
    return {
      num: BigInt(a),
      den: 1n
    };
  }
  return a;
};

const lowestFraction = frParam => {
  let fr = { ...frParam };

  let { num, den } = fr;

  num = makeFraction(num);
  den = makeFraction(den);

  fr = {
    num: num.num * den.den,
    den: num.den * den.num
  };

  const gcdFraction = gcd(fr.num, fr.den);

  return { num: fr.num / gcdFraction, den: fr.den / gcdFraction };
};

const subtractFraction = (a, b) => {
  a = makeFraction(a);
  b = makeFraction(b);

  return lowestFraction({
    num: a.num * b.den - b.num * a.den,
    den: a.den * b.den
  });
};

const addFraction = (a, b) => {
  a = makeFraction(a);
  b = makeFraction(b);

  return lowestFraction({
    num: a.num * b.den + b.num * a.den,
    den: a.den * b.den
  });
};

const multiplyFraction = (a, b) => {
  a = makeFraction(a);
  b = makeFraction(b);
  return lowestFraction({
    num: a.num * b.num,
    den: a.den * b.den
  });
};

const solveEquationForF1 = (eq, f0) => {
  const f0Val = lowestFraction({ num: eq.f0 * f0.num, den: f0.den });

  return lowestFraction({
    num: subtractFraction(eq.res, f0Val),
    den: eq.f1
  });
};

const findFr = (f0, f1, r) => {
  const f1Val = multiplyFraction(fibonacciSeries[r], f1);
  const f0Val = multiplyFraction(fibonacciSeries[r - 1], f0);
  return addFraction(f1Val, f0Val);
};
const findF0AndF1 = ques => {
  const { p, pf, q, qf } = ques;
  const eq1 = {
    res: BigInt(pf),
    f1: fibonacciSeries[p],
    f0: fibonacciSeries[p - 1]
  };
  const eq2 = {
    res: BigInt(qf),
    f1: fibonacciSeries[q],
    f0: fibonacciSeries[q - 1]
  };
  const lcmOff1 = lcm(eq1.f1, eq2.f1);

  const eq3 = multiplyEquation(eq1, lcmOff1 / eq1.f1);
  const eq4 = multiplyEquation(eq2, lcmOff1 / eq2.f1);

  const eq5 = subtractEquation(eq3, eq4);

  const gcdEq5 = gcd(eq5.res, eq5.f0);

  const f0 = {
    num: eq5.res / gcdEq5,
    den: eq5.f0 / gcdEq5
  };

  const f1 = solveEquationForF1(eq1, f0);

  return {
    f0,
    f1
  };
};
const printfr = fr => {
  if (fr.den < 0n) {
    fr = {
      num: fr.num * -1n,
      den: fr.den * -1n
    };
  }
  if (fr.den == 1n) {
    return `${fr.num}`;
  }
  return `${fr.num}/${fr.den}`;
};
const computeAnswer = async () => {
  const fileData = await readInputFile();
  const ans = [];
  for (ques of getInput(fileData)) {
    console.log(ques);
    const { f0, f1 } = findF0AndF1(ques);
    const fr = findFr(f0, f1, ques.r);
    console.log("fr is", fr);
    ans.push(fr);
  }
  fs.writeFile(
    "output.txt",
    ans.map(printfr).reduce((a, c) => `${a}\n${c}`),
    err => {
      if (err) {
        console.log(err);
      } else {
        console.log("output saved");
      }
    }
  );
  //   console.log(fileData);
};

module.exports = {
  computeAnswer
};
