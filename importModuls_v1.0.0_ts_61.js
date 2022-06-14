import { runApp } from "./module/creatWortObj_ts08.js";
import { getDoc } from "./module/documents_ts05.js";
import { getWortObject } from "./module/getWortObj_ts03.js";
import { getImg } from "./module/image_ts08.js";
import { getLang } from "./module/lang_ts18.js";
import { baseFun } from "./module/main_ts08.js";

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
    let localWortObj = storage.get("neuWorte");
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
      return abfrage.neu = exList ;
    }else if(Object.keys(localWortObj).length>0){
      let localWortArr = [],shortWortList,allLocalList;
      for(let k_ in localWortObj)localWortArr.push(k_)
      localWortArr.sort()
      allLocalList=localWortArr.join(",")
      shortWortList=localWortArr.slice(0,12).join(', ') + (localWortArr.length>12?'...':'')
      let localWort = confirm(`🪃 Sayfada yakalanan kelimeler bulunmakta. 🧭 Bu kelime listesi icin islem yapilsin mi?\n\n📌Kelimeler: ${shortWortList}`)
      if(!!localWort){
        byController.localWorte=true;
        window.localWortObj=localWortObj;
        return abfrage.neu = allLocalList; //bu kelimeler "worteList" olarak globale aktarilir sonraki functionlarla...
      }
    }
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
  if(byController.localWorte) changeLocalWorte.call();
  delete byController.localWorte
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

  function changeLocalWorte(){
/**
 * 
 * Bu kismda localdeki wprt listesilinirken bazi kelimeler atlanmakta! silinmemekete
 * bu hata düzeltilecej...
 * 
 */
    //Bu fonksiyon ile local neuWort>>allAleWort kismina tasinir...ve objelerde düzeneleme yapilir
    let neuWotreKeys=Object.keys(localWortObj),
        cloneallAlteWort=storage.get("allAlteWorte");
    if(!cloneallAlteWort) cloneallAlteWort={};

    neuWotreKeys.forEach(srchWort=>{
      let result=false;
      for (let i = 0; i < wortObjsArr.length; i++) {
        if(srchWort == wortObjsArr[i].wrt.wort){
          result = true;
        }else{
          console.log('@impMo..cekimli kelime bulundu:' ,srchWort )

          let wSrchP = wortObjsArr[i].searchParams
          let subKeys= Object.keys(wSrchP);
          if(subKeys.length>0){
            subKeys.forEach(sKey=>{
              if(srchWort == sKey && !wSrchP[sKey]){
                wortObjsArr[i].searchParams[srchWort] = true;
                result = true;
              }
            })
         }
        }
        if(result) break;
      }

       if(result){//neuWortListe'deki kelime archive: cloneallAlteWort'e tasinir
        if(!!cloneallAlteWort[srchWort]){
          // Kelime tanimla ise alinmayaca veya bos ise...
          let subKey= Object.keys(localWortObj[srchWort])[0],
              subVal= Object.values(localWortObj[srchWort])[0];
              subVal = subVal=="Kelimeyi tanimla..." || !subVal ? false:subVal;
          if(subVal) cloneallAlteWort[srchWort][subKey] = subVal;
         }else{
           cloneallAlteWort[srchWort]=localWortObj[srchWort]
         }
         delete localWortObj[srchWort]
       }else{
        msg.add(2,srchWort,'Arama yapilan bu kelime, islem sonucunda alinan diger kelimelerle eslestirilemedi!')
       }
})
window.localStorage.setItem("@ri5: allAlteWorte", JSON.stringify(cloneallAlteWort))
window.localStorage.setItem("@ri5: neuWorte", JSON.stringify(localWortObj))
localWortObj=null
console.log('msg.container: ',msg.container)

  }