app.controller('LoginController', function ($scope, $state, authService, $ionicHistory, $window) {
    $scope.cred = {
        userName: "",
        password: ""
    };

    $scope.message = "";

    $scope.loginFormSubmit = function (form, cred) {
        if (form.$valid) {
            $scope.message = '';
            $scope.isLoading = true;

            authService.login(cred).then(function (response) {
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });
                $scope.countOrdersAndFavs();
                $ionicHistory.clearCache();
                $state.go('app.home', {}, { reload: true });
            },
             function (err) {
                 $scope.message = err.error_description;
             }).finally(function () {
                 $scope.isLoading = false;
             });
        }
    };
})