'use strict';
(function() {
  angular
    .module('App')
    .directive('userlist', userlist);

  function userlist(){
    var directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: 'templates/userlist.html',
      controller: UserList,
      bindToController: true
    };

    return directive;
  }; 
  
  UserList.$inject = ['$scope', 'dataAssistant'];

  function UserList($scope, dataAssistant){
    
    $scope.update = function(){   
        var path = `/api/users`;
        dataAssistant.get(path).then(function(data){
            
            $scope.users = data.data;            
        },function(error){
            $scope.error = error;
            $scope.users = [];
        });
    };
    $scope.update();    
  }
})();	
