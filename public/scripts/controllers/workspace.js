angular.module('wollok-showcase-app')
    .controller('WorkspaceCtrl', function($scope, $state, $http) {
        $scope.programContent = 'program a {\n    \n}'

        $scope.runFile = function() {
            $scope.running = true
            $http({
                url: '/api/run',
                method: "POST",
                data: { "program" : $scope.programContent }
            })
                .then(function(response) {
                    $scope.running = false
                    $scope.executionResult = response.data
                    $scope.processMarkers()
                    $scope.executionFeedBack = JSON.stringify(response.data, null, '\t')
                }, function(response) {
                    $scope.running = false
                    console.log("ERROR: " + response)
                    $scope.executionFeedBack = JSON.stringify(response.data, null, '\t')
                });
        }

        $scope.processMarkers = function() {
            var Range = ace.require("ace/range").Range
            if ($scope.executionResult && $scope.executionResult.compilation && $scope.executionResult.compilation.issues) {
                var annotations = []
                $scope.executionResult.compilation.issues.forEach(function(issue) {
                    if (issue.lineNumber) {
                        annotations.push({
                            row: issue.lineNumber - 1,
                            column: $scope.lineOffsetFromFileOffset(issue.offset),
                            text: issue.message,
                            type: issue.severity.toLowerCase()  //error, warning and information
                        });
                        $scope.codeEditor.session.addMarker(
                            new Range(issue.lineNumber - 1, // row start
                                $scope.lineOffsetFromFileOffset(issue.offset) - 1,  // column start
                                issue.lineNumber - 1, // end row
                                $scope.lineOffsetFromFileOffset(issue.offset) - 1 + issue.length), // end column
                            "errorHighlight", "line"
                        );
                    }
                })
                $scope.codeEditor.getSession().setAnnotations(annotations)
            }
        }

        $scope.codeEditorLoaded = function(_editor) {
            $scope.codeEditor = _editor
            _editor.moveCursorToPosition({row: 1, column: 3})
            _editor.gotoLine(3)
            _editor.focus();
        }

        $scope.lineOffsetFromFileOffset = function(offset) {
            console.log(offset)
            var contentUpToOffset = $scope.programContent.substring(0, offset)
            console.log(offset)
            var lineContent = contentUpToOffset.substring(contentUpToOffset.lastIndexOf('\n'))
            console.log(lineContent)
            return lineContent.length
        }

    })