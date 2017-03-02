'use strict';
(function() {
  angular
    .module('App')
    .directive('account', account);
  
  function account(){
    var directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: 'templates/account.html',
      controller: Account,
      bindToController: true
    };

    return directive;
  };
    
  Account.$inject = ['$scope', 'dataAssistant'];

  function Account($scope, dataAssistant){
    $scope.register = function(){        
        var account = $scope.account;
        var secret = $scope.secret;
        var redirect = $scope.redirect;

        var path = `/api/account/add`;
        dataAssistant.post(path, {account:account, secret: secret, redirect: redirect}).then(function(data){
            $scope.result = data;
            delete $scope.error;
        },function(error){
            $scope.error = error;
            delete $scope.result;
        });
    };
  }  
})();