const fs = require("fs");

const compFibonacci = (n = 2000) => {
  const arr = [0n, 1n];
  for (let i = 2; i <= n + 5; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }
  fs.writeFile(
    "fibonacci.js",
    `const fibonacciSeries=[${arr.reduce((a, c) => `${a},${c}n`)}];
    module.exports={
        fibonacciSeries 
    }`,
    err => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  );
};

module.exports = {
  compFibonacci
};
