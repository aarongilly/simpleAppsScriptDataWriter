/*
# About 
This Code is meant to be published as a Google Apps Script WebApp.
There are a few things you'd need to change to make it yours. See the XXXXXX's in the code.

# To Use
1. Update the code to replaces the XXXXXX's with your stuff. 
2. Save
3. Click Publish > Deploy as web app...
3a. Give it a new version number.
3b. CHANGE "Who has access to the app:" TO "Everyone, even anonymous. (Note: This is means anyone with your webapp address could write files to your folder!)
3c. Click "Okay" or "Publish" or "Update" or whatever it says.
4. Copy the URL of the web app.
5. Use Siri Shortcuts to send POST Messages, including JSON in the body (or use FILE and pass in a Dictionary to that file)
6. Use any other means to post GET requests to the URL, literally just navagiating to your URL with specified paramters works.

## How to Specify GET Parameters:
Put a ? after the url, 
then put "parameterKey=parameterValue"
You can add multiple parameters by concatenating them with an Ampersand between them
THey have to be valid URLs. So, if you need spaces or other special characters, see see https://www.urlencoder.org/ for how to do it.

Example:
https://script.google.com/macros/s/XXXXXYOURWEBAPPIDHEREXXXXXXX/exec?measure=test&headerA=some+value&headerB=another+value

expects POST Content as JSON, like:
{
  measure: "measureName", //must be included, defines name of Google Sheet to write to
  timestamp: "date time text", //for POST, I chose to supply the timestamp in the data itself
  "header one": "Whatever data you want to write to this header",
  "header two": "You can have as many headers as you like.
  "fancy header": {
    "objectKey":"objects are printed as JSON strings"
  }
 }
*/

function doPost(e) {
  let payload = JSON.parse(e.postData.contents);
  if(!payload.hasOwnProperty("measure")){
    return ContentService.createTextOutput("No 'measure' parameter. :-(");
  }
  let keys = Object.keys(payload);
  let measureName = payload.measure;
  keys = keys.filter((item)=>item!="measure"); //remove measure from keys so it's not written to the sheet
  let trackingFolder = DriveApp.getFolderById(XXXXXYOURFOLDERIDHEREXXXXXXX); //replace with your folder ID 
  let measureList = trackingFolder.getFilesByName(measureName);
  let sheet;
  if(measureList.hasNext()) {
    sheet = SpreadsheetApp.open(measureList.next());
  }else{
    //need to create new file in folder
    sheet = SpreadsheetApp.create(measureName);
    trackingFolder.addFile(DriveApp.getFileById(sheet.getId()));
    //create headers based on keys of payload.value
    sheet.appendRow(keys);
  }
  let newRowContents = keys.map(thisKey => 
    typeof payload[thisKey] == "object" ? JSON.stringify(payload[thisKey]) : payload[thisKey]
  );
  //this line is equivalent to sheet.appendRow(newRowContents) - but puts them after the header row
  sheet.insertRowBefore(2).getRange(2,1,1,newRowContents.length).setValues([newRowContents]); //is a 2d array
return ContentService.createTextOutput("Recorded " + measureName + " :-)\n"+JSON.stringify(newRowContents));
}

/*
doGet is essentially the same as doPost, but for Get Requests.
I wrote it to NOT expect a timestamp to be supplied with the data, it supplies its own.
use it by navigating to:
https://script.google.com/macros/s/yourwebappidstringhere/exec?measure=measurename&paramOne=whateverone&paramtwo=whatevertwo
Note the limitations of text strings in URLs. Look up "URL Encoding Functions" for help. Or see https://www.urlencoder.org/
*/

function doGet(e) {
  if(!e.parameter.hasOwnProperty("measure")){
    return ContentService.createTextOutput("No 'measure' parameter. :-(");
  }
  let payload = e.parameter;
  let keys = Object.keys(payload);
  let measureName = payload.measure;
  keys = keys.filter((item)=>item!="measure"); //remove measure from keys so it's not written to the sheet
  let trackingFolder = DriveApp.getFolderById(XXXXXYOURFOLDERIDHEREXXXXXXX); //REPLACE WITH YOUR FOLDER ID
  let measureList = trackingFolder.getFilesByName(measureName);
  let sheet;
  if(measureList.hasNext()) {
    sheet = SpreadsheetApp.open(measureList.next());
  }else{
    //need to create new file in folder
    sheet = SpreadsheetApp.create(measureName);
    trackingFolder.addFile(DriveApp.getFileById(sheet.getId()));
    //create headers based on keys of payload.value
    sheet.appendRow(["timestamp", ...keys]);
  }
  let newRowContents = keys.map(thisKey => payload[thisKey]); //cannot embed objects, so no need to check type
  newRowContents.unshift(Utilities.formatDate(new Date(), "GMT-5", "MM/dd/yy hh:mma")); //add timestamp to front
  //this line is equivalent to sheet.appendRow(newRowContents) - but puts them after the header row
  sheet.insertRowBefore(2).getRange(2,1,1,newRowContents.length).setValues([newRowContents]); 
  return ContentService.createTextOutput("Recorded " + measureName + " :-)\n"+JSON.stringify(newRowContents));
}

//may consider writing all JSON to some sort of file like this:
/*
function createOrAppendFile() {
  var fileName="myfile";
  var folderName="myfolder";

  var content = "this is text data to be written in text file";

  // get list of folders with matching name
  var folderList = DriveApp.getFoldersByName(folderName);  
  if (folderList.hasNext()) {
    // found matching folder
    var folder = folderList.next();

    // search for files with matching name
    var fileList = folder.getFilesByName(fileName);

    if (fileList.hasNext()) {
      // found matching file - append text
      var file = fileList.next();
      var combinedContent = file.getBlob().getDataAsString() + content;
      file.setContent(combinedContent);
    }
    else {
      // file not found - create new
      folder.createFile(fileName, content);
    }
  }
}
*/
