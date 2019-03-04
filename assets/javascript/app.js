
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

    var trainName = $("#train-name").val().trim();
    var trainDest = $("#train-destination").val().trim();
    var firstTrainTime = $("#train-time").val().trim();
    var trainFrequency = $("#train-frequency").val().trim();


    // create a moment object from the user input
    var timeFormat = "HH:mm";
    var firstTrainTimeObj;
    //HLS if this causes an error can we allow the user to know there is a problem
      firstTrainTimeObj = moment(firstTrainTime, timeFormat);
      console.log("The first train is " + firstTrainTimeObj);
      
      // Convert the time object to Unix time before storing in the database
      var firstTrainTimeUnix = firstTrainTimeObj.format("X");
      console.log("The unix time is " + firstTrainTimeUnix);
  
      var trainObj = {
          name: trainName,
          destination: trainDest,
          startTime: firstTrainTimeUnix,
          frequency: trainFrequency
      };
  
      console.log(trainObj);
      // Code for the push
      database.ref().push(trainObj);  
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

  