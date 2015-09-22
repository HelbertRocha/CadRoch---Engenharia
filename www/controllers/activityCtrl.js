/**
 * Created by Opstrup on 14/09/15.
 */
'use strict';

angular.module('docsys-phonegap')

  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('activity', {
        url: '/activity',
        templateUrl: 'templates/activityView.html',
        controller: 'ActivityCtrl'
      });
  }])

  .controller('ActivityCtrl', ['$scope', 'userServices', function($scope, userServices) {
    $scope.init = function() {
      $scope.user = userServices.getUser();
      $scope.date = new Date();
    };

    $scope.goToActivity = function(activity) {
      console.log(activity);
    };

    $scope.init();
  }]);
