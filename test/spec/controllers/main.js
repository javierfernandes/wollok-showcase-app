'use strict';

describe('Controller: MainCtrl', function() {
  // load the controller's module
  beforeEach(module('wollok-showcase-app'));

  var MainCtrl;
  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('DashboardCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of tasks', function() {
    expect(scope.pageSize).toBe(4);
  });
});
