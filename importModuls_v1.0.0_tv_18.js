import { runApp } from "./module/creatWortObj_ts25.js";
import { getDoc } from "./module/documents_ts13.js";
import { getWortObject } from "./module/getWortObj_ts05.js";
import { getImg } from "./module/image_ts08.js";
import { getLang } from "./module/lang_ts21.js";
import { baseFun } from "./module/main_ts15.js";

async function loadBase() {
  return new Promise((resolve, reject) => {
    window.appStarter = appStarter;
    baseFun();
    let duration = 10;
    setTimeout(() => {
      if (typeof abfrage === "object") resolve();
      reject(
        `Modüller ${duration} ms icerisinde sayfaya import edilemedi!\nSüreyi artirarak dene! Hata devam etmesi halinde modul pathini check et.(m:importModul, f:loadBase)`
      );
    }, duration);
  });
}

const reorganizer = (clear = false) => {
  if (!window.reorganizer) window.reorganizer = reorganizer;
  if (clear) console.clear();
  let exList = false,
    shortList = "";
  //let lastIndex = storage.get("lastIndex");
  let lastWortList = storage.get("lastWortList", true);
  let localWortObj = storage.get("neuWorte");
  if (!isNaN(parseInt(lastWortList.lastIndex))) {
    //ilk olarak 429 hatasi sebebiyle önceki sorguda alinamayan kelime kontrol edilir...
    if (!app_pano.get("lastIndex")) {
      let subList = lastWortList.value.slice(lastWortList.lastIndex);
      shortList = kurzeListe(subList);
      exList = confirm(
        `🛸Son sorguda islem yapilamamis kelimeler tespit edildi!\n📋Eski kelimelerden devam edilsin mi?\n\n🔖Kelime listesi: ${shortList}`
      );
      exList = exList ? (subList = subList.join(", ")) : false;
      storage.remove("lastWortList", "lastIndex"); //objedeki index keyi lokalden kaldirlir...
      if (!!exList) return (abfrage.neu = exList);
    }
  } else if (Object.keys(localWortObj).length > 0) {
    //eger önceki sorgu sorunsuz tamamlanmis ise bu kezde lokalde kullanici kelimesi kontrol edilir...
    let localWortArr = [],
      allLocalList;
    for (let k_ in localWortObj) localWortArr.push(k_);
    //localWortArr.sort();
    allLocalList = localWortArr.join(",");
    shortList = kurzeListe(localWortArr);
    let localWort = confirm(
      `🪃 Sayfada yakalanan kelimeler bulunmakta.\n🧭 Bu kelime listesi icin islem yapilsin mi?\n\n📌 Kelimeler: ${shortList}`
    );
    if (!!localWort) {
      app_pano.set("localWorte");
      window.localWortObj = localWortObj;
      try {
        return (abfrage.neu = allLocalList); //bu kelimeler "worteList" olarak globale aktarilir sonraki functionlarla...
      } catch (error) {
        if (error.message.search("falsish") < 0)
          msg.add(3, "Hata olustu! (m:importModuls, f:reorganizer)", error);
      }
    }
  } //Herhangi bir husus yok ise bu halde kullaniciya yeni sorgu hatirlatmasi yapilir...
  let zBs =
      ' abfrage.neu = " Tüte "   oder   abfrage.neu = " Tüte, Haus, Fenster "',
    msgTxt = clear
      ? `\nYeni kelime sorgusu yapmak icin 'abfrage.neu' ile alttaki örnekte oldugu gibi cift tirnak ("Haus") kullanarak kelime(leri) girin. Coklu kelime sorgusu icin her kelime arasina virgü/"," konulmali.`
      : zBs;
  zBs = clear ? zBs : null;
  msg.print(0, "Yeni Sorgulama", msgTxt, zBs);
};

async function appStarter() {
  await controller()
    .then((result) => {
      if (result) {
        let tryAgain = window.confirm(
          "Girilen kelimeler icin islem yapildi!\nIslem tekrarlansin mi?"
        );
        if (!tryAgain) {
          console.clear();
          console.warn(
            "Kelimeler icin islem tekrarlanmasi iptal edildi.\n",
            worteList
          );
          reorganizer();
          return;
        }
        return finish();
      }
      runBar.clear(true);
      storage.remove("lastWortList");
      getHTMLdoc();
    })
    .catch((error) => {
      if (error === "notWort") {
        console.clear();
        console.warn(
          "Islem yapilacak kelime bulunamadi!\n'abfrage.neu' ile yeni kelime girisi yapin!"
        );
        reorganizer();
      } else {
        console.log(error);
      }
    });
}

async function controller() {
  return new Promise((resolve, reject) => {
    if (abfrage.neu == "") reject("notWort");
    if (typeof worteList === "undefined") {
      const worteList = [];
      window.worteList = worteList;
      window.callNext = () => {};
    }
    worteList.length = 0;
    worteList = [...new Set(abfrage.neu.split(",").map((item) => item.trim()))];
    if (typeof wortObjsArr === "undefined") return resolve(false);
    const lastWortList = storage.get("lastWortList")
      ? storage.get("lastWortList")
      : [];
    let lastAbfrage =
      worteList.length === lastWortList.length &&
      worteList.every((val, index) => val === lastWortList[index]);
    return resolve(lastAbfrage);
  });
}

async function getHTMLdoc() {
  window.finish = finish; //doc ilk ögede hata olur ise...

  if (typeof HTMLdocs !== "undefined") HTMLdocs.length = 0; //doc sifirlanir
  callNext = wortObj;
  getDoc();
}
async function wortObj() {
  callNext = get_Image;
  getWortObject(runApp);
}

async function get_Image() {
  callNext = get_langTR;
  getImg();
}

async function get_langTR() {
  callNext = finish;
  getLang(); //Türkce karsiligi...
}

async function finish() {
  callNext = () => {}; //bos fonksiyon atanir
  if (app_pano.get("localWorte")) changeLocalWorte.call();
  console.clear();
  msg.allPrint();
  wortObjsArr.forEach((w) => {
    let result = new Promise((resolve) => {
      msg.group(1, w.wrt.wort, " kelimesi icin alinan sonuclar:");
      console.log(JSON.stringify(w));
      console.dir(w);
      resolve();
    });
    result.then(msg.group());
  });
  if(!!window.notInfinitiveWorte){
    notInfinitiveWorte.forEach(info=>{
      msg.group(4,"Hinweis", "Infinitive hali dikkate alinarak kayit yapilan kelimeler.", true);
      console.log(`"${info[0]}" kelimesi "${info[1]}" olarak sonuclar icerisinde listelendi.!\n`);
    });
    msg.group()
  }

  if (!app_pano.check("lastIndex")) storage.set("lastWortList", worteList, 3);
  console.log("\n");
  reorganizer();
}

await loadBase()
  .then(reorganizer(true))
  .catch((err) => {
    console.log(err, "m:getModuls, p:loadBase.then()");
  });

function changeLocalWorte() {
  //Bu fonksiyon ile local neuWort>>allAleWort kismina tasinir...ve objelerde düzeneleme yapilir
    let archive = storage.get("allAlteWorte");
  if (!archive) archive = {};
  wortObjsArr.forEach(w=>{
    Object.keys(w.searchParams).forEach(srchWort =>{
      console.log(w.wrt.wort, w.searchParams,w)
      if (!!archive[srchWort]) {
        let newKey = Object.keys( w.searchParams[srchWort])[0],
          newVal = Object.values( w.searchParams[srchWort])[0];
        Object.keys(archive[srchWort]).forEach((k) => {
          if (!archive[srchWort][k]) delete archive[srchWort][k];
        });
        newVal = !!newVal ? newVal : null;
        archive[srchWort][newKey] = newVal;
      } else {
        archive[srchWort] = localWortObj[srchWort];
      }
    })
  })

  let notRun=Object.keys(localWortObj)
  if(notRun.length>0){
    msg.add(
    2,
    "Islem Yapilmayanlar",
    "Alttaki kelime/ler icin islem yapilamadi!",  notRun.join(", ")
  );
  }
  
  
  console.log('local list son durumu: ',localWortObj)
  console.log('local list son durumu: ',archive)

  storage.set("neuWorte", localWortObj);
  localWortObj = null;
  removeOldLocalWorte(archive);

/*

  Object.keys(localWortObj).forEach((srchWort) => {
    let result = false;
    for (let i = 0; i < wortObjsArr.length; i++) {
      if (wortObjsArr[i].wrt.wort.match(new RegExp(srchWort,"gi"))){  //srchWort == wortObjsArr[i].wrt.wort) {
        result = true;
      } else if (!!wortObjsArr[i].searchParams[srchWort]) {
        wortObjsArr[i].searchParams[srchWort] = null;
        result = true;
      }
      if (result) break;
    }

    if (result) {
      //neuWortListe'deki kelime archive yani @ri5: allAlteWorte'e tasinir
      if (!!archive[srchWort]) {
        let newKey = Object.keys(localWortObj[srchWort])[0],
          newVal = Object.values(localWortObj[srchWort])[0];
        Object.keys(archive[srchWort]).forEach((k) => {
          if (!archive[srchWort][k]) delete archive[srchWort][k];
        });
        newVal = !!newVal ? newVal : null;
        archive[srchWort][newKey] = newVal;
      } else {
        archive[srchWort] = localWortObj[srchWort];
      }
      delete localWortObj[srchWort];
    } else {
      notFound.push(srchWort);
    }
  });
*/
  
}

function removeOldLocalWorte(archive) {
  //bunun ile lokalde tutulan "@ri5: archive" durumu kontrol edilerek sismeyi engeller...
  let limit = 1000,
    monat,
    keys = Object.keys(archive);
  if (keys.length > limit) {
    alert(
      `⛔ Lokalde ${limit}'den fazla kelime ve tanim bilgileri tutulmakta.\nEski tarihlilerden baslanarak silinecektir!`
    );
  } else if (keys.length > 250) {
    monat = 3; //default
    monat = prompt(
      "⚠️ Lokalde 250'yi askin kelime ve tanim bilgileri tutulmakta.\n🪠 Kac aydan eski olanlar silinsin?\n\nAy degerini rakmala girin.",
      monat
    );
    monat = !monat || monat < 1 ? false : monat > 12 ? 12 : monat;
    if (!monat) return;
  } else {
    //yeni degerler allAlteWorte atanir...
    storage.set("allAlteWorte", archive);
    archive = null;
    return;
  }

  let dateArr = []; //tarihe göre sirali olarak tutulur
  keys.forEach((k) => {
    Object.keys(archive[k]).forEach((sk) => {
      let d = sk.split("_")[0].split(".");
      d = new Date(`${d[2]}-${d[1]}-${d[0]} ${sk.split("_")[1]}`);
      dateArr.push([d, k, sk]); //tarih nesnesi, kelime adi, tarih (string) olarak alt key
    });
  });
  dateArr.sort().reverse(); //alinan sub keyler yeniden > eskiye dogru siralanir
  //belirli tarihe göre silme
  if (!!monat) {
    let t = new Date();
    let selectedDate = new Date(t.setMonth(t.getMonth() - monat)); // new Date(t.setHours(t.getHours()-monat))
    dateArr.forEach((i) => {
      if (i[0] < selectedDate) delete archive[i[1]][i[2]];
    });
  } else {
    dateArr.slice(limit, dateArr.length).forEach((i) => {
      delete archive[i[1]][i[2]];
    });
  }
  //eger key altinda öge kalmadi ise ilgili key silinir
  keys.forEach((k) =>
    Object.keys(archive[k]).length < 1 ? delete archive[k] : ""
  );
  //yeni deger allAlteWorte atanir...
  storage.set("allAlteWorte", archive);
  archive = null;
}

function kurzeListe(arr, len = 12) {
  if (arr.length < 1) return false;
  let shrtArr = arr.slice(0, len);
  shrtArr = Array.isArray(shrtArr) ? shrtArr.join(", ") : "";
  return `${shrtArr}${arr.length > len ? "..." : ""}`;
}
