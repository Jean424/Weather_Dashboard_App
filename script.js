//Variable to store the search city
var city="";

//Declare the variable
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");

var sCity=[];

// searche the city to see if it exists in the the storage
function find(city_input){
  for (var i=0; i<sCity.length; i++){
      if(city_input.toUpperCase()===sCity[i]){
          return -1;
      }
  }
  return 1;
}

//Set up the API key
var APIKey="0896f41c8d87eb655dfa9cb07979b208";
// Display the curent and future weather to the city.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
//Create the API call
function currentWeather(city){
  // Use the URL to get the current weather from server side
  var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
  $.ajax({
      url:queryURL,
      method:"GET",
  }).then(function(response){

      // Display the current weather 
      console.log(response);
  
      var weathericon= response.weather[0].icon;
      var iconURL="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";

      var date=new Date(response.dt*1000).toLocaleDateString();
    
      $(currentCity).html(response.name +"("+date+")" + "<img src="+icoURL+">");

      var tempF = (response.main.temp - 273.15) * 1.80 + 32;
      $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
      // Display the Humidity
      $(currentHumidty).html(response.main.humidity+"%");
      //Display Wind speed and convert to MPH
      var ws=response.wind.speed;
      var windsmph=(ws*2.237).toFixed(1);
      $(currentWSpeed).html(windsmph+"MPH");
      // Display UVIndex.
      UVIndex(response.coord.lon,response.coord.lat);
      forecast(response.id);
      if(response.cod==200){
        searchCity=JSON.parse(localStorage.getItem("cityname"));
          console.log(searchCity);
          if (searchCity==null){
            searchCity=[];
            searchCity.push(city.toUpperCase()
              );
              localStorage.setItem("cityname",JSON.stringify(searchCity));
              addToList(city);
          }
          else {
              if(find(city)>0){
                searchCity.push(city.toUpperCase());
                  localStorage.setItem("cityname",JSON.stringify(searchCity));
                  addToList(city);
              }
          }
      }

  });
}

//UVIindex
function UVIndex(lat,lon){
  //The url for uvindex.
  var uvURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lat+"&lon="+lon;
  $.ajax({
          url:uvURL,
          method:"GET"
          }).then(function(response){
              $(currentUvindex).html(response.value);
          });
}

// Display the 5 days forecast for the current city.
function forecast(cityID){
  var dayover= false;
  var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityID+"&appid="+APIKey;
  $.ajax({
      url:queryforcastURL,
      method:"GET"
  }).then(function(response){
      
      for (i=0;i<5;i++){
          var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
          var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
          var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
          var tempK= response.list[((i+1)*8)-1].main.temp;
          var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
          var humidity= response.list[((i+1)*8)-1].main.humidity;
      
          $("#fDate"+i).html(date);
          $("#fImg"+i).html("<img src="+iconurl+">");
          $("#fTemp"+i).html(tempF+"&#8457");
          $("#fHumidity"+i).html(humidity+"%");
      }
      
  });
}

//Add the passed city on the search history
function addToList(city){
  var listEl= $("<li>"+city.toUpperCase()+"</li>");
  $(listEl).attr("class","list-group-item");
  $(listEl).attr("data-value",city.toUpperCase());
  $(".list-group").append(listEl);
}

//Display the past when the list group item is clicked again
function invokePastSearch(event){
  var liEl=event.target;
  if (event.target.matches("li")){
      city=liEl.textContent.trim();
      currentWeather(city);
  }

}


function loadlastCity(){
  $("ul").empty();
  var searchCity = JSON.parse(localStorage.getItem("cityname"));
  if(searchCity!==null){
    searchCity=JSON.parse(localStorage.getItem("cityname"));
      for(i=0; i<searchCity.length;i++){
          addToList(searchCity[i]);
      }
      city=searchCity[i-1];
      currentWeather(city);
  }

}

//Clear search history
function clearHistory(event){
  event.preventDefault();
  searchCity=[];
  localStorage.removeItem("cityname");
  document.location.reload();

}

//Click listener
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);