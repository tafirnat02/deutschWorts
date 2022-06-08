//Bu modül ile kelimelere ait HTML/documet alinir ve HTMLdocuments arrayinde tutulur...
/*-------- Disariya Cikarilan Ögeler ---------*/
export { getDoc };

/*-------- Modul icerigindeki Ögeler ---------*/

const getDoc = async () => {
  //localStorage konrol edilir eger deger varsa onunla baslanir....
  var max = worteList.length,
    strt = 0;
  //if (storage.get("wortList")) strt = storage.get("wortList").value; //eger storagede tutulan bir deger varsa buradan devam edilir...

  const HTMLdocuments = [],
    subWorteList = [...worteList.slice(strt)];

  const nextDoc = () => {
    if (subWorteList.length > 0) docHTML(subWorteList.shift());
  };

  const docHTML = (wort) => {
    let url = `https://www.verbformen.de/?w=${wort}`;
    fetch(url, { mode: "no-cors" })
      .then((response) => {
        if (response.status === 200) return response.text();
        throw response.status === 429 ? 429 : response; //hata kontrolü
      })
      .then((html) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        HTMLdocuments.push(doc);
      })
      .then(() => {
        strt++;
        if (max == strt) {
          //storage.remove("wortList"); //islem tamamlanmasi sonrasi index local storageden kaldirilir.
          finishDoc(HTMLdocuments); //tamamlanan kelime sayfalarindan "Wort" sinifindan nesne olusturulur.
        } else {
          runBar.set(4, strt - 1, max); //%10 durumu...
          nextDoc();
        }
      })
      .catch((err) => {
        let title = err === 429 ? `429 | ${wort}` : " ⚠️ Error";
        let msgTxt =
          err === 429
            ? `Alinamayan kelime: ${worteList[strt]}, indeks no: ${strt}`
            : "Islem esnasinda hata olustu!";
        let method = err === 429 ? "add" : "print"; //msg:dizine ekler, printMsg:ekrana basilir...
        //mesaj basilir veya dizine eklenir...
        window.msg[method](
          3,
          title,
          `${msgTxt}(m:documents*.js f:docHTML)`,
          err
        );

        //localStorage islemleri
        storage.set("wortList", strt, 1); //yeni local obje icin index atanir,5 saatten kisa olanlar dikkate alinir
        finishDoc(HTMLdocuments); //hataya kadar alinan ögeler isleme alinir....
      });
  };
  nextDoc.call(); //alt fonksiyon cagrilir
};

const finishDoc = (docsVal) => {
  if (typeof getDoc === "undefined") window.getDoc = getDoc;
  if (typeof HTMLdocs === "undefined") {
    const HTMLdocs = docsVal;
    window.HTMLdocs = HTMLdocs; //alinan ögeler global scope'a HTMLdocs nesnesi olarak aktarilir...
  } else {
    HTMLdocs = docsVal;
  }
  callNext()
 // byController.docs = true;
};
