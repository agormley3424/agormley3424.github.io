from flask import Flask
from flask import jsonify
from flask import request
import requests
from geolib import geohash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#http://localhost:8080/?keyword=concerts&distance=50&category=music&location=1600+Amphitheatre+Parkway,+Mountain+View,+CA&locationSearch=true
#http://spry-firefly-377221.wl.r.appspot.com/?keyword=concerts&distance=50&category=music&location=1600+Ampitheatre+Parkway,+Mountain+View,+CA&locationSearch=true
#http://localhost:8080/?keyword=concerts&distance=50&category=music&location=37.422040,-122.082810&locationSearch=false
#http://spry-firefly-377221.wl.r.appspot.com/?keyword=concerts&distance=50&category=music&location=235+West+46th+Street,+New+York,+NY&locationSearch=true


# Remove leading whitespaces
# Replace all whitespace gaps with + unless before a comma (edge case)
# 
# def stringToAddress(string):
#     returnAddress = ""
#     for i in range(0, len(string) - 1):
#         if (string.isspace(string[i])):
#             if (returnAddress[len(returnAddress) - 1] != '+'):
#                 returnAddress += "+"
#         else:
#             returnAddress += string[i]
    
#     return returnAddress

def ipToAddress(string):
    returnAddresses = ["", ""]
    midIndex = -1
    for i in range(0, len(string)):
        if (string[i] == ','):
            midIndex = i
            returnAddresses[0] = string[0:i]

    returnAddresses[1] = string[(midIndex+1):len(string)]

    return returnAddresses

@app.route('/')
def main():
    catTable = {"music":"KZFzniwnSyZfZ7v7nJ",
                "sports":"KZFzniwnSyZfZ7v7nE",
                "artstheatre":"KZFzniwnSyZfZ7v7na",
                "film":"KZFzniwnSyZfZ7v7nn",
                "misc":"KZFzniwnSyZfZ7v7n1",
                "default":""}

    locationSearch = request.args["locationSearch"]
    #return {"heck":2}
    #return request.args
    # if (num == 1):
    #     return jsonify("Input received")
    # else:
    #     return jsonify("No input found")

    if locationSearch == "true":
        googleString = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBmKpWW7k6eeEiJkccFLThjonWApR40Xis&address="
        googleString += request.args["location"]
        googleAddy = requests.get(googleString)
        googleAddy = googleAddy.json()

        #print(googleAddy)

        latitude = googleAddy["results"][0]["geometry"]["location"]["lat"]
        longitude = googleAddy["results"][0]["geometry"]["location"]["lng"]
    else:
        ipAddy = ipToAddress(request.args["location"])
        latitude = ipAddy[0]
        longitude = ipAddy[1]

    # print("Latitude is " + latitude)
    # print("Longitude is " + longitude)

    latitude = float(latitude)
    longitude = float(longitude)



    precision = 7
    geoPoint = geohash.encode(latitude, longitude, precision)
    segmentID = catTable[request.args["category"]]
    TMkey = "ZUe4QATYrGXNGmv3VGkGdAz0gC3XXeVo"
    radius = request.args["distance"]
    # latitude = "70.2995"
    # longitude = "-27.993"

    # radius = 100
    # segmentId = "KZFzniwnSyZfZ7v7nn"
    #unit = "miles"
    keyword = request.args["keyword"]
    ticketMasterString = "https://app.ticketmaster.com/discovery/v2/events.json?" + "apikey=" + TMkey
    ticketMasterString += "&segmentId=" + segmentID + "&radius=" + radius
    ticketMasterString += "&unit=miles&geoPoint=" + geoPoint

    #return ticketMasterString

    #response = requests.get("https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyBmKpWW7k6eeEiJkccFLThjonWApR40Xis")
    #response = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?apikey=ZUe4QATYrGXNGmv3VGkGdAz0gC3XXeVo&segmentId=KZFzniwnSyZfZ7v7nn&radius=10&unit=miles&geoPoint=9q5cs")
  
    ticketResponse = requests.get(ticketMasterString)

    return ticketResponse.json()


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
    #main()
