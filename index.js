const container = document.querySelector('#sector1'); 
 // PATHS
 var datos = []; // almacena los datos extraidos de firebase
 var sector = []; // almacena en una estructura los datos que se extrajo de datos
 var path = []; // almacena el path del sector para extraer los datos de firebase
 var Sectoresmax = null; // almacena la cantidad de sectores que tiene firebase
 // path de sectores activos
 var Sectores_activos = firebase.database().ref().child("/Sectores_Activos");


/*  var id_Sector = [];
 var id_huumedad = [];
 var id_temperatura = [];
 var id_pH = [];
 var id_estado_riego = []; */

//EXTRAE
Sectores_activos.on('value', snap => {
   Sectoresmax = snap.val();
   crearSectores(Sectoresmax);
   cargar_id();
   actualizar().then(() => {
    console.log("Datos cargados:", sector);
    imprimirSectores();
    actualizar_datos();
   });
   
})

function actualizar_datos() {
  for (var k = 0; k < Sectoresmax; k++) {
    path[k].on('value', (snap) => {
      actualizar().then(() => {
        cargar_datos();
      });
    });
  }
}

function cargar_datos() {
  for (var i = 0; i < Sectoresmax; i++) {
    var id_humedad = document.querySelector("#humedad" + (i+1));
    var id_temperatura = document.querySelector("#temperatura" + (i+1));
    var id_pH = document.querySelector("#pH" + (i+1));

    if (id_humedad && id_temperatura && id_pH) {
      id_humedad.innerText = "Humedad: " + sector[i].humedad;
      id_temperatura.innerText = "Temperatura: " + sector[i].temperatura;
      id_pH.innerText = "pH: " + sector[i].pH; 
    } else {
      console.error("No se encontraron elementos con los IDs correspondientes para el sector " + (i+1));
    }
  }
}


// |||||||||||||||||||||  FUNCIONES ||||||||||||||||||||||

// FUNCION PARA CREAR DE MANERA PRECISA LA CANTIDAD DE SECTORES DEPENDIENDO DE CUANTOS HAYAN EN LINEA
function crearSectores(numSectores) {
  for (var i = 0; i < numSectores; i++) {
    var sectorNuevo = [];
    sectorNuevo = { temperatura: 0, humedad: 0, pH: 0, estado_riego: null, estado_sector: null, id_humedad: 0, id_pH: 0, id_temperatura: 0, id_estado_sector: 0, id_estado_riego: 0};
    sector.push(sectorNuevo);
  }
}

function cargar_id (){
  for(var i = 1; i <= Sectoresmax; i++){
    sector[i-1].id_humedad = document.querySelector("humedad" + i);
    sector[i-1].id_temperatura = document.querySelector("temperatura" + i);
    sector[i-1].id_pH = document.querySelector("pH" + i);
    sector[i-1].id_estado_sector= document.querySelector("estado_sector" + i);
    sector[i-1].id_estado_riego = document.querySelector("estado_riego" + i);
  }
}

// FUNCION QUE  MUESTRA EN LA PAGINA LOS SECTORES DEPENDIENDO DE CUANTOS ESTE ACTIVOS
function imprimirSectores() {
  var contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = "";

  for (var i = 1; i <= Sectoresmax; i++) {
    
    var div = document.createElement("div");
    div.className = "tarjeta";
    div.id = "Sector" + i;

    var titulo = document.createElement("h2");
    titulo.textContent = "Sector " + i;
    titulo.className = "N_sector";
    div.appendChild(titulo);

    var dato_humedad = document.createElement("p");
    dato_humedad.id = "humedad" + i;
    div.appendChild(dato_humedad);

    var dato_temperatura = document.createElement("p");
    dato_temperatura.id = "temperatura" + i;
    div.appendChild(dato_temperatura);

    var dato_pH = document.createElement("p");
    dato_pH.id = "pH" + i;
    div.appendChild(dato_pH);

    contenedor.appendChild(div);
  }
}

//EXTRAE LOS DATOS DE LA FIREBASE PARA LUEGO ALMACENAR LOS DATOS PARA MOSTRAR EN LA PAGINA
 function actualizar() {
   return new Promise((resolve, reject) => {
     for (var i = 0; i < Sectoresmax; i++) {
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
