'use strict';
(function() {
  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope'];

    function MainController($scope, dataAssistant) {
      $scope.page = 'user';
      $scope.showUser = function(){
        $scope.page = 'user';			
      };

      $scope.showAccount = function(){
        $scope.page = 'account';			
      };	

      $scope.showUserList = function(){        
        $scope.page = 'userlist';
      }			
    };
})();