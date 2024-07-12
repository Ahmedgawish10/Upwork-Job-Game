(function ($) {
// define variables
var canUseLocalStorage = 'localStorage' in window && window.localStorage !== null;

/**
 * Asset pre-loader object. Loads all images
 */
var assetLoader = (function() {
  // images dictionary
  this.imgs        = {
    'blue-bg-option'    : 'imgs/blue-bg-option.png',
    'blue-bg'           : 'imgs/blue-bg.png',
    'btn-bg'            : 'imgs/btn-bg.png',
    'gameover-bg'       : 'imgs/gameover-bg.png',
    'info-bg-2'         : 'imgs/info-bg-2.png',
    'info-bg'           : 'imgs/info-bg.png',
    'menu-bg'           : 'imgs/menu-bg.png',
    'menu-btn'          : 'imgs/menu-btn.png',
    'ok-btn'            : 'imgs/ok-btn.png',
    'option-bg'         : 'imgs/option-bg.png',
    'pause-bg'          : 'imgs/pause-bg.png',
    'player-avatar'     : 'imgs/player-avatar.png',
    'ai-avatar'         : 'imgs/ai-avatar.png',
    'restart-btn'       : 'imgs/restart-btn.png',
    'wood-bg'           : 'imgs/wood-bg.png',
  };

  var assetsLoaded = 0;                                // how many assets have been loaded
  var numImgs      = Object.keys(this.imgs).length;    // total number of image assets
  this.totalAssest = numImgs;                          // total number of assets

  /**
   * Ensure all assets are loaded before using them
   * @param {number} dic  - Dictionary name 
   * @param {number} name - Asset name in the dictionary
   */
  function assetLoaded(dic, name) {
    // don't count assets that have already loaded
    if (this[dic][name].status !== 'loading') {
      return;
    }

    this[dic][name].status = 'loaded';
    assetsLoaded++;

    // progress callback
    if (typeof this.progress === 'function') {
      this.progress(assetsLoaded, this.totalAssest);
    }

    // finished callback
    if (assetsLoaded === this.totalAssest && typeof this.finished === 'function') {
      this.finished();
    }
  }
  /**
   * Create assets, set callback for asset loading, set asset source
   */
  this.downloadAll = function() {
    var _this = this;
    var src;

    // load images
    for (var img in this.imgs) {
      if (this.imgs.hasOwnProperty(img)) {
        src = this.imgs[img];

        // create a closure for event binding
        (function(_this, img) {
          _this.imgs[img] = new Image();
          _this.imgs[img].status = 'loading';
          _this.imgs[img].name = img;
          _this.imgs[img].onload = function() { assetLoaded.call(_this, 'imgs', img) };
          _this.imgs[img].src = src;
        })(_this, img);
      }
    }
  }

  return {
    imgs: this.imgs,
    totalAssest: this.totalAssest,
    downloadAll: this.downloadAll
  };
})();

/**
 * Show asset loading progress
 * @param {integer} progress - Number of assets loaded
 * @param {integer} total - Total number of assets
 */
assetLoader.progress = function(progress, total) {
  var pBar = document.getElementById('progress-bar');
  pBar.value = progress / total;
  document.getElementById('p').innerHTML = Math.round(pBar.value * 100) + "%";
}

/**
 * Load the main menu
 */
assetLoader.finished = function() {
  mainMenu();
}


/**
 * Show the main menu after loading all assets
 */
function mainMenu() {


  $('#progress').hide();
  $('#main').show();
  $('#menu').addClass('main');
}


function startGame(){
  var player1 = document.getElementById('player1').value;
  var player2 = document.getElementById('player2').value;
  var level = document.getElementById('level').value;
  setTimeout(()=>{
    window.location.href = 'game.html?player1=' + player1 + '&player2=' + player2 + '&level=' + level;
      
  },400)
}

/**
 * Click handlers for the different menu screens
 */
$('.options').click(function() {
  $('#main').hide();
  $('#options').show();
  $('#menu').addClass('options');
});
$('.instruction').click(function() {
  $('#main').hide();
  $('#instruction').show();
  $('#menu').addClass('instruction');
});
$('.back').click(function() {
  $('#options').hide();
  $('#instruction').hide();
  $('#main').show();
  $('#menu').removeClass('options');
});
$('.play').click(function() {
  $('#menu').hide();
  startGame();
});

assetLoader.downloadAll();
})(jQuery);
// *****************Audio for page index***********************************/
// audio sound for page index.js 1
var audio1 = document.getElementById('myAudio1');
var playButtons1 = document.querySelectorAll('.playButton');

playButtons1.forEach(function(button) {
  button.addEventListener('click', function() {
    if (audio1.paused) {
      audio1.play();
    } else {
      /* stop the audio if you want*/
    //  audio1.pause();
      audio1.currentTime = 0;
    }
  });
});
// audio sound for page index.js 2
var audio2 = document.getElementById('myAudio2');
var playButtons2 = document.querySelectorAll('.playButtonOptions');

playButtons2.forEach(function(button) {
  button.addEventListener('click', function() {
    if (audio2.paused) {
      audio2.play();
    } else {
      /* stop the audio if you want*/
    //  audio2.pause();
      audio2.currentTime = 0;
    }
  });
});
// audio sound for page index.js 3 by works clicks 
document.addEventListener('DOMContentLoaded', function() {
  var audio = new Audio('try.mp3');  // Replace with your audio file path
  
  var playButton = document.getElementById('playButton');
  
  // Initialize the playback state and class
  var isPlaying = false;
  updateButtonClass();
  
  playButton.addEventListener('click', function() {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.pause();

       audio.play();
    }
    isPlaying = !isPlaying;
    updateButtonClass();
  });
  
  // Function to update button class based on playback state
  function updateButtonClass() {
    if (isPlaying) {
      playButton.classList.remove('nosound');
      playButton.classList.add('sound');
    } else {
      playButton.classList.remove('sound');
      playButton.classList.add('nosound');
    }
  }
});
