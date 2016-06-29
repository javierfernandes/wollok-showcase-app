
/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('DashboardCtrl', function($scope, $state, $http) {
    $scope.$state = $state;

    $scope.pageSize = 4

    $scope.currentFileContent = "No file selected";
    
    $scope.components = undefined
    $scope.selectedComponent = undefined
    $scope.files = undefined
    $scope.filePages = []
    $scope.currentPageNumber = 0

    $scope.showComponent = function(component) {
    	$scope.selectedComponent = component
    	$scope.loadComponentContent()
    }

    $scope.loadComponentContent = function() {
    	$http({ method:'GET', url: '/api/components/' + $scope.selectedComponent.id }).then(function(response) {
	        $scope.filePages = response.data.chunk($scope.pageSize)
	        $scope.setPage(0)
	    })
	    .catch(function(err) {
	    	console.log(err)
	    })
    }

    $scope.setPage = function(nrPage) {
    	$scope.files = $scope.filePages[nrPage]
    	$scope.currentPageNumber = nrPage
    }

    $scope.nextPage = function() {
    	$scope.setPage($scope.currentPageNumber + 1)
    	return false
    }

    $scope.previousPage = function() {
    	$scope.setPage($scope.currentPageNumber - 1)
    	return false
    }

    $scope.filesPages = function() {
    	return $scope.filePages.length
    }
    $scope.isFirstPage = function() { return $scope.currentPageNumber === 0 }
    $scope.isLastPage = function() { return $scope.currentPageNumber === $scope.filePages.length - 1 }

    function getAndSet(name) {
      $http({method:'GET', url: '/api/' + name }).then(function(response) {
        $scope[name] = response.data;
      });
    }

    $scope.loadFile = function(file) {
      $http({ method:'GET', url: '/api/file/' + file.fqn }).then(function(response) {
        $scope.currentFileContent = response.data;
        $scope.selectedFile = file;
      });
    };

    $scope.runFile = function() {
        console.log("Running file !")
        $http.get('/api/file/run/' + $scope.selectedFile.fqn)
            .then(function(response) {
                console.log("Got response: " + response)
                $scope.executionFeedBack = JSON.stringify(response.data, null, '\t')
            }, function(response) {
                console.log("ERROR: " + response)
                $scope.executionFeedBack = JSON.stringify(response.data, null, '\t')
            });
    }

    getAndSet('components')

  });


Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        var R = [];
        for (var i=0; i<this.length; i+=chunkSize)
            R.push(this.slice(i,i+chunkSize));
        return R;
    }
});