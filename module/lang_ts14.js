//bu modul ile olusturulan wortObj icerisinde kelimenin -trükcesi yok ise rapidAPI/google Translate ile Türkcesi alinir.
/*-------- Disariya Cikarilan Ögeler ---------*/
export { getLang };

/*-------- Modul icerigindeki Ögeler ---------*/
var gapiAllLimit, index, len, key, userDef;
//wortObjArr'da tutulan wortObj de TRlang kontrol edilir. Bos ise gapi den cevirisi alinmak üzere diger functionlara yönlendirilir

const isEmptyLang = async () => {
  let crlWrt = wortObjsArr[index].wrt.wort;
  userDef = !!localWortObj ? Object.values(localWortObj[crlWrt]) : "";
  userDef = !!userDef[0] ? userDef : "";
  userDef =
    !!userDef && userDef != "Kelimeyi tanimla..." ? ` 💭 ${userDef} @ri5` : "";

  if (wortObjsArr[index].lang_TR != "") {
    wortObjsArr[index].lang_TR += userDef;
    return trLang();
  }
  //bu kisim api sisirmemesi icin.... silinecek....
  wortObjsArr[index].lang_TR = "ceviri alindi @gApi" + userDef;
  return trLang();
  //bu kisim api sisirmemesi icin.... silinecek....

  key = await new Promise((resolve) => {
    resolve(gapiKey());
  });
  if (!gapiAllLimit) {
    await checkLang(wortObjsArr[index]);
  } else {
    if (gapiAllLimit) gapiKeyEnd(wortObjsArr[index].wrt.wort); //eger api limitine ulasilmis ise ekrana msg gösterimi yapilir isleme devam edilmez...
    trLang(); //sonraki kelimelerdeki TR_lang durumunun bildirilmesi icin bu islem tekrarlanir sadece...
  }
};

//modul erisimi ile wortObjArr dizini uzunlu tespit edilip routerLang ile islem yapilir
const getLang = () => {
  index = 0;
  len = wortObjsArr.length;
  if (len > index) isEmptyLang();
};

//wortObjArr dizinindeki tüm ögeler icin routerLang ile islem yapilir
const trLang = () => {
  runBar.set(10, index, len);
  index++;
  if (index >= len) {
    //eger key limitine ulasilmis ise key durumu sifirlanir...
    if (key === false) storage.set("gapiLang", 0, 12);
    gapiAllLimit = false;
    callNext(); //
  } else {
    isEmptyLang(); //sonraki wortObj'deki trLang kontrol edilir
  }
};

async function checkLang(wortObj) {
  try {
    await gapiTranslate(wortObj)
      .catch((error) => {
        throw { error };
      })
      .then((response) => {
        if (response === true) return trLang(); //basarili
        if (response === "apiLimit") {
          //api limiti
          storage.set("gapiLang", storage.get("gapiLang").value + 1, 12); //api key index no siradaki olarak atanir
          isEmptyLang(); // ayni kelime icin islem siradaki key ile tekrar denenir...
        }
        //hata dönderilir ise hata firlatilir ve sonrakine gecilir...
        throw response;
      });
  } catch (error) {
    msg.add(
      3,
      `Error | ${wortObj.wrt.wort}`,
      `"Translate: gapi error!" m:lang*js f:wortObj`,
      error
    );
    //isleme devam edilmesi icin sonraki kelimeye gecilir...
    trLang();
  }
}

async function gapiTranslate(wortObj) {
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
          if (typeof response.message === "string") return resolve("apiLimit");
          //basarili sekilde veri alindi
          wortObj.lang_TR =
            response.data["translations"][0].translatedText.replaceAll(
              /»|⁰|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹|\(|\)|\n/gi,
              ""
            ) +
            " @gApi" +
            userDef; //@gApi ile ceviri olarak eklendigi bildirilir...
          return resolve(true); //ceviri basarili sekilde yapildi...
        })
        .catch((error) => {
          return reject(error); //hata alinmasi halinde bu reject ile dönderilir...
        });
    } else {
      return resolve("apiLimit");
    }
  });
}

async function gapiKey() {
  return await checkStorage().then((result) => {
    let localStorage = result;
    return new Promise((resolve, reject) => {
      //kullanilacak keyi secer ve geriye dönderi   >> key test >> https://rapidapi.com/googlecloud/api/google-translate1/
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
        keyIndex = localStorage.value; /// storage.get("gapiLang").index; //eger storagede tutulan bir deger varsa buradan devam edilir...
        if (keyIndex >= gapi.length) {
          gapiAllLimit = true; //sonraki kelimler icinde limit sebebiyle translate islemi yapilmaz....
          return resolve(false);
        }
      } else {
        //eger localStorage'de bulunmuyorsa yeni bir obje olusturulur...
        storage.set("gapiLang", keyIndex, 12); //obje kullanim süresi 12 saat olarak ayarlandi...
      }
      return resolve(gapi[keyIndex]); //kullanilmak üzere alinan keyIndex value dönderilir
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
