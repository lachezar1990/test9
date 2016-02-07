app.controller('RegisterController', function ($scope, $state, authService, $timeout, $state, $ionicHistory) {
    $scope.savedSuccessfully = false;
    $scope.message = "";

    $scope.registration = {
        userName: "",
        password: "",
        confirmPassword: ""
    };

    $scope.registerFormSubmit = function (form, registration) {
        if (form.$valid) {
            $scope.isLoading = true;

            authService.saveRegistration(registration).then(function (response) {

                $scope.savedSuccessfully = true;
                $scope.message = "Потребителят беше регистриран успешно! Ще бъдете прехвърлени след 2 секунди към страницата за вход.";
                startTimer();

            },
             function (response) {
                 var errors = [];
                 for (var key in response.data.ModelState) {
                     for (var i = 0; i < response.data.ModelState[key].length; i++) {
                         errors.push(response.data.ModelState[key][i]);
                     }
                 }
                 $scope.message = "Потребителят не беше регистриран:" + errors.join(' ');
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
            $state.go('app.login');
        }, 2000);
    }
})