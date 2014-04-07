
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    //$(document).foundation();
    videojs('#main-video').ready(function(){
      var myPlayer = this;
      myPlayer.play();
      myPlayer.requestFullScreen();
      myPlayer.trigger('fullscreenchange');
    });
  }

})();

