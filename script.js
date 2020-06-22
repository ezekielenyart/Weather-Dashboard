// Get Doc ready to start once page is fully loaded
$(document).ready(function() {
  // reference button with id = "search-button" and add an onClick event
  $("#search-button").on("click", function() {
    // after click, assign the value of the search into the variable "searchValue"
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");
// run the search weather function
    searchWeather(searchValue);
  });
  // Reference HTML element with class=history when associated list item is clicked
  $(".history").on("click", "li", function() {
    // after click, run searchWeather function with the text of the list item clicked
    searchWeather($(this).text());
  });
  // place previous searched places inside of the history list
  function makeRow(text) {
    // create variable for new list item with the classes for list group item, add the text passed to makeRow as argument
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // append the list item to the unordered list that has the class history
    $(".history").append(li);
  }
// define the function to search for weather 
  function searchWeather(searchValue) {
    // call the ajax method, passing it the type GET, and a URL with our API key at the end, and searchValue plugged in
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=4e5ba1d148f321e975a3ab4ac38b8ed5&units=imperial",
      dataType: "json",
      
      success: function(data) {
        // create history link for this search only if it doesn't already exist in history.
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          // add the searchValue to the localStorage history if it's not there already
          window.localStorage.setItem("history", JSON.stringify(history));
          // then run makeRow to append searchValue to history list
          makeRow(searchValue);
        }
        
        // clear any old content on hitting the search button
        $("#today").empty();

        // create html content for current weather
        // create an h3 for city name, from data.name, and the date using dat() and tolocaledatestring()
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // Create a new div using a bootstrap card designation to hold all data.
        var card = $("<div>").addClass("card");
        // make a paragraph to hold the wind speed
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // make a <p> to hold humidity
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // make a <p> to hold temperatures
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // make a <div> to hold card-body
        var cardBody = $("<div>").addClass("card-body");
        // make a <img> spot to hold the icon for sunny, cloudy, etc.
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // add the weather icon image to the title card
        title.append(img);
        // add the title, temp, humidity, and wind data to the card body
        cardBody.append(title, temp, humid, wind);
        // add the cardBody div to the card div
        card.append(cardBody);
        // add the card to the today id div
        $("#today").append(card);

        
      // 01d 02d 03d 04d 09d 10d 11d 13d 50d
      // 01n 02n 03n 04n 09n 10n 11n 13n 50n
      // Algorithm
        // If it is day 
        if (data.weather[0].icon.includes("d")) {
          // add a background of fairy
          $(".body").removeClass("night")
          $(".body").addClass("day")
          // console.log("Daytime")
        } else {
          $(".body").removeClass("day");
          $(".body").addClass("night")
        }
        // if it is night
          // add a background of a werewolf

        // call follow-up api endpoints
        getForecast(searchValue);
        // run getUVIndex to run api request for corresponding data
        getUVIndex(data.coord.lat, data.coord.lon);
        // console.log(data.weather[0].icon);

        // console.log(data);
      }
    });
  }
  // define function for getting the forecast for city you search for
  function getForecast(searchValue) {
    // make an api request for the forecast data
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=4e5ba1d148f321e975a3ab4ac38b8ed5&units=imperial",
      dataType: "json",
      // if the request is a success, run the function
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a big old bootstrap card
            var col = $("<div>").addClass("col-md-2");
            // make a variable for the forecast card, a new div with classes to style it
            var card = $("<div>").addClass("card bg-primary text-white");
            // Assign the body variable to create a div and add classes.
            var body = $("<div>").addClass("card-body p-2");
            // assign a variable to the title h5 tag with card-title class, add text from api data of the date
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            // Assign the img variable to create an image icon based off of the weather forcast.
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            // assign the temperature to <p>
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // assign the humidity to <p>
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            
            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
            // console.log(data.list[i].weather[0].icon);
          }
        }
      }
      

    });
  }
  // Function to collect the UV index from our api and alter the button color accordingly.
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=4e5ba1d148f321e975a3ab4ac38b8ed5&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        // declare variables to create HTML elements to hold UV index and button
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
