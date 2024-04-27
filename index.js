/* var sector = [
    { temperatura: 0, humedad: 0, pH: 0, estado_riego: false, estado_sector : false},
    { temperatura: 0, humedad: 0, pH: 0, estado_riego: false, estado_sector : false},
    { temperatura: 0, humedad: 0, pH: 0, estado_riego: false, estado_sector : false},
    { temperatura: 0, humedad: 0, pH: 0, estado_riego: false, estado_sector : false},
    { temperatura: 0, humedad: 0, pH: 0, estado_riego: false, estado_sector : false}
  ];  */

//PATHS
var datos = [];

var path = [];
for(i=0; i<=3; i++){
    path[i] = firebase.database().ref().child("/Sector" + (i+1));; 
}

for(i=0; i<=3; i++){
    path[1].on('value', snap => {
        datos[i] = snap.val();
        
    });
}



