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
    add: function (msgTyp, title, text, add = false) {
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
      this.group(0, "Sorgu Sonucu", "Isleme dair aciklamalar:", false);
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
    get: function (name,base=false) {
      /*sadece "name" girisi: varsa objedeki value keyinde tutulan deger dönderilir, yoksa false
        "name" ve "base:[true]/[anyKey]" girisi: true: objenin kendisini, [anyKey] varsa ilgilialt key value ciftini döner.
        */
      let localObj = JSON.parse(window.localStorage.getItem(`@ri5: ${name}`));
      if (!localObj || (!!base && base != true && !localObj[base])) return false;
      if(name == 'neuWorte' || name == 'allAlteWorte') return base?localObj:localObj.value;
      if (new Date(localObj.date) > new Date()) return !!base & base !=true?localObj[base]:!!base?localObj:localObj.value; // key ve tarih gecerli ise geriye obje veya degeri dönderilir...
      this.remove(name); //tarih güncel olmadiginda lokaldeki obje kaldrilir.
      return false;
    },
    remove: function (name,key=null) {
      if(!key){window.localStorage.removeItem(`@ri5: ${name}`);return}
      let clone =  this.get(name,true);
      if(!clone) return
      window.localStorage.removeItem(`@ri5: ${name}`)
      delete clone[key];
      window.localStorage.setItem(`@ri5: ${name}`, JSON.stringify(clone));
    },
    addHour: function (hour) {
      //olusturulan zaman damgasi ile local storagedeki objenin güncelligi kontrol edilir.
      this.obj.date = new Date(
        new Date().setTime(new Date().getTime() + hour * 60 * 60 * 1000) // saat >>
      );
    },
    newKey:function(name,nKey,nVal=false,childKey=false){
      let clone =  this.get(name,true)
      if(!clone) return false//aranilan obje lokalde yoksa islemden cikilir
      if(!!childKey){//key altinda yeni child key olusturur
        if(!clone[childKey]) clone[childKey]={}
            clone[childKey][nKey]=nVal;
      }else{
         clone[nKey]=nVal; //dorudan key olusturur
      }
      window.localStorage.setItem(`@ri5: ${name}`, JSON.stringify(clone));
      return true;
    }
  };
  //uygulama icerisinde yürütülen sürecin olup olmadigini kontrolü ve beklemesi icin
  const abfrageObj = {};
  const abfrage = new Proxy(abfrageObj, {
    set: function (target, key, value = "") {
      if (key !== "neu") return; //sadece obje icin "neu" anahtari erisimine izin verilir
      if (value === "cleanObject") {
        for (const k in abfrageObj) delete abfrageObj[k]; //value eger "cleanObject" ise abfrageObj'deki tüm propertyler silinir
        return true;
      }
     /* if (abfrageObj.neu === value) return; //degisiklik kontrol edilir*/
      target[key] = value; //yeni deger isleme alinir....
      appStarter() //yeni kelimeler icin sorgu yapilir...
    },
  });

  // bir durumu kontrol etmek icin...
  const app_pano = {
    container:{},
    set:function(key,value=true){//yeni key atar.
        if(!this.check(key)) this.container[key]=value
    },
    get:function(key){//key varsa value atanmis ise value yoksa da true döner ve listeden cikarir.
        let result = !!this.container[key]?this.container[key]:this.check(key)
        delete this.container[key]
        return result
    },
    check:function(key){//key varsa true döner ve listede de tutulur.
      return !!this.container[key]?true:false
    }
}

  //global scope a aktarilir...===============================
  window.app_pano = app_pano;
  window.abfrage = abfrage;
  window.runBar = runBar;
  window.checkEl = checkEl;
  window.storage = storage;
  window.msg = msg;
  return true;
} //setValues icinde olmali tüm ögeler....
