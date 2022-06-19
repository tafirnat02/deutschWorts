//bu modul ile alinan kelimelere ait HTMldocumet'daki veriler baz alinarak Wort sinifdan nesne olusturulur.
/*-------- Disariya Cikarilan Ögeler ---------*/
export { runApp };

/*-------- Modul icerigindeki Ögeler ---------*/

class Wort {
  wrt = {
    wort: "",
    plural: "",
    genetiv: "",
    prefix: "",
    suffix: "",
    artikel: "",
  };
  fall = {
    Dativobjekt: "",
    Akkusativobjekt: "",
    Reflexivpronomen: "",
    Other: "",
    wechsel: [
      "'an'",
      "'in'",
      "'über'",
      "'auf'",
      "'neben'",
      "'hinter'",
      "'unter'",
      "'vor'",
    ],
  };
  status = {
    Situation: ["", "Durumu"],
    Zertifikat: ["", "Kelime Seviyesi"],
    Substantiv: ["", "Isim"],
    Adjektiv: ["", "Sifat"],
    Superlativ: ["", "Superlative: en..."],
    Komparativ: ["", "Komparativ: -e göre..."],
    Plural: ["", "Cogul eki"],
    Positiv: ["", "Pozitif"],
    Genus: ["", "Cinsiyet"],
    regelmäßige: ["", "Düzenli Cekim Durumu"],
    Artikel: ["", "Artikel"],
    starke: ["", "Güclü"],
    Pronomen: ["", "Zamir"],
    dekliniert: ["", "Cekimlenme Durumu"],
    Prädikativ: ["", "Tahmine Dayali Kullanim"],
    gesteigert: ["", "Sifat Derecelendirilmesi"],
    Indefinitpronomen: ["", "Belirsiz Zamir"],
    Other: ["", ""],
  };
  adj = {
    Positiv: "",
    Komparativ: "",
    Superlativ: "",
  };
  theme = "";
  source = "";
  main_Html = "";
  main_Sound = "";
  sub_Html = "";
  sub_Sound = "";
  lang_TR = "";
  lang_DE = "";
  lang_En = "";
  tbl = {};
  zB = [];
  img = [];
  othrTbls = {
    Starke: { txt: "starke Deklination" },
    Schwache: { txt: "schwache Deklination" },
    Gemischte: { txt: "gemischte Deklination" },
    Praedikativ: { txt: "als Prädikativ" },
    Pronomen: { txt: "Deklination des Pronomens" },
    Artikel: { txt: "Deklination von Artikel" },
    Nomen: {},
  };
  searchParams = {};
}

const rpRegExp = /»|⁰|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|\(|\)|\n/gi;

var doc, //alinan sayfa document'i
  newWortObj, //kelime icin yeni olsturulen nesne
  wort,
  ele,
  verb,
  head; //islem gören kelime

/*--- [1.Kisim: gelen documentden kelime kontrolü ve ilgili fonksiyona yönlendirme] ---*/

async function runApp(dcmnt) {
  return new Promise((resolve) => {
    getObject(dcmnt).then(() => {
      return resolve(newWortObj);
    });
  });
}

async function getObject(dcmnt) {
  try {
    await checkWort(dcmnt).catch((error) => {
      throw { err: error, fun: "checkWort"};
    });
    await newWortObject().catch((error) => {
      throw { err: error, fun: "newWortObject" };
    });
    await isVerb().catch((error) => {
      throw { err: error, fun: "isVerb" };
    });
    await setStatus().catch((error) => {
      throw { err: error, fun: "setStatus" };
    });
    await setSubEl().catch((error) => {
      throw { err: error, fun: "setSubEl" };
    });
    await setMainEl().catch((error) => {
      throw { err: error, fun: "setMainEl" };
    });

    if (verb) {
      await setFall().catch((error) => {
        throw { err: error, fun: "setFall" };
      });
      await setTbls().catch((error) => {
        throw { err: error, fun: "setTbls" };
      });
    } else {
      if (newWortObj.status.Adjektiv[0] !== "") {
        await getAdj().catch((error) => {
          throw { err: error, fun: "getAdj" };
        });
      }
      await getDeklinationTbls().catch((error) => {
        throw { err: error, fun: "getDeklinationTbls" };
      });
    }
    await getSatze().catch((error) => {
      throw { err: error, fun: "getSatze" };
    });
    await getLang()
      .catch((error) => {
        throw { err: error, fun: "getLang" };
      })
      .then(() => {
        return;
      });
  } catch (errObj) {
    //msg.add():yeni mesaji dizine ekler, msg.print():hatayi dogrudan ekrana bastirir...

      let type = errObj.fun === "checkWort" ? "add" : "print";
      window.msg[type](
        3,
        ` ${wort} `,
        `m:creatWortObj*.js f:${errObj.fun}`,
        errObj.err
      );
  }
}

function checkWort(dcmnt) {
  return new Promise((resolve, reject) => {
    let userDef, 
      search_Wort = dcmnt[0],
      _local_ = !!app_pano.check("localWorte");
    wort = dcmnt[1].querySelector("form>div>input").value;
    doc = dcmnt[1];
    if (_local_) {
      userDef = Object.values(localWortObj[search_Wort])[0];
      userDef = !!userDef ? ` 💭 ${userDef}` : null;
    }
    if (!checkEl(doc.querySelector("section.rBox"))) {
      app_pano.set("notFound"); //bu obje wortObjsArr eklenmemesi icin
      if (_local_) delete localWortObj[search_Wort]; //bulunamdi ise local objeden kaldirilir...
        throw `"${wort}" wurde nicht gefunden! https://www.verbformen.de/?w=${wort}${
          _local_ && !!userDef ? "\n" + userDef : ""
        }`;
      
    }
    if (!_local_) return resolve();
    let newParam = {},exit = false;
    newParam[search_Wort] = localWortObj[search_Wort];
    app_pano.set("newParam", newParam);
    if (!!userDef) app_pano.set("userDef", userDef);
    if (wort != search_Wort) {
      //localde kullanici kelimeleri ile islem yapiliyorsa, bu kelimelerin mastar durumu ve önceden alinip alinmadigi kontrol edilir.
      for (let i in wortObjsArr) {
        if (wort != wortObjsArr[i].wrt.wort) continue;
        wortObjsArr[i].searchParams[search_Wort] = localWortObj[search_Wort];
        if (!!userDef) wortObjsArr[i].lang_TR += userDef;
        app_pano.set("ahnelnWort"); //bu obje wortObjsArr eklenmemesi icin
        exit=true;
        app_pano.get("ahnelnWort");
        if(!! window.notInfinitiveWorte){
          let notInfinitiveWorte=[];window.notInfinitiveWorte=notInfinitiveWorte;
          //aranilan kelime ile wortObjsArr'a öge olarak aktarilan mastarhalini farkli olmasi drumunda kullaniciya bildirilir.
        }
        notInfinitiveWorte.push([search_Wort,wort]);
        break;
      }
    }
    delete localWortObj[search_Wort]; //islem yapilan kelime clone localWortObj'den kaldirilir...
    return exit? reject():resolve();
  });
}

function newWortObject() {
  return new Promise((resolve, reject) => {
    //Wort sinifindan nesen olusturulmasi...
    newWortObj = new Wort();
    newWortObj.wrt.wort = wort;
    if (app_pano.check("newParam")) {
      newWortObj.searchParams = app_pano.get("newParam");
      let userDef = app_pano.get("userDef");
      newWortObj.lang_TR += !!userDef ? userDef : "";
    }
    //kelime tipinin alinmasi
    newWortObj.status.Situation[0] = doc.querySelector(
      "article>div>nav>a[href]"
    ).nextElementSibling.textContent;
    resolve();
  });
}

function isVerb() {
  return new Promise((resolve) => {
    verb = newWortObj.status.Situation[0] == "Konjugation" ? true : false;
    (head = doc.querySelector("section.rBox.rBoxWht")),
      (ele = verb ? head.querySelector("p") : head.querySelector("header>p"));
    resolve();
  });
}

/*--- [2.Kisim: gelen documenti promise yapisiyla bilgileri newWortObj nesnesine aktarma] ---*/
/**** objenin status keyinde tutulan verileri head bardan alir */
function setStatus() {
  return new Promise((resolve) => {
    let arr = ele.innerText.split("·");
    ele.childNodes.forEach((t) => {
      switch (t.childNodes.length) {
        case 0:
          break;
        default:
          if (verb) {
            if (checkEl(t.querySelector("span").title)) {
              newWortObj.status.Zertifikat[0] = arr[0].replaceAll(rpRegExp, "");
              arr.shift();
            }
          } else {
            Object.keys(newWortObj.status).forEach((k) => {
              if (t.title.includes(k)) {
                newWortObj.status[k][0] =
                  newWortObj.status[k][0] == ""
                    ? t.innerText.replaceAll(rpRegExp, "")
                    : newWortObj.status[k][0].replaceAll(rpRegExp, "");
              }
            });
          }
          break;
      }
    });
    newWortObj.status.Other = verb
      ? arr.join(" ").replaceAll(rpRegExp, "")
      : "";
    resolve();
  });
}

/*****  Kelimenin artikeli ve cogul durumu ve ayrica
        altta yer alan cogul, konj vs kisimin Html'ini ve soundunu objeye ekler ****/
function setSubEl() {
  return new Promise((resolve) => {
    let subEle = head.querySelector("p.vStm.rCntr");
    newWortObj.sub_Sound = subEle.lastChild.href;
    let subHtml = subEle.cloneNode(true);
    subHtml.lastChild.remove();
    //isim/sifat cekimleri sitiliyle beraber almakta
    let nomen = newWortObj.status.Substantiv[0] == "Substantiv" ? true : false;
    if (nomen) {
      let s_p = doc.querySelectorAll('th[title="Nominativ"]');
      newWortObj.wrt.artikel = s_p[0].nextElementSibling.textContent;
      newWortObj.wrt.plural = s_p[1].nextElementSibling.nextElementSibling
        ? s_p[1].nextElementSibling.nextElementSibling.textContent.replaceAll(
            rpRegExp,
            ""
          )
        : "-";
      if (newWortObj.wrt.plural == "-") {
        newWortObj.sub_Html = ""; //ohne Plural
      } else {
        newWortObj.sub_Html =
          s_p[1].nextElementSibling.nextElementSibling.innerHTML.replaceAll(
            rpRegExp,
            ""
          );
      }
    } else {
      //adjektiv ve Konjugation  durumu
      newWortObj.sub_Html = subHtml.innerHTML
        .replaceAll(rpRegExp, "")
        .replaceAll(/·/gi, "<br>");
    }
    resolve();
  });
}

/*****kelimenin ana gövdesini ve sound linkini objeye atar */
function setMainEl() {
  return new Promise((resolve) => {
    let subEle = head.querySelector("p.vGrnd.rCntr");
    newWortObj.main_Sound = subEle.querySelector(
      'a[href][onclick^="Stimme"]'
    ).href;
    //newWortObj.main_Html = ele.querySelector('b').outerHTML.replaceAll(rpRegExp, "");

    let grundEl,
      grundArr = subEle.querySelectorAll("b");
    if (grundArr.length > 1) {
      grundEl = grundArr[0].outerHTML + "·" + grundArr[1].outerHTML;
    } else {
      grundEl = grundArr[0].outerHTML;
    }

    let txtEl = subEle.querySelector('img[alt="Deutsch"]').nextSibling;
    if (checkEl(txtEl) && txtEl.nodeName == "#text") {
      grundEl = txtEl.textContent + grundEl;
      grundEl = grundEl.replaceAll(rpRegExp, "");
    }

    newWortObj.main_Html = grundEl;
    resolve();
  });
}

/******Fillerin dativ akkusativ kullanimlarinin tespiti */
function setFall() {
  return new Promise((resolve) => {
    let subFall = "",
      subEle = doc.querySelectorAll("#vVdBx>div>div>p");
    subEle.forEach((row) => {
      row.childNodes.forEach((n) => {
        if (n.nodeName == "SPAN") {
          Object.keys(newWortObj.fall).forEach((f) => {
            let tit = n.title;
            if (tit.includes(f)) {
              newWortObj.fall[f] = n.innerText;
            } else {
              if (f == "wechsel") {
                Object.values(newWortObj.fall[f]).forEach((w) => {
                  if (tit.includes(w)) {
                    subFall = subFall + n.innerText + " ";
                  }
                });
              }
            }
          });
        }
      });
    });
    subFall = subFall.split(" -§- ").sort().join(" ").trim();
    newWortObj.fall.Other = subFall;
    delete newWortObj.fall.wechsel;
    resolve();
  });
}

/**** verb olmasi halinde fiil cekimlerine dair tablolar alinir. */
function setTbls() {
  return new Promise((resolve) => {
    let allContent = doc.querySelectorAll('div[class="vTbl"]');
    allContent.forEach((itm) => {
      let headTag = itm.querySelector("h2") != null ? "h2" : "h3";
      let tblHead = itm.querySelector(headTag).innerText;
      if (typeof newWortObj.tbl[tblHead] === "undefined") {
        newWortObj.tbl[tblHead] = itm.querySelector("table").innerHTML;
      }
    });

    resolve();
  });
}

/***** bu fonksiyon ile sadece sifatlarin derecelerini almak icin kullanilir */
function getAdj() {
  return new Promise((resolve) => {
    //sifat dereceleri alinir
    let adjTbl = doc.querySelectorAll(".vTxtTbl>table>tbody>tr>td");
    newWortObj.adj.Positiv = adjTbl[0].innerText;
    newWortObj.adj.Komparativ = adjTbl[1].innerText;
    newWortObj.adj.Superlativ = adjTbl[2].innerText;
    resolve();
  });
}

/****** isim ögelerinin cekimlerine dair tablolar alinir **********/
function getDeklinationTbls() {
  return new Promise((resolve) => {
    const othrTbls = () => {
      let allContent = doc.querySelectorAll("div>div>section>header");
      allContent.forEach((itm) => {
        let cnt = itm.innerText;
        if (cnt.includes(newWortObj.othrTbls.Starke.txt)) {
          addTrVal(itm, "Starke");
          delete newWortObj.othrTbls.Starke.txt;
        } else if (cnt.includes(newWortObj.othrTbls.Schwache.txt)) {
          addTrVal(itm, "Schwache");
          delete newWortObj.othrTbls.Schwache.txt;
        } else if (cnt.includes(newWortObj.othrTbls.Gemischte.txt)) {
          addTrVal(itm, "Gemischte");
          delete newWortObj.othrTbls.Gemischte.txt;
        } else if (cnt.includes(newWortObj.othrTbls.Praedikativ.txt)) {
          addTrVal(itm, "Praedikativ");
          delete newWortObj.othrTbls.Praedikativ.txt;
        } else if (cnt.includes(newWortObj.othrTbls.Pronomen.txt)) {
          addTrVal(itm, "Pronomen");
          delete newWortObj.othrTbls.Pronomen.txt;
        } else if (cnt.includes(newWortObj.othrTbls.Artikel.txt)) {
          addTrVal(itm, "Artikel");
          delete newWortObj.othrTbls.Artikel.txt;
        } else {
          addTrVal(itm, "Nomen");
        }
      });
      resolve();
    };

    const addTrVal = (e, obj) => {
      const divs = e.closest("section").querySelectorAll("div.vTbl");
      divs.forEach((t, n) => {
        newWortObj.othrTbls[obj][t.firstElementChild.innerText] = {};
        const clnE = t.cloneNode(true);
        const tbl = clnE.querySelectorAll("table>tbody>tr");
        tbl.forEach((i) => {
          let tit = i.firstElementChild.innerText.replaceAll(rpRegExp, "");
          newWortObj.othrTbls[obj][t.firstElementChild.innerText][tit] = {};
          i.firstElementChild.remove(); // th
          newWortObj.othrTbls[obj][t.firstElementChild.innerText][tit] =
            i.outerHTML.replaceAll(rpRegExp, "");
        });
      });
    };
    othrTbls.call();
  });
}

//varsa kelimeye dair örnekler alinir
function getSatze() {
  return new Promise((resolve) => {
    let allContent = doc.querySelectorAll("div>div>section>header>h2");
    allContent.forEach((itm) => {
      if (itm.innerText.includes("Beispiele")) {
        const divs = itm.closest("section").querySelectorAll("div>ul");
        if (!!divs) satzeRun(divs);
      }
    });

    let zBel = doc.querySelectorAll(".vBsp>ul");
    if (!!zBel) satzeRun(zBel);

    function satzeRun(el) {
      el.forEach((z) => {
        let zB = z.cloneNode(true);
        let lis = zB.querySelectorAll("li");
        lis.forEach((e) => {
          if (!!e.querySelector("a")) {
            e.querySelector("a").remove();
            newWortObj.zB.push(e.innerHTML.replaceAll(rpRegExp, ""));
          }
        });
      });
    }
    resolve();
  });
}

//varsa Tr,De ve En anlamlari alinir...
function getLang() {
  return new Promise((resolve) => {
    //varsa Almanca tanimi alinir
    let bDe,
      allHeader = doc.querySelectorAll("header>h2");

    allHeader.forEach((header) => {
      let subHead = header.textContent;
      if (subHead.includes("Bedeutungen")) {
        bDe = header.parentNode.nextElementSibling
          .querySelector("ul")
          .cloneNode(true);
        let lis = bDe.querySelectorAll("li");
        lis.forEach((e) => {
          newWortObj.lang_DE += e.innerHTML.replaceAll(/»|\n/gi, "") + "<br>";
        });
      }
    });

    //varsa ingilizce karsligi
    newWortObj.lang_En = checkEl(doc.querySelector('dd[lang="en"]'))
      ? doc.querySelector('dd[lang="en"]').innerText.replaceAll("\n", "")
      : "";

    // varsa Türkce karsiligi
    let srcL1 = doc.querySelector('span[lang="tr"]'), //birinci dom ögesi
      srcL2 = doc.querySelector("form > span.rNobr>a"); //ikinci dom ögesi
    if (checkEl(srcL1)) {
      newWortObj.lang_TR += " 🌐 " + srcL1.innerText.replaceAll(rpRegExp, "");
    } else if (checkEl(srcL2)) {
      newWortObj.lang_TR += " 🌐 " + srcL2.innerText.replaceAll(rpRegExp, "");
    }
    resolve();
  });
}
