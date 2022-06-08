//bu modul ile olusturulan wortObj icerisinde kelimenin -trükcesi yok ise rapidAPI/google Translate ile Türkcesi alinir.
/*-------- Disariya Cikarilan Ögeler ---------*/
export { getLang };

/*-------- Modul icerigindeki Ögeler ---------*/
var gapiAllLimit, index, len;
//wortObjArr'da tutulan wortObj de TRlang kontrol edilir. Bos ise gapi den cevirisi alinmak üzere diger functionlara yönlendirilir

const isEmptyLang = async() => {
if (wortObjsArr[index].lang_TR != "") {trLang(); return }

if (!gapiAllLimit) {
  await checkLang(wortObjsArr[index]);
} else {
  if (gapiAllLimit) gapiKeyEnd(wortObjsArr[index].wrt.wort); //eger api limitine ulasilmis ise ekrana msg gösterimi yapilir isleme devam edilmez...
  trLang(); //sonraki kelimelerdeki TR_lang durumunun bildirilmesi icin bu islem tekrarlanir sadece...
}
};

//wortObjArr dizinindeki tüm ögeler icin routerLang ile islem yapilir
const trLang = () => {
  runBar.set(10, index, len);
  index++;
  if (index >= len) {
    callNext(); //
  } else {
    isEmptyLang(); //sonraki wortObj'deki trLang kontrol edilir
  }
};

//modul erisimi ile wortObjArr dizini uzunlu tespit edilip routerLang ile islem yapilir
const getLang = () => {
  gapiAllLimit = false;
  index = 0;
  len = wortObjsArr.length;
  if (len > index) isEmptyLang();
};

async function checkLang(wortObj) {
  try {
    await gapiTranslate(wortObj)
      .catch((error) => {
        throw { error };
      })
      .then((response) => {
        // if (gapiAllLimit)return // eger tüm keyler limite ulasilmis ise gapi islemi ne gecilmez....
        if (response === true) trLang(); //basarili sekilde ceviri sonucu alinmis ise sonraki wortObj e gecilir..
        if (response === "apiLimit") {
          //api limiti durumunda sonraki api ile islem tekrarlanir
          let newKeyIndex = storage.get("gapiLang").index + 1; //api key index no siradaki olarak atanir
          storage.set("gapiLang", newKeyIndex, 12);
          isEmptyLang(); // ayni kelime icin islem yeni key ile tekrar denenir...
        }

        //farkli bir hata ola durumu kontrol edilebilir, eger yokse yapi icinde!

        return;
      });
  } catch (error) {
    msg.add(
      3,
      `Error | ${wortObj.wrt.wort}`,
      `"Translate: gapi error!" m:lang*js f:wortObj`,
      error
    );
  }
}

async function gapiTranslate(wortObj) {
  console.log('giristeki key:',key)
  let key = await  new Promise((resolve) => {resolve(gapiKey()) ;})
  console.log('alinan key:',key)
  return new Promise((resolve, reject) => {
    /** api islem sonucu basarili iee true, ancak key limiti ise key limit geriye dönderilir**/
    if (!!key) {
      const encodedParams = new URLSearchParams();
      encodedParams.append("q", wortObj.wrt.wort);
      encodedParams.append("target", "tr");
      encodedParams.append("source", "de");

      const options = {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "application/gzip",
          "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
          "X-RapidAPI-Key": key,
        },
        body: encodedParams,
      };
      fetch(
        "https://google-translate1.p.rapidapi.com/language/translate/v2",
        options
      )
        .then((response) => response.json())
        .then((response) => {

          console.log(response)

          if (typeof response.message === "string") {
            //api sorgu limiti
            resolve("apiLimit");
          } else {
            //basarili sekilde veri alindi
            wortObj.lang_TR =
              response.data["translations"][0].translatedText.replaceAll(
                /»|⁰|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|\(|\)|\n/gi,
                ""
              ) + " @gApi"; //@gApi ile ceviri olarak eklendigi bildirilir...
            resolve(true); //ceviri basarili sekilde yapildi...
          }
        })
        .catch((error) => {
          reject(error); //hata alinmasi halinde bu reject ile dönderilir...
        });
    } else {
      resolve("apiLimit");
    }
  });
}

async function gapiKey() {
  return await checkStorage()
  .then((result) => {
    let localStorage = result;
    return new Promise((resolve, reject) => {
      //kullanilacak keyi secer ve geriye dönderi
      //key test >> https://rapidapi.com/googlecloud/api/google-translate1/
      const gapi = [
        "7a7b531352msh47e6e582c9a0340p181ba8jsnfd06f4a6b0e3",
        "4169b729a4mshdfbcf80a2cd8e6cp15bd53jsnaf3a9c946fa8",
        "92ce60f8d0mshc350c83f2271d57p1fc85cjsn6cc325b66603",
        "2a17947c6fmsh37224f56f3284b3p1dd75djsndfac7a9015fe",
        "fc1d84d6aamsh58aa3844407ec67p11597bjsnbd12981632ba",
        "83219a4a0cmshbc13d688ac6b942p1c8044jsn9a2b9871e43d",
        "1cfd59fd33msh38d8050f2040c54p1cd2f9jsnfd3e122d293c",
        "80eb2deae2mshb393cd69c2783b6p190ec5jsnc1701bf3bde1",
        "aa5821836amsh8cc27db9c0a6ccap17ed8fjsn78e8de5e382b",
        "d041d76df6msh4c7b6813615f12cp167d70jsned4f0e8fb04a",
        "315d73dc43msh61c6def5cbe0690p1cad03jsnc046f66648da",
      ];

      //varsayim olarak 0 ile baslanir...
      let keyIndex = 0;
      //öncelikle localStorage'de aon 24 saatte kullanilan bir index var mi kontrol edilir yoksa 0 gönderilir...
      if (localStorage) {
        gapiAllLimit = true; //sonraki kelimler icinde limit sebebiyle translate islemi yapilmaz....
        keyIndex = localStorage.value; /// storage.get("gapiLang").index; //eger storagede tutulan bir deger varsa buradan devam edilir...
        if (keyIndex >= gapi.length) {
          gapiAllLimit = true; //sonraki kelimler icinde limit sebebiyle translate islemi yapilmaz....
          resolve(false);
        }
      } else {
        //eger localStorage'de bulunmuyorsa yeni bir obje olusturulur...
        storage.set("gapiLang", keyIndex, 12); //obje kullanim süresi 12 saat olarak ayarlandi...
      }
      resolve(gapi[keyIndex]); //kullanilmak üzere alinan keyIndex value dönderilir
    });
    //eger api limitleri dolmus ise bildirimde bulunulur....
  });
}

async function checkStorage() {
  //localStorage'de gapiLang var mi kontrol edilir, var ve bir index no iceriyorsa bu degeri, yoksa false döner
  return new Promise((resolve) => {
    resolve(storage.get("gapiLang")); //yok veya index no bulunmaz veya 24 saatte eski ise false döner...
  });
}

async function gapiKeyEnd(wort) {
  msg.add(
    2,
    `API Limit | ${wort}`,
    `Bu kelime icin translate yapilamadi! m:lang*.js f:gapiKeyEnd`
  );
}
