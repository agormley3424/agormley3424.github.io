const xhr = new XMLHttpRequest();
let keyword = null;
let distance = null;
let category = "default";
let location1 = null;
let locationSearch = true;
let numRows = 0;
let responseObject;
let currentEventID = null;
let eventSortEarliest = true;
let genreSortEarliest = true;
let venueSortEarliest = true;

function handleTable() {

  //console.log("Execute onreadystatechange");

  if (xhr.readyState === 4)
  {
    responseObject = JSON.parse(xhr.responseText);
    //console.log("table has been handled");
    console.log(responseObject);

    const jsonTable = parseTable(responseObject);

    console.log("Table in handleTable:\n" + jsonTable);

    for (let i = 0; i < jsonTable.length; i++)
    {
      addRow(jsonTable[i]);
    }
  }
}

function handleIPRequest()
{
  let responseIP;

  //console.log("Execute onreadystatechange");

  if (xhr.readyState === 4)
  {
    responseIP = JSON.parse(xhr.responseText);
    location1 = responseIP["loc"];
    console.log(location1);
  }
}

function setKeyword()
{
  keyword = document.getElementById("keywordBox").value;
  //console.log(keyword);
}

function setDistance()
{
  distance = document.getElementById("distanceBox").value;

  if (isNaN(distance))
  {
    if (distance.length - 2 >= 0)
    {
      distance = distance.slice(0, distance.length - 1);
    }
    else
    {
      distance = "";
    }
    
    //distBox.value = "";
  }

  document.getElementById("distanceBox").value = distance;


  //console.log(distance);
}

function setCategory()
{
  category = document.getElementById("categoryBox").value;
  //console.log(category);
}

// 1600 Amphitheatre Parkway, Mountain View, CA
function setLocation()
{
  location1 = document.getElementById("locationBox").value;
  //console.log(location1);
}

function stringToAddress(string)
{
  let returnAddress = "";

  for (let i = 0; i < string.length; i++){
    if (string[i] === ' '){
      returnAddress += '+';
    }
    else
    {
      returnAddress += string[i];
    }
  }

  return returnAddress;
}

function stringToAddressMap(string)
{
  let returnAddress = "";

  for (let i = 0; i < string.length; i++){
    if (string[i] === ' '){
      returnAddress += '+';
    }
    else if (string[i] === ',')
    {
      returnAddress += '%2C';
    }
    else
    {
      returnAddress += string[i];
    }
  }

  return returnAddress;
}

function submitForm()
{
  // if (keyword === null || keyword === undefined || keyword === "" || location1 === null || location1 === undefined || location1 === "")
  // {
  //   return;
  // }

  hideTable();
  document.getElementById("mainBody").hidden = true;
  hideDetail();
  clearTable();

  if (!document.getElementById("keywordBox").checkValidity())
  {
    document.getElementById("keywordBox").reportValidity();

    return;
  }
  else if (locationSearch)
  {
    if (!document.getElementById("locationBox").checkValidity())
    {
      document.getElementById("locationBox").reportValidity();
  
      return;
    }
  }


  //console.log("Validity check PASSED");

  xhr.onreadystatechange = handleTable;
  
  let url = "https://spry-firefly-377221.wl.r.appspot.com/";

  url += "?keyword=" + keyword;
  url += "&distance=";

  if (distance === null || distance === undefined)
  {
    url += 10;
  }
  else
  {
    url += distance;
  }

  url += "&category=" + category;

  url += "&location=";

  if (locationSearch)
  {
    url += stringToAddress(location1);
    
  }
  else
  {
    url += location1;
  }

  url += "&locationSearch=" + locationSearch;

  //console.log(url);

  urlRequest(url);
}

function setLocationAuto()
{
  const locBox = document.getElementById("locationBox");
  locBox.hidden = !(locBox.hidden);
  locationSearch = !locationSearch;

  if (locBox.hidden)
  {
    xhr.onreadystatechange = handleIPRequest;
    urlRequest("https://www.ipinfo.io?token=721bebb667bf09");
  }
  else
  {
    location1 = null;
    locBox.value = "";
  }
}

function urlRequest(url)
{
  //console.log(url);
  xhr.open("GET", url);
  xhr.send();
}

function parseDetails(JSON, id)
{
  let resultTable = {};
  let event = JSON["_embedded"]["events"][id];

  resultTable["name"] = event["_embedded"]["venues"][0]["name"];
  resultTable["address"] = event["_embedded"]["venues"][0]["address"]["line1"];
  resultTable["city"] = event["_embedded"]["venues"][0]["city"]["name"];
  resultTable["postCode"] = event["_embedded"]["venues"][0]["postalCode"];
  resultTable["upcomingEvents"] = event["_embedded"]["venues"][0]["url"];

  if (event["_embedded"]["venues"][0].hasOwnProperty("images")){
    resultTable["url"] = event["_embedded"]["venues"][0]["images"][0]["url"];
  }
  else
  {
    resultTable["url"] = "";
  }
  

  return resultTable;
}

function parseVenue(JSON, id)
{
  let name;
  let date;
  let artistString;
  let venue;
  let genreString;
  let priceRanges;
  let ticketStatus;
  let buyAt;
  let venueImg;

  let event = JSON["_embedded"]["events"][id];

  let resultTable = {"name":null, "date":null, "artists":null, "venue":null, "genres":null, "priceRange":null, "ticketStatus":null, "buyAt":null, "imageURL": null};

  genreString = "";

  date = event["dates"]["start"]["localDate"];
  date += "\n";
  date += event["dates"]["start"]["localTime"];

  //icon +=

  name = event["name"];

    
  const segmentName = event["classifications"][0]["segment"]["name"];
  if (segmentName !== "Undefined" && segmentName !== undefined)
  {
    genreString += segmentName;
  }
  const genreName = event["classifications"][0]["genre"]["name"];
  if (genreName !== "Undefined" && genreName !== undefined)
  {
    if (genreString !== "")
    {
      genreString += " | ";
    }
    genreString += genreName;
  }
  const subGenreName = event["classifications"][0]["subGenre"]["name"];
  if (subGenreName !== "Undefined" && subGenreName !== undefined)
  {
    if (genreString !== "")
    {
      genreString += " | ";
    }
    genreString += subGenreName;
  }
  if (event["classifications"][0].hasOwnProperty("type"))
  {
    const typeName = event["classifications"][0]["type"]["name"];
    if (typeName !== "Undefined" && typeName !== undefined)
    {
      if (genreString !== "")
      {
        genreString += " | ";
      }
      genreString += typeName;
    }
  }
  else
  {
    if (genreString !== "")
    {
      genreString += " | ";
    }
    genreString += "Undefined";
  }


  if (event["classifications"][0].hasOwnProperty("subType"))
  {
    const subTypeName = event["classifications"][0]["subType"]["name"];
    if (subTypeName !== "Undefined" && subTypeName !== undefined)
    {
      if (genreString !== "")
      {
        genreString += " | ";
      }
      genreString += subTypeName;
    }
  }
  else
  {
    if (genreString !== "")
    {
      genreString += " | ";
    }
    genreString += "Undefined";
  }


  artistString = [];
  const attractionList = event["_embedded"]["attractions"];

  for (let i = 0; i < attractionList.length; i++)
  {
    artistString.push(attractionList[i]["name"]);
  }

  let artistURLs = [];
  for (let i = 0; i < attractionList.length; i++)
  {
    artistURLs.push(attractionList[i]["url"]);
  }

  venue = event["_embedded"]["venues"][0]["name"];

  if (event.hasOwnProperty("priceRanges"))
  {
    priceRanges = event["priceRanges"][0]["min"];
    priceRanges += " - ";
    priceRanges += event["priceRanges"][0]["max"];
    priceRanges += " USD";
  }
  else
  {
    priceRanges = "Undefined"
  }


  ticketStatus = event["dates"]["status"]["code"];

  buyAt = event["url"];

  venueImg = event["seatmap"]["staticUrl"];

  resultTable["name"] = name;
  resultTable["date"] = date;
  resultTable["artists"] = artistString;
  resultTable["venue"] = venue;
  resultTable["genres"] = genreString;
  resultTable["priceRange"] = priceRanges;
  resultTable["ticketStatus"] = ticketStatus;
  resultTable["buyAt"] = buyAt;
  resultTable["imageURL"] = venueImg;
  resultTable["artistURLs"] = artistURLs;

  return resultTable;
}

function parseTable(JSON)
{
  const eventList = JSON["_embedded"]["events"];
  let date;
  let icon;
  let event;
  let genre;
  let venue;
  var resultTable = [];

  for (let i = 0; i < eventList.length; i++)
  {
    resultTable.push({"date":null, "icon":null, "event":null, "genre":null, "venue":null});

    date = eventList[i]["dates"]["start"]["localDate"];
    date += "\n";
    date += eventList[i]["dates"]["start"]["localTime"];

    //icon = "<img src='";
    icon = eventList[i]["images"][0]["url"];
    //icon +=

    event = eventList[i]["name"];

    genre = eventList[i]["classifications"][0]["segment"]["name"];

    venue = eventList[i]["_embedded"]["venues"][0]["name"];

    resultTable[i]["date"] = date;
    console.log("resultTable incoming");
    console.log(resultTable[i]);
    console.log(resultTable[i]["date"]);
    resultTable[i]["icon"] = icon;
    resultTable[i]["event"] = event;
    resultTable[i]["genre"] = genre;
    resultTable[i]["venue"] = venue;
  }

  //console.log("Table in parseTable:\n" + resultTable);

  return resultTable;
}

function sortVenue()
{
  if (venueSortEarliest)
  {
    sortVenueEarliest();
  }
  else
  {
    sortVenueLatest();
  }
}

function sortVenueEarliest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedGenre = unsortedRow.children[4].innerHTML;
      let sortedRow = table.children[j];
      let sortedGenre = table.children[j].children[4].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedGenre.localeCompare(sortedGenre) < 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  venueSortEarliest = false;
}

function sortVenueLatest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedGenre = unsortedRow.children[4].innerHTML;
      let sortedRow = table.children[j];
      let sortedGenre = table.children[j].children[4].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedGenre.localeCompare(sortedGenre) > 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  venueSortEarliest = true;
}

function sortGenre()
{
  if (genreSortEarliest)
  {
    sortGenreEarliest();
  }
  else
  {
    sortGenreLatest();
  }
}

function sortGenreEarliest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedGenre = unsortedRow.children[3].innerHTML;
      let sortedRow = table.children[j];
      let sortedGenre = table.children[j].children[3].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedGenre.localeCompare(sortedGenre) < 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  genreSortEarliest = false;
}

function sortGenreLatest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedGenre = unsortedRow.children[3].innerHTML;
      let sortedRow = table.children[j];
      let sortedGenre = table.children[j].children[3].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedGenre.localeCompare(sortedGenre) > 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  genreSortEarliest = true;
}

function sortEvent()
{
  if (eventSortEarliest)
  {
    sortEventEarliest();
  }
  else
  {
    sortEventLatest();
  }
}

function sortEventEarliest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedEvent = unsortedRow.children[2].children[0].innerHTML;
      let sortedRow = table.children[j];
      let sortedEvent = table.children[j].children[2].children[0].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedEvent.localeCompare(sortedEvent) < 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  eventSortEarliest = false;
}

function sortEventLatest()
{
  let table = document.getElementById("dataTable");

  // Points to the index immediately to the right of the sorted section
  let sortedPointer = 1;

  for (let i = 1; i < table.childElementCount; i++)
  {
    let unsortedRow = table.children[i].cloneNode(true);
    table.removeChild(table.children[i]);

    let j;
    for (j = 1; j < sortedPointer; j++)
    {
      let unsortedEvent = unsortedRow.children[2].children[0].innerHTML;
      let sortedRow = table.children[j];
      let sortedEvent = table.children[j].children[2].children[0].innerHTML;
      // If this row is greater than a row in the sorted section, insert it beforehand
      if (unsortedEvent.localeCompare(sortedEvent) > 0)
      {
        moveRow(table, unsortedRow, sortedRow, j)
        break;
      }
    }

    if (j === sortedPointer)
    {
      let sortedRow = table.children[j];

      moveRow(table, unsortedRow, sortedRow, j)
    }

    sortedPointer++;
  }

  eventSortEarliest = true;
}

function moveRow(table, movingRow, displacedRow, index)
{
  table.insertBefore(movingRow, displacedRow);
  table.children[index].children[2].addEventListener("click", highlightVenue);

}

function hideAll()
{
  hideTable();
  document.getElementById("mainBody").hidden = true;
  hideDetail();
  clearTable();
  document.getElementById("locationBox").hidden = false; 
  locationSearch = true;
  document.getElementById("locationAutoBox").checked = false;
}

function highlightVenue(event)
{
    currentEventID = event.currentTarget.id;
    document.getElementById("mainBody").hidden = false;
    fillVenue(parseVenue(responseObject, event.currentTarget.id));
    hideDetail();
    document.getElementById("mainBody").scrollIntoView({ behavior: "smooth"});
}

function addRow(resultRow)
{
  let DATE = resultRow["date"];
  let ICON = resultRow["icon"];
  let EVENT = resultRow["event"];
  let GENRE = resultRow["genre"];
  let VENUE = resultRow["venue"];

  console.log("Parameters in addRow:\n");
  console.log(DATE);
  console.log(ICON);
  console.log(EVENT);
  console.log(GENRE);
  console.log(VENUE);
  let table = document.getElementById("dataTable");

  let newRow = document.createElement("tr");

  let date = document.createElement("td");
  date.innerHTML = DATE;

  let icon = document.createElement("td");
  let iconImg = document.createElement("img");
  iconImg.src = ICON;
  icon.appendChild(iconImg);

  let event = document.createElement("td");
  //event.innerHTML = EVENT;
  let innerText = document.createElement("h6");
  innerText.innerHTML = EVENT;
  event.appendChild(innerText);
  //innerText.id = numRows++;
  // innerText.onclick = (this) => {
  //   //parseVenue(responseObject, this.id);
  // }
  // event.appendChild(innerText);


  let genre = document.createElement("td");
  genre.innerHTML = GENRE;

  let venue = document.createElement("td");
  venue.innerHTML = VENUE;

  newRow.appendChild(date);
  newRow.appendChild(icon);
  newRow.appendChild(event);
  newRow.appendChild(genre);
  newRow.appendChild(venue);

  table.appendChild(newRow);

  let eventText = table.lastElementChild.children[2];
  eventText.id = numRows++;
  //eventText.onclick = highlightVenue(eventText.id);
  eventText.addEventListener("click", highlightVenue);

  showTable();
}

function fillVenue(valueTable)
{
  document.getElementById("name").innerHTML = valueTable["name"];
  document.getElementById("date").innerHTML = valueTable["date"];
  // document.getElementById("artist").innerHTML = valueTable["artists"];
  document.getElementById("venue").innerHTML = valueTable["venue"];
  document.getElementById("genres").innerHTML = valueTable["genres"];
  document.getElementById("priceRange").innerHTML = valueTable["priceRange"];

  const statusDictionary = {"onsale":["On Sale", "green"],
                      "rescheduled":["Rescheduled", "yellow"],
                      "offsale":["Off Sale", "red"],
                      "cancelled":["Cancelled", "black"],
                      "postponed":["Postponed", "orange"]};


  let statusEl = document.getElementById("status");
  statusEl.innerHTML = statusDictionary[valueTable["ticketStatus"]][0];
  statusEl.style.backgroundColor = statusDictionary[valueTable["ticketStatus"]][1];


  document.getElementById("buyAt").href = valueTable["buyAt"];
  document.getElementById("venueImg").src = valueTable["imageURL"];

  let artistHeader = document.getElementById("artistHeader");
  artistHeader.innerHTML = "";
  let artistURLs = valueTable["artistURLs"];
  let artistNames = valueTable["artists"];


  for (let i = 0; i < artistURLs.length; i++)
  {
    let newAnchor = document.createElement("a");
    newAnchor.innerHTML = artistNames[i];
    newAnchor.href = artistURLs[i];
    newAnchor.target = "_blank";

    artistHeader.append(newAnchor);

    if (i < artistURLs.length - 1)
    {
      let span = document.createElement("span");
      span.innerHTML = " | ";
      artistHeader.append(span);
    }
  }
}

function hideDetail()
{
  document.getElementsByTagName("footer")[0].hidden = true;
  document.getElementById("detailPrompt").hidden = false;
}

function highlightDetail()
{
  if (currentEventID !== null)
  {
    document.getElementsByTagName("footer")[0].hidden = false;
    fillDetail(parseDetails(responseObject, currentEventID));
    document.getElementById("detailPrompt").hidden = true;
    document.getElementsByTagName("footer")[0].scrollIntoView({ behavior: "smooth"});
  }
}

function fillDetail(valueTable)
{
  document.getElementById("venueName").innerHTML = valueTable["name"];
  document.getElementById("venueLogo").src = valueTable["url"];
  document.getElementById("firstLine").innerHTML = valueTable["address"];
  document.getElementById("secondLine").innerHTML = valueTable["city"];
  document.getElementById("thirdLine").innerHTML = valueTable["postCode"];
  document.getElementById("moreEventLink").href = valueTable["upcomingEvents"];

  let googleString = "https://www.google.com/maps/search/?api=1&query=";
  googleString += valueTable["address"] + ", ";
  googleString += valueTable["city"] + " ";
  googleString += valueTable["postCode"];

  document.getElementById("openGoogle").href = stringToAddressMap(googleString);
}


function showTable()
{
  document.getElementById("dataDiv").hidden = false;
}

function hideTable()
{
  document.getElementById("dataDiv").hidden = true;
}

function clearTable()
{
  let table = document.getElementsByTagName("table")[0];

  numRows = 0;

  for (let i = table.children.length - 1; i > 0; i--)
  {
    table.removeChild(table.children[i]);
  }
}
