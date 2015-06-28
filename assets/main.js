$(function() {
  $('.sidebar').on('click', function() {
    var transition = 'push',
        direction  = 'top',
        dimPage    = true;

    if( $(this).filter('.disabled').size() === 0) {
      $('.' + direction + '.sidebar').not('.styled').sidebar('setting', {
        dimPage          : dimPage,
        transition       : transition,
        mobileTransition : transition
      });

      $('.' + direction + '.sidebar').not('.styled').sidebar('toggle');
    }
  });

  $('#logout').click(function() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("building_id");

    window.location.replace('index.html');
  });

  $('.refresh').click(function() {
    location.reload();
  });

  if ( localStorage.getItem('role') == 3) {
    $('.manage-devices').click(function() {
      window.location.replace('devices.html');
    });
    $('.manage-devices').html('Manage Devices');
  }

});

function returnToDashboard() {
  var role = localStorage.getItem('role');

  if (!role) {
    window.location.replace('index.html');
  } else if (role == 1) {
    window.location.replace('dashboard.html');
  } else if (role == 2) {
    window.location.replace('dashboard.html');
  } else if (role == 3) {
    window.location.replace('dashboard.html');
  } else {
    window.location.replace('error.html');
  }
}

function manageDevices() {
  var role = localStorage.getItem('role');

  if (!role) {
    window.location.replace('index.html');
  } else if (role == 3) {
    window.location.replace('devices.html');
  } else {
    window.location.replace('dashboard.html');
  }
}
var pictureSource;   // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready",onDeviceReady,false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL });
}
// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL});
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  $('#smallImage').show();
  $('#smallImage img').attr("src", "data:image/jpeg;base64," + imageData);
}
// Called if something bad happens.
//
function onFail(message) {
}
function previewFile() {
  var preview = $('#smallImage img')[0];
  var file    = $('input[type=file]')[0].files[0];
  var reader  = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
    $('#smallImage').show();
  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}
function reset_input_file(input) {
    input.replaceWith(input.val('').clone(true));
};