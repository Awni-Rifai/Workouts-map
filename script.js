'use strict';

// prettier-ignore

//Geolocation API and modern one there is more modern features like accessing the user camera and make the user's pone vibrate

class Workout {
  date = new Date();
  //we should use a library to create ids we shouldn't create ids on our own
  id = (Date.now() + '').slice(-10);
  
  
  constructor(coords, distance, duration) {
    //this.date=...
    //this.id=....
    //for es6
    this.coords = coords; //[lat,lang]
    this.distance = distance; //in Kilometers
    this.duration = duration; //Minutes
    
    
    
    
  }
  _setDescription(){
    // prittier-ignore
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${this.date.getDate()} ${months[this.date.getMonth()] }`

  }

  
}
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    //this will initialize the this keyword
    this.cadence = cadence;
    this.type = 'running';

    this.calcPace(); //we call this method if we want it to be returned immedeately
    this._setDescription();
    //it should be here since the type is in this child class
    //it can't be called in new Workout objects since it dosn't have the type
    //this method will get access to the type variable only if it's executed in the constructor of the child element
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    //this will initialize the this keyword
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this.type = 'cycling';
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const workoutContainer = document.querySelector('.workouts');
const logo = document.querySelector('.logo');
const btnReset = document.querySelector('.btn__reset');
const btnSort = document.querySelector('.btn__sort');
let sortForm;
class App {
  #workouts = [];
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #mapZoomChange = 15;
  #sort = false;
  constructor() {
    //we will set the map and mapEvent to private class fields

    //Here we put it inside the constructor to let it execude immedeately;
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    //here the this keyword will be the form elemnt and no longer to app
    this.workouts = [];
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    logo.addEventListener('click', this._returnToPosition.bind(this));
    this.lonData = [];
    this.latData = [];
    //get data from localStorage
    this._getLocalStorage();

    //btnSort.addEventListener('click', this._sortWorkout.bind(this, 'distance'));
    this._renderSortForm();
    sortForm.addEventListener('change', this._sortToggle.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          //here get currentCurrentPosition will subtitute the position in the first function
          alert('Could not get your location');
          //here we are calling loadMap from the function getCurrentPosition and the this keyword will be set
          //to undefined
          //the solution is to bind the "this keyword" to the function loadMap manually
          //bind will return a new function
        }
      );
    }
  }
  _sortToggle() {
    const sortType = sortForm.value;
    if (sortType === '') return;
    this._sortWorkout(sortType);
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    this.latData.push(latitude);
    this.lonData.push(longitude);
    //_______________________________________________________________
    //Leaflet code
    //Third party library called leaflet

    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);
    // here we need an element with an id of map or we can change it

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('Your location')
      .openPopup();
    //now we will add lines of code from the leaflet library
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });

    //___________________________________________________________________________
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _showMarker(lat, lng, type) {
    var myIcon = L.icon({
      iconUrl: 'icon.png',
      iconSize: [45, 60],
      iconAnchor: [22.5, 60],
      popupAnchor: [-3, -76],
      shadowUrl: 'icon.png',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0],
    });
    const time = (new Date() + '').slice(0, 10);
    const mypopup = L.popup({
      autoClose: false,
      closeOnClick: false,
      maxWidth: 400,
      minWidth: 150,
      className: 'running-popup',
    }).setContent(`${type} on ${time}`);

    L.marker([lat, lng], { icon: myIcon })
      .addTo(this.#map)
      .bindPopup(mypopup)

      .openPopup();
    form.reset();
  }
  _renderWorkout(workout, sort = false) {
    //We use data properties to build a bridge between the user interface and the data we have in oor application

    const [lat, lng] = workout.coords;

    let html = `
  <li class="workout workout--${workout.type}" data-id="${workout.id}">
  <h2 class="workout__title">${workout.description}</h2>
  <div class="workout__details">
    <span class="workout__icon">${
      workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
    }</span>
    <span class="workout__value">${workout.distance}</span>
    <span class="workout__unit">km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${workout.duration}</span>
    <span class="workout__unit">min</span>
  </div>
  
  `;
    if (workout.type === 'running') {
      const runningHTML = `<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.pace.toFixed(1)}</span>
  <span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">🦶🏼</span>
  <span class="workout__value">${workout.cadence}</span>
  <span class="workout__unit">spm</span>
</div>
</li>`;
      html = html + runningHTML;
      const t = 'Running';
      this._showMarker(lat, lng, t);
    }
    if (workout.type === 'cycling') {
      const cyclingHtml = `
 
  <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>
  `;
      html = html + cyclingHtml;
      const t = 'Cycling';
      this._showMarker(lat, lng, t);
    }
    this._renderSortForm();
    workoutContainer.insertAdjacentHTML('beforeend', html);
    form.classList.add('hidden');
    btnReset.classList.remove('form__row--hidden');
  }
  _renderSortForm() {
    if (!this.#workouts) return;
    if (!form.classList.contains('hidden')) return;
    if (this.#sort) return;

    const html = `<div class="form__sort">
    <label class="form__label">Sort</label>
    <select class="form__sort form__sort--type">
      <option value="">--Please choose an option--</option>
      <option value="distance">Distance</option>
      <option value="duration">Time</option>
    </select>
  </div>`;
    btnReset.parentElement.insertAdjacentHTML('afterbegin', html);
    this.#sort = true;
    sortForm = document.querySelector('.form__sort--type');
  }

  _newWorkout(e) {
    e.preventDefault();
    //Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    //+ to conver it to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let check = 1;
    const validateNumber = val => {
      if (!Number.isFinite(val) || val === 0) check = 0;
    };
    const positiveNumber = val => {
      if (val < 0) check = 0;
    };

    //check if data is valid

    //if activity is running create a running object and for cycling the same
    let workout;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      validateNumber(duration);
      validateNumber(distance);
      validateNumber(cadence);
      positiveNumber(duration);
      positiveNumber(distance);
      positiveNumber(cadence);

      if (!check) return alert('Please enter a valid Number');
      workout = new Running([lat, lng], distance, duration, cadence);

      this.#workouts.push(workout);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      validateNumber(duration);
      validateNumber(distance);
      validateNumber(elevation);
      positiveNumber(duration);
      positiveNumber(distance);
      positiveNumber(elevation);
      if (!check) return alert('Please enter a valid Number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);

      //Add new object to workout array

      //render the workout as a marker
      //render the workout as a list

      //set the local storage
    }

    this._renderWorkout(workout);
    this._setLocalStorage();
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomChange, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  //! add a feature to return to normal zoom
  _returnToPosition() {
    this.#map.setView([this.latData[0], this.lonData[0]], this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
    //using the public interface
  }
  _setLocalStorage() {
    //json.stringfy converts any object in javascript to string
    //local storage is simple API
    //local storage is blocking
    //it will slow down you application
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    //Store the data in our workout array
    this.#workouts = data;
  }
  reset() {
    localStorage.removeItem('workouts');

    location.reload();
  }
  _sortWorkout(porperty) {
    //put all distances in new array
    let distances = [];
    if (!this.#workouts) return;
    if (!localStorage.getItem('workouts') === true) return;
    this.#workouts.slice().forEach(workout => {
      distances.push(workout[porperty]);
    });

    //use this.#workouts.find to find each workout for each distance
    //if there is a repetition in the distance we should find a solution
    let sortedWorkouts = [];
    distances = [...new Set(distances)];
    distances.sort((a, b) => a - b);

    for (let i = 0; i < distances.length; i++) {
      sortedWorkouts.push(
        this.#workouts.filter(workout => workout[porperty] === distances[i])
      );
    }
    sortedWorkouts = sortedWorkouts.flat(2);
    //remove the items visually
    const el = document.querySelectorAll('div li');
    const par = document.querySelector('div li').parentNode;
    el.forEach(el => par.removeChild(el));

    //______________________________________________________
    sortedWorkouts.forEach(workout => this._renderWorkout(workout));
  }
}

//hide the form and clear the inputs
//display marker

const app = new App();

//! project Architecture
btnReset.addEventListener('click', app.reset.bind(this));
if (!localStorage.getItem('workouts') === true)
  btnReset.classList.add('form__row--hidden');
