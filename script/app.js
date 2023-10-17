// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
let updateSun = (uptimePercentage) => {
  const domSun = document.querySelector('.js-sun');
  domSun.style.left = `${uptimePercentage}%`;
  if (uptimePercentage <= 50) {
    domSun.style.bottom = `${uptimePercentage * 2}%`;
  } else {
    domSun.style.bottom = `${100 - uptimePercentage}%`;
  }
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const domSun = document.querySelector('.js-sun');
  const domTimeLeft = document.querySelector('.js-time-left');
  // Bepaal het aantal minuten dat de zon al op is.
  const currentDate = new Date();
  const sunUpTime = (currentDate.getTime() / 1000 - sunrise) / 60;
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  domSun.dataset.time = _parseMillisecondsIntoReadableTime(currentDate.getTime() / 1000);
  let uptimePercentage = (sunUpTime / totalMinutes) * 100;
  const domHtml = document.documentElement;
  domHtml.classList.add('is-day');
  domHtml.classList.remove('is-night');
  if (uptimePercentage > 100) {
    uptimePercentage = 100;
    domHtml.classList.remove('is-day');
    domHtml.classList.add('is-night');
  } else if (uptimePercentage < 0) {
    uptimePercentage = 0;
    domHtml.classList.remove('is-day');
    domHtml.classList.add('is-night');
  }
  updateSun(uptimePercentage);
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  const domBody = document.body;
  domBody.classList.add('is-loaded');
  // Vergeet niet om het resterende aantal minuten in te vullen.
  const minutesLeft = (totalMinutes / 100) * (100 - uptimePercentage);
  if (minutesLeft >= 60) {
    var hours = Math.floor(minutesLeft / 60);
    var remainingMinutes = Math.round(minutesLeft % 60);
    domTimeLeft.innerHTML = `${hours}h and ${remainingMinutes} minutes`;
  } else {
    domTimeLeft.innerHTML = `${Math.round(minutesLeft)} minutes`;
  }
  // Nu maken we een functie die de zon elke minuut zal updaten
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  const domLocation = document.querySelector('.js-location');
  const location = queryResponse.city.name;
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const country = queryResponse.city.country;
  domLocation.innerHTML = `${location}, ${regionNames.of(country)}`;
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  const domSunrise = document.querySelector('.js-sunrise');
  const domSunset = document.querySelector('.js-sunset');
  const sunrise = queryResponse.city.sunrise;
  const sunset = queryResponse.city.sunset;
  domSunrise.innerHTML = _parseMillisecondsIntoReadableTime(sunrise);
  domSunset.innerHTML = _parseMillisecondsIntoReadableTime(sunset);
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  placeSunAndStartMoving((sunset - sunrise) / 60, sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  // Met de fetch API proberen we de data op te halen.
  // Als dat gelukt is, gaan we naar onze showResult functie.
  const weatherInfo = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=7b69857435d86ea17d25bc858d99b9dc&units=metric&lang=nl&cnt=1`).then((response) => response.json());
  // console.log(weatherInfo);
  showResult(weatherInfo);
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.26493);
});
