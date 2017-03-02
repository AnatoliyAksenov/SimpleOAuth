'use strict';
(function() {
  angular
    .module('App')
    .directive('user', user);

  function user(){
    var directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: 'templates/user.html',
      controller: User,
      bindToController: true
    };

    return directive;
  };
  
  
  User.$inject = ['$scope', 'dataAssistant'];

  function User($scope, dataAssistant){

    $scope.add = function(){        
        var phonenumber = $scope.phonenumber;
        var password = $scope.password;
        var path = `/api/user/add`;
        dataAssistant.post(path, {phonenumber: phonenumber, password: password}).then(function(data){
            $scope.result = data;
            delete $scope.error;
        },function(error){
            $scope.error = error;
            delete $scope.result;
        });
    };
  }
})();	
