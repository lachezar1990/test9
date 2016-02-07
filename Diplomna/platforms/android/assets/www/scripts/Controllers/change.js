app.controller('ChangeController', function ($scope, $state, authService, $timeout, $state, $ionicHistory) {
    $scope.savedSuccessfully = false;
    $scope.message = "";


    $scope.model = {
        UserName: $scope.authentication.userName,
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: ""
    };

    $scope.changeFormSubmit = function (form, change) {
        if (form.$valid) {
            $scope.isLoading = true;

            authService.changePassword(change).then(function (response) {

                $scope.savedSuccessfully = true;
                $scope.message = "Вашата парола беше успешно сменена! Ще бъдете прехвърлени към страницата за вход.";
                startTimer();

            },
             function (response) {
                 var errors = [];
                 for (var key in response.data.ModelState) {
                     for (var i = 0; i < response.data.ModelState[key].length; i++) {
                         errors.push(response.data.ModelState[key][i]);
                     }
                 }
                 $scope.message = "Паролата не беше сменена:" + errors.join(' ');
             }).finally(function () {
                 ngProgress.complete();
                 $scope.isLoading = false;
             });
        }
    };

    var startTimer = function () {
        var timer = $timeout(function () {
            $timeout.cancel(timer);
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            authService.logOut();
            $state.go('app.login');
        }, 2000);
    }
})