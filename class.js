class barang {
  constructor(nama, guna, jumlah) {
    this.nama = nama;
    this.guna = guna;
    this.jumlah = jumlah;
  }
}
const barang1 = new barang("pensil", "nulis", 3);
const barang2 = new barang("penghapus", "menghaps", 5);

console.log(barang1);
console.log("nama barang:" + barang1.nama);
console.log("jumlah " + barang2.nama + " = " + barang2.jumlah);
