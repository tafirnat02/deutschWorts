//bu modülle 'isim' olan kelimeler icin google CSE kullanilarak görsel sonuclari eklenir...
/*-------- Disariya Cikarilan Ögeler ---------*/
export { getImg };

/*-------- Modul icerigindeki Ögeler ---------*/

//ugulamanin basinda api sayfaya dahil edilir
//ugulamanin basinda api sayfaya dahil edilir

var imgArr = [],
  url,
  index,
  len;
const api = {
    index: 0,
    cse: 0,
  },
  cse = [
    ["AIzaSyA4G2MEzMKpYk9aS88kCGXZwOXQWwIvWxw", "a3e969be698bd439c"],
    ["AIzaSyCVS4E6QeXeDZoyEMOICbKxUR22O7uNGVM", "3a809e54711b3d927"],
    ["AIzaSyAOzki0o1Pi1zvSOSLVY0cVWBSDb1EwtKg", "206d7b21e9b9cb1ff"],
    ["AIzaSyCuccrJiVM6rntFedFIM4LEH-jF_uCv8Zw", "35567e479b9d748eb"],
    ["AIzaSyDqNKbCbulrRy6XJvELDdv9LOtpSGeii8M", "25137c264a9db4dbc"],
    ["AIzaSyAKYGVOpY9R0XjuvPiocMEE8GtdHdjuk5I", "a3e78d7388ad640cf"],
  ],
  qW = {
    wort: "",
    main: "",
    eng: "",
    deu: "",
    rRgxWrd: new RegExp(/,|\.|;|\//gi),
    rRgxDom: new RegExp(/<i>|<b>|<\/i>|<\/b>|<br>|[ ]{2,}/gi),
    rRgxOR: new RegExp(/OR OR|OR  OR| OR OR | OR  OR /g),
    excludedURL:
      " OR -logo -inurl:[www.verbformen.com] -inurl:[www.verbformen.de] -inurl:[www.verbformen.es] -inurl:[www.verbformen.ru] -inurl:[www.verbformen.pt] -inurl:[www.duden.de]",

    run: async function (wObj) {
      try {
        this.wObj = wObj;
        this.mF();
        this.eF();
        this.dF();
      } catch (error) {
        console.log('hata olustu...')
        for( let key in wObj)console.log(key, wObj[key])
        console.log(error)
        let posText = 'Görsel alinirken hata meydana geldi! (m:img_, o:qW.run())'
        try {
          msg.add(3,wObj.wrt.wort,posText, error)
        } catch (err) {
          msg.add(3,'Error | wObj? ',posText, error)
        }
      }
    },
    q: function (text) {
      return (text + this.excludedURL)
        .replaceAll(this.rRgxOR, " OR ")
        .replaceAll(" OR -logo ", " -logo ");
    },
    mF: function () {
      //tekil varsa cogul formuna göre arama yapilir
      this.wort =
        `"${this.wObj.wrt.wort}" OR ${this.wObj.wrt.wort}` +
        ((this.wObj.wrt.artikel != "-" || this.wObj.wrt.plural != "-") &&
        this.wObj.wrt.plural != this.wObj.wrt.wort
          ? " OR " + this.wObj.wrt.plural
          : "");
      this.main = this.q(this.wort);
    },
    eF: function () {
      //ingilizce tanim yoksa false dönderilir...
      if (!this.wObj.lang_En) return false;
      this.eng = this.q(
        this.wObj.lang_En
          .replaceAll(this.rRgxDom, "")
          .replaceAll(this.rRgxWrd, " OR ")
      );
    },
    dF: function () {
      //almanca tanimina göre arama yapilir
      if (!this.wObj.lang_DE) return false;
      this.deu = this.q(
        `${this.wort} OR ${this.wObj.lang_DE
          .replaceAll(this.rRgxDom, "")
          .replaceAll(this.rRgxWrd, " OR ")}`
      );
    },
  };

const cseUrl = async (text) => {
  return new Promise((resolve, reject) => {
    const searchPara = [],
      searchDe = ["de", "countryDE"],
      searchEn = ["en", "countryUS"],
      rRgxUrl = new RegExp(/&[ ]{1,}/gi),
      rRgxBreak = new RegExp(/\r\n|\r|\n|\t|[ ]{2,}/gi);

    api.cse === 1 ? searchPara.push(...searchEn) : searchPara.push(...searchDe);

    url = `https://customsearch.googleapis.com/customsearch/v1?
  key=${cse[api.index][0]}&
  cx=${cse[api.index][1]}&
  searchType=image&
  safe=active&
  c2coff=1&
  filter=1&
  cr=${searchPara[1]}&
  gl=${searchPara[0]}&
  hl=${searchPara[0]}&
  q=${qW[api.cse === 0 ? "main" : api.cse === 1 ? "eng" : "deu"]}
  `;
    url = url.replaceAll(rRgxBreak, "").replaceAll(rRgxUrl, "&");
    resolve();
  });
};

const setObj = async (wObj) => {
  let ms = index==0?1000:index==1?100:10;
  await new Promise(resolve => setTimeout(resolve, ms));
  return new Promise((resolve, reject) => {
    qW.run(wObj);
    cseUrl();
    resolve();
  });
};

const searchImg = async () => {
  let currentWort = wortObjsArr[index].wrt.wort;
  //url olusturulduktan sonra siradaki opsiyona gore alternatif sorgu icin qW'daki secim degistirlir:
  api.cse++;
  await fetch(url)
    .then((response) => {
      switch (response.status) {
        case 200:
          return response.text();
        case 429:
          throw 429; //break;
        case 503:
          throw 503; //break;
        default:
          throw response; //break;
      }
    }) // or .json()
    .then((response) => {
      return JSON.parse(response);
    })
    .then((response) => {
      if (response.searchInformation.totalResults !== "0") return response;

      if (api.cse < 3) {
        //aramada sonuc bulunamaz ise sonraki opsiyon qW kelimesine göre alama yapilir
        nextCse();
      } else {
        throw "noImage";
      }
    })
    .then((response) => {
      response.items.forEach((item) => {
        imgArr.push(item.image.thumbnailLink);
      });
    })
    .then(() => {
      if (imgArr.length >= 6 || api.cse > 2) api.finish = true; //cikis yapilir
      //eger yeteri kadar sonuc yok ise sonraki qWorte göre aeama yapilir.
      nextCse();
    })
    .then(() => {
      if (imgArr.length < 1) throw "noImage";
      //imgArr dizinindeki urller ilgili kelimeye dahil edilir aktarilir
      wortObjsArr[index].img.push(...imgArr);
    })
    .catch((err) => {
      switch (err) {
        case "noImage": //tüm secimlik metin aramasi sonucu image bulunamamasi durumu
          if (imgArr.length < 1)
            msg.add(
              2,
              `🚨 ${currentWort}`,
              `Not found image! (f:getImg-searchImg)`
            );
          break;
        case 429: // server engeli halinde diger keyler id'ler ile denenir...
        case 503: // server cevap vermeme halinde...sirayla diger cse lerle denenir...
          api.index++;
          if (api.index > cse.length) api.status = false;
          if (api.status !== false) {
            nextCse();
          } else {
            let txt429 = [429, `HTTP 429 Too Many Requests: rate limiting!`],
              txt503 = [
                503,
                `HTTP 503 the server is currently unable to handle the incoming requests!`,
              ];
            txt = err === 429 ? txt429 : txt503;
            msg.add(
              2,
              `${txt[0]} | ${currentWort}`,
              `${txt[1]} (f:getImg-searchImg)`
            );
          }
          break;
        default: // diger hatalar
          msg.add(
            //cikis yapilir
            3,
            `${currentWort}`,
            `Görsel alinirken hata olustu! (m:_img, f:searchImg) ${url}`,
            err
          );
          break;
      }
    });

  //sirali halde fonksiyonlar isleme alinir...
  async function nextCse() {
    if (api.finish) return; //uygulamadan cikilir...
    await setObj();
    searchImg();
  }
};

const getImg = async () => {
  if (len === undefined) {
    len = wortObjsArr.length;
    index = 0;
  }
  imgArr.length = 0;
  api.cse = 0; //aramadaki kelime grubu sifirlanir...
  if (!!wortObjsArr[index].status.Substantiv[0]) {
    await setObj(wortObjsArr[index]);
    await searchImg();
  }
  runBar.set(7, index, len);
  index++;
  if (index < len && api.status !== false) {
    getImg();
  } else {
    index = 0;
    callNext();
    //byController.image = true;
  }
};
