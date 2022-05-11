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
function find(c){
  for (var i=0; i<sCity.length; i++){
      if(c.toUpperCase()===sCity[i]){
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
    if(searchCity.val().trim() !==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
//Create the API call
function currentWeather(city){
  // Use the URL to get the current weather from server side
  var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
  $.ajax({
      url:queryURL,
      method:"GET",
  }).then(function(response){

      // Display the current weather 
      console.log(response);
  
      var weathericon= response.weather[0].icon;
      var iconURL="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";

      var date=new Date(response.dt*1000).toLocaleDateString();
    
      $(currentCity).html(response.name +"("+date+")" + "<img src="+iconURL+">");

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
        sCity=JSON.parse(localStorage.getItem("cityname"));
          console.log(sCity);
          if (sCity==null){
            sCity=[];
            sCity.push(city.toUpperCase()
              );
              localStorage.setItem("cityname",JSON.stringify(sCity));
              addToList(sCity);
          }
          else {
              if(find(city)>0){
                sCity.push(city.toUpperCase());
                  localStorage.setItem("cityname",JSON.stringify(sCity));
                  addToList(city);
              }
          }
      }

  });
}

//UVIindex
function UVIndex(ln,lt){
  //The url for uvindex.
  var uvURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
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
function addToList(c){
  var listEl= $("<li>"+c.toUpperCase()+"</li>");
  $(listEl).attr("class","list-group-item");
  $(listEl).attr("data-value",c.toUpperCase());
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
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if(sCity!==null){
    sCity=JSON.parse(localStorage.getItem("cityname"));
      for(i=0; i<sCity.length;i++){
          addToList(sCity[i]);
      }
      city=sCity[i-1];
      currentWeather(city);
  }

}

//Clear search history
function clearHistory(event){
  event.preventDefault();
  sCity=[];
  localStorage.removeItem("cityname");
  document.location.reload();

}

//Click listener
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);