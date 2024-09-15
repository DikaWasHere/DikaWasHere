let saldo = 100; //variabel saldo di deklarasikan dengan nilai awal

alert("+===BANK===+\n|| saldo anda 100 ||\n+==========+");

let tanya = prompt(
  "apa yang kamu ingin lakuka?\n1.tambah saldo\n2.kurangi saldo \n3.keluar"
);

if (tanya === "1") {
  //function tambahSaldo
  function tambahSaldo() {
    let tambah = prompt("masukkan saldo yang di inginkan");
    tambah = +tambah;

    saldo += tambah;

    return saldo;
  }
  console.log("saldo anda sekarang adalah " + tambahSaldo(saldo));
  alert(saldo + " adalah saldo baru anda");
  //function kurangiSaldo
} else if (tanya == "2") {
  function kurangiSaldo() {
    let kurang = prompt("masukkan saldo yang di ingin dikurangi");
    kurang = +kurang;

    saldo -= kurang;

    return saldo;
  }
  console.log("saldo anda sekarang adalah " + kurangiSaldo(saldo));
  alert(saldo + " adalah saldo baru anda");
} else {
  console.log("saldo anda adalah " + saldo);
}
