
// Initialize Firebase
var config = {
  apiKey: "AIzaSyCJH0SpSkPdoccLsQluE_yaD8FzzIPR0wI",
  authDomain: "train-schedule-90753.firebaseapp.com",
  databaseURL: "https://train-schedule-90753.firebaseio.com",
  projectId: "train-schedule-90753",
  storageBucket: "train-schedule-90753.appspot.com",
  messagingSenderId: "794891762329"
};
firebase.initializeApp(config);

var database = firebase.database();

// CLICK HANDLERS
// ==========================================================

// .on("click") function associated with the Add Train Button
$("#add-train").on("click", function(event) {
  event.preventDefault();

  // make sure the error messages disappear
  $("#errorMsg").empty();

  // Collect the data
  var trainName = $("#train-name").val().trim();
  var trainDest = $("#train-destination").val().trim();
  var firstTrainTime = $("#train-time").val().trim();
  var trainFrequency = $("#train-frequency").val().trim();

  var trainObj = {
    name: trainName,
    destination: trainDest,
    startTime: firstTrainTime,
    frequency: trainFrequency
  };

  console.log("Before CHECK" + trainName);
  console.log("Before CHECK" + trainDest);
  console.log("Before CHECK" + firstTrainTime);
  console.log("Before CHECK" + trainFrequency);


  // check if user inputs are good
  var isGood = checkInput(trainObj);
  console.log("ALL IS GOOD " + isGood);

  if (isGood)
  {
      // create a moment object from the user input
      var timeFormat = "HH:mm";
      var firstTrainTimeObj;
      //HLS if this causes an error can we allow the user to know there is a problem
      console.log("After CHECK" + firstTrainTime);


      // if pass in a true here will balk at 3:00 needs to be 03:00
      //firstTrainTimeObj = moment(firstTrainTime, timeFormat, true);
      firstTrainTimeObj = moment(firstTrainTime, timeFormat);
      console.log("The first train is " + firstTrainTimeObj);
      // Convert the time object to Unix time before storing in the database
      var firstTrainTimeUnix = firstTrainTimeObj.format("X");
      console.log("The unix time is " + firstTrainTimeUnix);

      // set the unix time to the train Object's startTime to store in database
      trainObj.startTime = firstTrainTimeUnix;
      console.log(trainObj);
      
      // Code for the push
      database.ref().push(trainObj);  

      // clear the form for next time
      $("#train-name").val("");
      $("#train-destination").val("");
      $("#train-time").val("");
      $("#train-frequency").val("");
  }

});

// Firebase watcher + initial loader
database.ref().on("child_added", function(childSnapshot) {

    // Get the frquency in minutes as entered in database
    var trainFrequency = childSnapshot.val().frequency;

    // Get the start time of the train in UNIX value
    var startTrainTime = childSnapshot.val().startTime;

    // create a moment object from the unix time
    var convertedStartTime = moment.unix(startTrainTime);

    // get current time 
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Determine the number of minutes between the startrainTime and now
    var diffTime = currentTime.diff(moment(convertedStartTime), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);
    
    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;
    console.log("the minutes to next train are " + tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = trainFrequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = currentTime.add(tMinutesTillTrain, "minutes");
    var nextTrainFormatted = moment(nextTrain).format("hh:mm");
    console.log("ARRIVAL TIME: " + nextTrainFormatted);

    // Log everything else that's coming out of snapshot
    console.log(childSnapshot.val().name);
    console.log(childSnapshot.val().destination);

    var scheduleBody = $("#schedule-list");
    var scheduleRow = $("<tr>");
    var nameCol = $("<td>").text(childSnapshot.val().name);
    scheduleRow.append(nameCol);
    var destCol = $("<td>").text(childSnapshot.val().destination);
    scheduleRow.append(destCol);
    var freqCol = $("<td>").text(trainFrequency);
    scheduleRow.append(freqCol);
    var timeCol = $("<td>").text(nextTrainFormatted);
    scheduleRow.append(timeCol);
    var timeCol = $("<td>").text(tMinutesTillTrain);
    scheduleRow.append(timeCol);
    scheduleBody.append(scheduleRow);

    // Handle the errors
    }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// this function validates the user inputs and returns true if eveything looks good
function checkInput(trainObjChk){
  var looksGood = true;
  console.log("CHECK train obj[" + trainObjChk + "]");
  console.log("CHECK train name[" + trainObjChk.name + "]");
  console.log("CHECK train destination[" + trainObjChk.destination + "]");
  console.log("CHECK train frequency[" + trainObjChk.frequency + "]");  
  console.log("CHECK train startTIme[" + trainObjChk.startTime + "]");  

  //console.log('IS IT A DATE?[' + moment(trainObjChk.startTime).isValid() + "]" );
  var date = trainObjChk.startTime;
 // check that the name is not an empty string
  if (( trainObjChk.name === "") || ( trainObjChk.name === undefined)){
    $("#errorMsg").text("Please enter a Train Name.")
    return false;
  } // Check that the destination is not an empty string
  else if (( trainObjChk.destination === "") || ( trainObjChk.destination === undefined) ){
    $("#errorMsg").text("Please enter a Train Destination.")
    return false;
  } // Check that format is HH:mm (it is posible to have hour of 24, 25, 26 ,27 ,28, 29)
  else if (! date.match(/^[0-2]{0,1}[0-9]{1}:[0-5]{1}[0-9]{1}$/)) {
  //else if (! date.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/) ) {
    $("#errorMsg").text("Please check your format for the First Train Time.")
    return false;
  } // check that the hour is not bigger than 23
  else if (date.split(":")[0]>23){
    $("#errorMsg").text("Please check your hour format (0-23) for the First Train Time.")
    return false;
  } // check that frequency is not an empty string
  else if (( trainObjChk.frequency === "") ||  ( trainObjChk.frequency === undefined) ){
    $("#errorMsg").text("Please enter a Train Frequency.")
    return false;
  } // check that requency is a number
  else if (! $.isNumeric( trainObjChk.frequency ) ){
    $("#errorMsg").text("Please enter a number for Train Frequency (in minutes).")
    return false;
  }
  return looksGood;
};
  
// Update screen information.  Report new Minutes until next train and next train
// every minute. This is a screen refresh and it isn't pretty.
// var intervalId = setInterval(updateTimes, 60*1000);

// // this function updates the information on the screen every minute
// function updateTimes() {
//   location.reload();
// }

