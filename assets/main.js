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
    window.location.replace('manager_dashboard.html');
  } else {
    window.location.replace('error.html');
  }
}