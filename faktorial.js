//coba rekursif faktorial

function rekur(x) {
  console.log();
  if (x <= 1) {
    return x;
  } else {
    return x * rekur(x - 1);
  }
}
console.log(rekur(5));

//faktorial non rekursif
function nonrekur(j) {
  let nilai = 1;
  for (n = 1; n <= j; n++) {
    nilai = nilai * n;
  }
  return nilai;
}
console.log(nonrekur(5));
