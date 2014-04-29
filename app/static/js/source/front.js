(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('body').click(bodyClick);
  }

  function bodyClick(){
    var currentPage = window.location.origin;
    var nextPage = currentPage + '/auth';

    window.location.href = nextPage;
  }

})();

