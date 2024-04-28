const container = document.querySelector('#sector');
 
 var sector = [
   { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null },
   { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null },
   { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null },
   { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null },
   { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null }
 ];
 
 // PATHS
 var datos = [];
 var path = [];
 var Sectoresmax = null;
 
 var SA = firebase.database().ref().child("/Sectores_Activos");
 
 SA.on('value', snap => {
   Sectoresmax = snap.val();
   console.log(Sectoresmax);
   actualizar().then(() => {
    console.log("Datos cargados:", sector);
    container.innerText = sector[1].temperatura;
   });
 })
 
 function actualizar() {
   return new Promise((resolve, reject) => {
     for (i = 0; i < Sectoresmax; i++) {
       path[i] = firebase.database().ref().child("/Sector" + (i + 1));
     }
 
     let promises = [];
 
     for (let j = 0; j < Sectoresmax; j++) {
       promises.push(new Promise((resolve, reject) => {
         path[j].on('value', snap => {
           datos[j] = snap.val();
           sector[j].estado_sector = datos[j][0];
           sector[j].temperatura = datos[j][1];
           sector[j].humedad = datos[j][2];
           sector[j].pH = datos[j][3];
           sector[j].estado_riego = datos[j][4];
           resolve();
         });
       }));
     }
 
     Promise.all(promises).then(() => {
       resolve();
     });
   });
 }