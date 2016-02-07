app.controller('StartScreenController', function ($scope, $state, $ionicHistory) {
    $scope.goHome = function () {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.home');
    }
})