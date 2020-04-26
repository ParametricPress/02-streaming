/*
Create buttons
Create YTPlayer
Change video based on buttons
*/

// imports
import {display_size_data, clear_resource_timings} from "./emission_functions.js"

// Wait for div to be loaded
window.onload = main;



// declare global constants
var buttonIds = {
    "movie": "zTgdtmkMT2g",
    "animation": "MBnnXbOM5S4",
    "images": "rUHfGxxQnSU"
};
var buttonNames = Object.keys(buttonIds);
var player;
var videoContainer; 
var youtubePlayerCreated = false;

function main(){    
    buttonNames.forEach(createButtonDivs);
    videoContainer = document.getElementById("videoPlayer");

}

function createButtonDivs(name){
    var buttonGroupDiv = document.getElementById("buttons");
    var vidoeButtonDiv = document.createElement("div");
    vidoeButtonDiv.id = name;
    vidoeButtonDiv.className = "videoButtons";
    buttonGroupDiv.appendChild(vidoeButtonDiv);
    
    var button = document.createElement("button");
    button.name = name;
    button.innerHTML = name;
    button.addEventListener("click", playVideo);
    vidoeButtonDiv.appendChild(button);
}

function playVideo(event){
    var videoId = buttonIds[event.currentTarget.name];
    if (youtubePlayerCreated){
        player.loadVideoById(videoId);
    }
    else{
        loadPlayer(videoContainer, videoId);
    }
}

function loadPlayer(container, videoId){
    player = new YT.Player(container, {
        width: 356,
        height: 200,
        videoId: videoId,
        events: { 
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.PLAYING){
                    displaySizeLoop();
                }
            }
        }
    })
    youtubePlayerCreated = true;
}

function displaySizeLoop(){
    if (player.getPlayerState() === YT.PlayerState.PLAYING){
        display_size_data();
        (function(send) {

            XMLHttpRequest.prototype.send = function(data) {
        
                // in this case I'm injecting an access token (eg. accessToken) in the request headers before it gets sent
                if(accessToken) this.setRequestHeader('x-access-token', accessToken);
                console.log("hit")
                send.call(this, data);
            };
        
        })(XMLHttpRequest.prototype.send);
        setTimeout(displaySizeLoop, 1000);
    }
}