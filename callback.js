function coba(callback) {
  setTimeout(() => {
    const nama = "Andika";
    callback(nama);
  }, 200);
}

coba((hasil) => {
  console.log(hasil);
});

//
function hitung(sisi) {
  setTimeout(() => {
    let luas = 5 * 5;
    sisi(luas);
  }, 300);
}

hitung((sis) => console.log(sis));
