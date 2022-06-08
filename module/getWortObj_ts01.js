//Bu modül 'HTMLdocs' dizininde tutulan kelimelere ait HTML/document verilerinden obje olusturulup icerik atanir...

/*-------- Disariya Cikarilan Ögeler ---------*/
export { getWortObject };

/*-------- Modul icerigindeki Ögeler ---------*/

let index,
  len;
//HTMLdocs ögesinden ilgili kelime icin wort classindan wortObj olusturulur ve wortObjsArr dizinine eklenir.
const setDoc = async (callback) => {
  await callback(HTMLdocs[index]).then((obj) => {
    index++;
    if(byController.notFound===true){
      delete byController.notFound; //kelime sayfasi bulunamadi ise wortObjsArr dizinine eklenmez.
    }else{
      wortObjsArr.push(obj);
    }
    docs(callback);
  });
};
//HTMLdocs dizinindeki tüm ögeler icin setDoc ile islem yapilir
const docs = async (callback) => {
  if (index>=len){
    callNext() //byController.worts = true; //item.search() ile bu asamnin tamamlandigini teyit icin controlObj'de worts propertysi olusturulur...
    return true
  }else{
    setDoc(callback);
  } 
};

const getWortObject = async (callback) => {
  const wortObjsArr = [];
  window.wortObjsArr = wortObjsArr;
  wortObjsArr.length=0
  len = HTMLdocs.length;
  index=0;
  setDoc(callback);
};
