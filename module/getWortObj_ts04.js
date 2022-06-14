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
    //bulunamayan veya ayni olan kelime ise bu kelime dizine eklenmez
    if(!app_pano.get("notFound") && !app_pano.get("ahnelnWort")) wortObjsArr.push(obj); 
    docs(callback);
  });
};
//HTMLdocs dizinindeki tüm ögeler icin setDoc ile islem yapilir
const docs = async (callback) => {
  if (index>=len){
    callNext() 
    return true
  }else{
    setDoc(callback);
  } 
};

const getWortObject = async (callback) => {
  const wortObjsArr = [];
  window.wortObjsArr = wortObjsArr;

  console.log('doc icin isleme alinan kelime lstesi', wortObjsArr)

  wortObjsArr.length=0
  len = HTMLdocs.length;
  index=0;
  setDoc(callback);
};
