/* Burada tüm modüllerde kullanilacak olan ögeler yer almakta...*/

export { baseFun };

/*  --- Fonksiyonlar vd. --- */
const baseFun = async () => {
  return setItems.call();
};
baseFun().catch((err) => console.log(err));

//=============================================================
//gloabale atanacak öge biödirimi ve globale aktarimi. setValues icinde olmali tüm ögeler....
function setItems() {
  //yüzde % gösterimi...  Aciklama notion'da mevcut____________
  const runBar = {
    msgStatus: [
      "▱▱▱▱▱▱▱▱▱▱",
      "▰▱▱▱▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱▱▱▱",
      "▰▰▰▱▱▱▱▱▱▱",
      "▰▰▰▰▱▱▱▱▱▱",
      "▰▰▰▰▰▱▱▱▱▱",
      "▰▰▰▰▰▰▱▱▱▱",
      "▰▰▰▰▰▰▰▱▱▱",
      "▰▰▰▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰▰▰▰",
    ],
    lastIndex: 0,
    set: function (toIndex, min = 0, max = 0) {
      if (toIndex < 0 || toIndex > 10) return;
      if (max !== 0) {
        if (this.rate === undefined) {
          this.dif = toIndex - this.lastIndex;
          this.rate = Math.round((max - min) / this.dif);
        }
        toIndex = this.lastIndex;
        if (min % this.rate === this.dif % this.rate) this.lastIndex++;
        if (min === max) {
          delete this.rate;
          delete this.dif;
        }
      } else {
        if (toIndex <= this.lastIndex || this.lastIndex > 10) return;
        this.lastIndex = toIndex; //< this.lastIndex ? this.lastIndex : toIndex;
        toIndex = -1;
      }
      if (this.lastIndex <= toIndex || this.lastIndex > 10) return;
      console.clear(); //öncekiler temizlenir...
      console.log(
        `🚩running... ${this.msgStatus[this.lastIndex]} ${this.lastIndex}0%`
      );
    },
    clear: function (consolePrint = false) {
      this.lastIndex = -1;
      if (consolePrint) this.set(0);
    },
  };

  /**** mesaj bildirim islemlerine dair ****/
  const msg = {
    style: {
      titleColor: [
        "background: DodgerBlue;", //primary
        "background: Green;", //successful
        "background: DarkGoldenRod;", //warning
        "background: Red;", //error
      ],
      bodyColor: [
        "color: DeepSkyBlue;",
        "color: LimeGreen;",
        "color:DarkGoldenRod;",
        "color: Red;",
      ],
      title: function (typ) {
        return `${this.titleColor[typ]} font-size: 12px; font-weight: bold; padding: 3px 5px; border-radius: 5px;`;
      },
      body: function (typ) {
        return this.bodyColor[typ];
      },
    },
    container: [],
    add: function (msgTyp, title, text, add = "") {
      let newMsg = [msgTyp, title, text, add];
      this.container.push(newMsg);
    },
    print: function (typ, title, text, add = "") {
      console.log(
        `%c ${title} %c ${text}`,
        this.style.title(typ),
        this.style.body(typ)
      );
      if (!!add) console[typ == 3 ? "error" : typ == 2 ? "warn" : "info"](add);
    },
    allPrint: function () {
      if (this.container.length < 1){
        this.print(0,"Sorgu Sonucu",'Kelimelere ait veri sonuclari:', false);
        return;
      } 
      this.container.sort();
      //islem kayit sonuclari gruplu(false=>acik) olarak gösterilir
      this.group(0, "Sorgu Sonucu", "Alinan hatalara dair aciklamalar:", false);
      this.container.forEach((msg) => {
        let msgTyp, title, text, add;
        [msgTyp, title, text, add] = msg; //degiskenlere array degerleri atanir
        this.print(msgTyp, title, text, add);
      });
      this.group();
      this.container.length = 0;
    },
    group: function (typ = "", title = "", text = "", collapsed = true) {
      if (typ === "") {
        console.groupEnd();
        return;
      }
      collapsed = collapsed ? "groupCollapsed" : "group";
      window.console[collapsed](
        `%c ${title} %c ${text}`,
        this.style.title(typ),
        this.style.body(typ)
      );
    },
  };

  //bir ögenin sayfada olup olmadigini kontrol eder...________
  const checkEl = (e) => {
    return e === null ? false : true;
  };

  //local storage'e key, value degeri olarak js objenin saklanmasi,geri alinmasi ve silinmesi
  const storage = {
    obj: {
      name: null,
      value: null,
      date: null, // new Date(..obj.date) olarak tarihe cevrilerek kullanilmali
      //ör:   new Date(storage.get("gapiLang").date) > new Date()
    },
    set: function (name, value, hour = 5) {
      this.obj.name = `@ri5: ${name}`;
      this.obj.value = value;
      this.addHour(hour);
      //olusturulan nesne local storagee aktarilir
      window.localStorage.setItem(this.obj.name, JSON.stringify(this.obj));
    },
    get: function (name) {
      let localObj = JSON.parse(window.localStorage.getItem(`@ri5: ${name}`));
      if (!localObj) return false;
      if (new Date(localObj.date) > new Date()) return localObj; // key ve tarih gecerli ise geriye obje dönderilir...
      this.remove(name); //tarih güncel olmadiginda lokaldeki obje kaldrilir.
      return false;
    },
    remove: function (name) {
      window.localStorage.removeItem(`@ri5: ${name}`);
    },
    addHour: function (hour) {
      //olusturulan zaman damgasi ile local storagedeki objenin güncelligi kontrol edilir.
      this.obj.date = new Date(
        new Date().setTime(new Date().getTime() + hour * 60 * 60 * 1000) // saat >>
      );
    },
  };
  //uygulama icerisinde yürütülen sürecin olup olmadigini kontrolü ve beklemesi icin
  const byController = {};
  const abfrageObj = {};
  const abfrage = new Proxy(abfrageObj, {
    set: function (target, key, value = "") {
      if (key !== "neu") return; //sadece obje icin "neu" anahtari erisimine izin verilir
      if (value === "cleanObject") {
        for (const k in abfrageObj) delete abfrageObj[k]; //value eger "cleanObject" ise abfrageObj'deki tüm propertyler silinir
        return;
      }
     /* if (abfrageObj.neu === value) return; //degisiklik kontrol edilir
      if (value === "wiederholen") value = abfrageObj.neu  //son kelime grubuyla tekrar islem yapmak sitenilirse...*/
      target[key] = value; //yeni deger isleme alinir....
      appStarter() //yeni kelimeler icin sorgu yapilir...
    },
  });

  //global scope a aktarilir...===============================
  window.byController = byController;
  window.abfrage = abfrage;
  window.runBar = runBar;
  window.checkEl = checkEl;
  window.storage = storage;
  window.msg = msg;
  return true;
} //setValues icinde olmali tüm ögeler....
