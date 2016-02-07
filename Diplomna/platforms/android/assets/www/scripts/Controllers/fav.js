app.controller('FavCtrl', function ($scope, $ionicActionSheet, $timeout, $state, FavouritesService, $filter, OrdersService) {

    var imagePath = "http://localhost:20000/Images/SalonImages/";
    // Call the async method and then do stuff with what is returned inside our own then function
    FavouritesService.getFavourites($scope.authentication.userName).then(function (result) {
        $scope.favourites = result;
    });

    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    $scope.newAddedFavs = [];

    //action sheet

    $scope.show = function (salon, itemIndex) {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
              { text: 'Начало' },
              { text: 'Виж детайли' },
            ],
            destructiveText: 'Изтрий',
            titleText: 'Меню',
            cancelText: 'Отказ',
            cancel: function () {
                // add cancel code..
                console.log('CANCELLED');
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('app.home');
                        break;
                    case 1:
                        $state.go('app.salon-detail', { salonId: salon.SalonID });
                        break;
                    default:
                        break;
                }
                return true;
            },
            destructiveButtonClicked: function () {
                $scope.showLoader();
                FavouritesService.delFavourite(salon.FavouriteID).then(function (data) {
                    console.log(data);
                    $scope.favourites.splice(itemIndex, 1);
                    OrdersService.GetReservationCount($scope.authentication.userName, false).then(function (result) {
                        $scope.counts.reservationCount = result[0];
                        $scope.counts.favCount = result[1];
                    });
                    hideSheet();
                }).finally(function () {
                    $scope.hideLoader();
                });
            }
        });

        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 20000);

    };
})