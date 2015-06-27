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
});