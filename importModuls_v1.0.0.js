/**  --- import edilen ögeler --- */
import { runApp } from "./module/_creatWortObj_.js"; //HTML'den wort nesnesinin icerigini toplar
import { getDoc } from "./module/_documents_.js"; //document/HTML dizin olarak ham verileri tutar
import { getWortObject } from "./module/_getWortObj_.js"; //HTML  olarak alinan dizin ögelerini nesne olusturmaya yönlendirir
import { getImg } from "./module/_img_.js"; //image islemlerini yapar
import { getLang } from "./module/_lang_.js"; //dil islemlerini yapar
import { baseFun } from "./module/_zBase_.js"; //bu bir dizin altindaki tüm ögleri 'base' adli degiskene export eder...

//temel ögeler yüklenir...
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

//burada loadbase ile temel ögeler yüklendikten sonra kullanicidan kelime girisi yapilmasi istenilir...
const reorganizer = clear =>{
    window.reorganizer=reorganizer
    if(clear)console.clear()
    msg.print(0,"Yeni Sorgulama Yap",
    "\nYeni sorgusu yapmak icin 'abfrage.neu' ile alttaki örnekte oldugu gibi kelime(leri) girin.\n(Coklu kelime sorgusu icin her kelime arasina virgü-',' konulmali. )",
    ' abfrage.neu = " Tüte "   oder   \n abfrage.neu = " Tüte, Haus, Fenster "')
}

async function appStarter() {
  await controller()
    .then((result) => {
      if (result) {
        let tryAgain = window.confirm(
          "Girilen kelimeler icin islem yapildi!\nIslem tekrarlansin mi?"
        );
        if (!tryAgain){
          console.clear();
           console.warn(
            "Kelimeler icin islem tekrarlanmasi iptal edildi.\n",
            worteList
          );
          reorganizer(false)
          return
        }
        return finish(); //son alinan wortObj tekrar ekrana basilir...
      }
      runBar.clear(true)
      storage.remove("lastWortList");
      getHTMLdoc();
    })
    .catch((error) => {
      if (error === "notWort") {
        console.clear()       
        console.warn(
          "Islem yapilacak kelime bulunamadi!\n'abfrage.neu' ile yeni kelime girisi yapin!"
        );
        reorganizer(false)
      } else {
        console.log(error);
      }
    });
}

//sayfada modulün olup olmadigini, varsa kelime listesinin
async function controller() {
  return new Promise((resolve, reject) => {
    if (abfrage.neu == "") reject("notWort");
    //if (typeof worteList === "undefined") new Promise(res => {const worteList = []; window.worteList = worteList; res()});
    if (typeof worteList === "undefined") {
      const worteList = [];
      window.worteList = worteList;
      window.callNext =()=>{}
    }
    worteList.length=0
    worteList = [...new Set (abfrage.neu.split(",").map(item=> item.trim()))];
    if(typeof wortObjsArr === "undefined") resolve(false)
    const lastWortList = storage.get("lastWortList")
      ? storage.get("lastWortList").value
      : [];
    resolve(
      worteList.length === lastWortList.length &&
        worteList.every((val, index) => val === lastWortList[index])
    );
  });
}

async function getHTMLdoc() {
  if (typeof HTMLdocs !== "undefined") HTMLdocs.length = 0; //doc sifirlanir
  callNext= wortObj
  getDoc();
}
async function wortObj() {
  callNext =get_Image;
  getWortObject(runApp);
}

async function get_Image() {
   callNext=get_langTR
  getImg(); //görseller alinir...
}

//wortObjsArr dizininde tutulunan wortObj'ler icin lang_TR durumu kontrol edilir ve yoksa gapi ile Türkcesi alinir.
async function get_langTR() {
  callNext =finish
  getLang(); //Türkce karsiligi...
}

async function finish() {
  callNext =()=>{}
  storage.set("lastWortList", worteList, 3);
  console.clear();
  msg.allPrint();
  //sonuclar ekrana basilir...
  wortObjsArr.forEach((w) => {
    let result = new Promise((resolve) => {
      msg.group(1, w.wrt.wort, " kelimesi icin alinan sonuclar:");
      console.log(JSON.stringify(w));
      console.dir(w);
      resolve();
    });
    result.then(msg.group());
  });
  console.log('\n')
  reorganizer(false)
}

await loadBase()
  .then( reorganizer(true)) //.then(appStarter())
  .catch((err) => {
    console.log(err, "m:getModuls, p:loadBase.then()");
  });

//_______________________-
/*
Dizin Yapisi:
📂
  |_📇appStarter.js         .../appStarter.js"
  |_📇getMosuls_*.js        .../getMosuls_*.js"  
  |_📂WortApp               .../wortApp
    |_📇_importModuls_*.js  .../wortApp/_importModuls_*.js  📍
    |_📂module                  ./module
    |_📇_Documents_*.js         ./module/_documents_*.js 
    |_📇_img_*.js               ./module/_img_*.js 
    |_📇_lang_*.js              ./module/_lang_*.js
    |_📇_wortList_*.js          ./module/_wortList_*.js   🟡
    |_📇_wortObj_*.js           ./module/_wortObj_*.js
    |_📇_zBase_*.js             ./module/_zBase_*.js      🟡
    |_📇wortList.json           ./module/wortList.json    
*/
