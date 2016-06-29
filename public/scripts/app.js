'use strict';

/**
 * @ngdoc overview
 * Main module of the application.
 */
angular
  .module('wollok-showcase-app', [
    'ui.router',
    'ngAnimate',
    'ui.ace',
    'angular-loading-bar'
  ])
  .filter('range', function() {
    return function(input, total) {
      total = parseInt(total);

      for (var i=0; i<total; i++) {
        input.push(i);
      }

      return input;
    };
  })
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/dashboard', '/dashboard/overview');
    //$urlRouterProvider.otherwise('/login');
    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
      .state('base', {
        abstract: true,
        url: '',
        templateUrl: 'views/base.html'
      })
        .state('login', {
          url: '/login',
          parent: 'base',
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .state('dashboard', {
          url: '/dashboard',
          parent: 'base',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardCtrl'
        })
        .state('overview', {
            url: '/overview',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/overview.html'
        })


  });

