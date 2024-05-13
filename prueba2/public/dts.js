const APY_KEY = `be39e66936f97a3c638ebd63508f47ca`;



const fechdata = position => {

    const { latitude, longitude } = position.coords ;
    fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${APY_KEY}`)
        .then( response => response.json()) 
        .then( data => setWeatherData(data))


  
  }

  const setWeatherData = data => {
    console.log(data);
    const wweatherdata = {
        location: data.name,
        description: data.weather[0].main,
        humedity: data.main.humidity,
        pressure: data.main.pressure,
        temperature: data.main.temp,
        date: `date`,
    }
    Object.keys(wweatherdata).forEach(key => {
        document.getElementById(key).textContent = wweatherdata[key];
    });
  }


  
  const onLoad = () =>{
    navigator.geolocation.getCurrentPosition(fechdata);
  }
  
  