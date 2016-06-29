'use strict';

/**
 * @ngdoc function
 * @name wollok-showcase-app.controller:MainCtrl
 */
angular.module('wollok-showcase-app')
  .controller('LoginCtrl', function($scope, $location) {
    $scope.submit = function() {
      $location.path('/dashboard');
      return false;
    }
  });
