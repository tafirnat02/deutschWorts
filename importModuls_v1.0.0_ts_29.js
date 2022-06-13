import { runApp } from "./module/creatWortObj_ts01.js";
import { getDoc } from "./module/documents_ts03.js";
import { getWortObject } from "./module/getWortObj_ts01.js";
import { getImg } from "./module/image_ts08.js";
import { getLang } from "./module/lang_ts10.js";
import { baseFun } from "./module/main_ts07.js";

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

const reorganizer = clear =>{
    window.reorganizer=reorganizer
    if(clear)console.clear()
    let exList=false;
    let lastWortIndexObj= storage.get("wortListIndex");
    let lastWortListObj =storage.get("lastWortList");
    if(lastWortIndexObj && lastWortListObj){
     if(!lastWortIndexObj.control){
      let lastIndexNo= lastWortIndexObj.value;
      let lastWortList= lastWortListObj.value;
      let subList = lastWortList.slice(lastIndexNo,lastWortList.length).join(", ");
      exList = confirm(`🛸Son sorguda islem yapilamamis kelimeler tespit edildi!\n📋Eski kelimelerden devam edilsin mi?\n\n🔖Kelime listesi: ${subList}`);
      exList=exList?subList:false;
     }
     storage.newKey("wortListIndex","control",false)
    } 
    if(!!exList){
      if(lastWortIndexObj) storage.remove("wortListIndex");
      abfrage.neu = exList ;
    }else if(storage.get("wortListIndex")){

    }else{
      msg.print(0,"Yeni Sorgulama Yap",
      "\nYeni sorgusu yapmak icin 'abfrage.neu' ile alttaki örnekte oldugu gibi kelime(leri) girin.\n(Coklu kelime sorgusu icin her kelime arasina virgü-',' konulmali. )",
      ' abfrage.neu = " Tüte "   oder   \n abfrage.neu = " Tüte, Haus, Fenster "')
    }

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
        return finish();
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

async function controller() {
  return new Promise((resolve, reject) => {
    if (abfrage.neu == "") reject("notWort");
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
  window.finish=finish //doc ilk ögede hata olur ise...

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
  getImg();
}

async function get_langTR() {
  callNext =finish
  getLang(); //Türkce karsiligi...
}

async function finish() {
  callNext =()=>{};//bos fonksiyon atanir
  storage.set("lastWortList", worteList, 3);
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
  console.log('\n')
  reorganizer(false)
}

await loadBase()
  .then( reorganizer(true))
  .catch((err) => {
    console.log(err, "m:getModuls, p:loadBase.then()");
  });
