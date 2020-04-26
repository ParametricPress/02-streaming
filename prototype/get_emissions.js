var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('newvid', {
        height: '300',
        width: '400',
        videoId: 'zTgdtmkMT2g', // Dr Strange ID
        events: {
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.PLAYING) {
                    display_size_data();
                }
            }
        }
    });
}

function myFunction() {
    console.log("playing!");
}
