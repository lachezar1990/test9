app.controller('NavCtrl', function ($scope, SaloniService, $ionicActionSheet, $timeout, $state,
    FavouritesService, $filter, $ionicPopover, CityService, NeighbourhoodService, OrdersService, $ionicScrollDelegate) {

    var imagePath = "http://localhost:20000/Images/SalonImages/";
    // Call the async method and then do stuff with what is returned inside our own then function

    $scope.hasNeighbourhoods = false;
    $scope.showLoader();
    CityService.getCities().then(function (result) {
        $scope.cities = result;
        $scope.selectedCity = result[0];
        $scope.cityButtonText = result[0].CityName;

        NeighbourhoodService.getNeighbourhoods(result[0].CityID).then(function (resultN) {
            $scope.neighbourhoods = resultN;

            if ($scope.neighbourhoods.length > 0) {
                $scope.neighbourhoods.unshift({ 'NeighbourhoodID': 0, 'NeighbourhoodName': 'Всички кв.' });
                $scope.hasNeighbourhoods = true;
                $scope.selectedNeighbourhood = $scope.neighbourhoods[0];
                $scope.neighbourhoodButtonText = $scope.neighbourhoods[0].NeighbourhoodName;
            }
            else {
                $scope.hasNeighbourhoods = false;
            }
            $scope.loadMoreSalons();
        });
    }).finally(function () {
        $scope.hideLoader();
    });

    $scope.hasMore = true;
    $scope.firstLoad = true;
    $scope.page = 0;
    $scope.salons = [];

    $scope.loadMoreSalons = function () {
        console.log('зареждане на повече салони');
        if ($scope.selectedCity) {
            $scope.page++; // за да се увеличават страниците
            $scope.showLoader();
            SaloniService.getAll($scope.selectedCity.CityID,
                ($scope.selectedNeighbourhood ? $scope.selectedNeighbourhood.NeighbourhoodID : 0), $scope.page, $scope.authentication.userName).then(function (result) {
                    var data = result.data;
                    console.log(result);
                    console.log("has-more " + result.hasMore);

                    $scope.hasMore = result.hasMore === "1";

                    angular.forEach(data, function (salon) {
                        $scope.salons.push(salon);
                    });
                }).finally(function () {
                    $scope.hideLoader();
                });
        }
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    //$scope.$on('$stateChangeSuccess', function () {
    //    $scope.loadMoreSalons();
    //});

    $scope.CityClick = function (city) {
        $scope.selectedCity = city;
        $scope.cityButtonText = city.CityName;
        $scope.showLoader();
        NeighbourhoodService.getNeighbourhoods(city.CityID).then(function (resultN) {
            $scope.neighbourhoods = resultN;

            if ($scope.neighbourhoods.length > 0) {
                $scope.neighbourhoods.unshift({ 'NeighbourhoodID': 0, 'NeighbourhoodName': 'Всички кв.' });
                $scope.hasNeighbourhoods = true;
                $scope.selectedNeighbourhood = $scope.neighbourhoods[0];
                $scope.neighbourhoodButtonText = $scope.neighbourhoods[0].NeighbourhoodName;
            }
            else {
                $scope.hasNeighbourhoods = false;
            }
        }).finally(function () {
            $scope.hideLoader();
        });

        $scope.popover.hide();
    };

    $scope.searchFromCity = function () {
        $ionicScrollDelegate.scrollTop();
        $scope.showLoader();
        SaloniService.getAll($scope.selectedCity.CityID, $scope.selectedNeighbourhood.NeighbourhoodID || 0, 1, $scope.authentication.userName).then(function (result) {
            var data = result.data;

            $scope.hasMore = result.hasMore === "1";

            $scope.salons = data;

            $scope.page = 1;
        }).finally(function () {
            $scope.hideLoader();
        });
    };

    $ionicPopover.fromTemplateUrl('templates/city-popover.html', {
        scope: $scope,
    }).then(function (popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };

    $scope.closePopover = function () {
        $scope.popover.hide();
    };

    //квартал

    $scope.NeighbourhoodClick = function (neighbourhood) {
        $scope.selectedNeighbourhood = neighbourhood;
        $scope.neighbourhoodButtonText = neighbourhood.NeighbourhoodName;

        $scope.neighbourhoodPopover.hide();
    };

    $ionicPopover.fromTemplateUrl('templates/neighbourhood-popover.html', {
        scope: $scope,
    }).then(function (popover) {
        $scope.neighbourhoodPopover = popover;
    });

    $scope.openNeighbourhoodPopover = function ($event) {
        $scope.neighbourhoodPopover.show($event);
    };

    $scope.closeNeighbourhoodPopover = function () {
        $scope.neighbourhoodPopover.hide();
    };


    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    $scope.newAddedFavs = [];

    //action sheet

    $scope.show = function (salon) {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
              { text: '<i class="icon ion-star"></i> Добави в любими' },
              { text: 'Виж детайли' },
            ],
            //destructiveText: 'Delete',
            titleText: 'Меню',
            cancelText: 'Отказ',
            cancel: function () {
                // add cancel code..
                console.log('CANCELLED');
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        var isInListWithFavs = false;
                        if ($scope.newAddedFavs.length > 0) {
                            angular.forEach($scope.newAddedFavs, function (fav) {
                                if (fav === salon.SalonID) {
                                    isInListWithFavs = true;
                                }
                            });
                        }
                        if (!salon.Favourite && !isInListWithFavs) {
                            var favToAdd = {};
                            favToAdd.SalonID = salon.SalonID;
                            favToAdd.CreateBy = $scope.authentication.userName;
                            $scope.showLoader();
                            FavouritesService.addFavourite(favToAdd).then(function (data) {
                                console.log(data);
                                $scope.salonFav = $filter('filter')($scope.salons, { SalonID: salon.SalonID })[0];
                                $scope.salonFav.Favourite = true;
                                $scope.newAddedFavs.push($scope.salonFav.SalonID);
                                OrdersService.GetReservationCount($scope.authentication.userName, false).then(function (result) {
                                    $scope.counts.reservationCount = result[0];
                                    $scope.counts.favCount = result[1];
                                });
                            }).finally(function () {
                                $scope.hideLoader();
                            });
                        }
                        else {
                            alert('Вече сте добавили салона като любим!');
                        }
                        break;
                    case 1:
                        $state.go('app.salon-detail', { salonId: salon.SalonID });
                        break;
                    default:

                }
                return true;
            }
        });

        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 20000);

    };
})
