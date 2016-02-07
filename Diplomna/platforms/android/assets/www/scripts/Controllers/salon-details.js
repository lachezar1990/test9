app.controller('SalonDetailCtrl', function ($scope, $stateParams, $ionicModal, SaloniService,
    SaveDataService, $state, $ionicScrollDelegate, $filter, SelectedSalon, FavouritesService, OrdersService) {
    var imagePath = "http://localhost:20000/Images/SalonImages/";

    var imagePathServ = "http://localhost:20000/Images/ServiceImages/";

    $scope.getFullURLServ = function (name) {
        return imagePathServ + name;
    };

    $scope.addCommentButtonVisible = true;

    $scope.commentsCount = 0;
    $scope.showLoader();
    SaloniService.getSalonById($stateParams.salonId, $scope.authentication.userName).then(function (result) {
        $scope.salon = result;
        $scope.commentsCount = $scope.salon.Comments.length;

        //скриване на бутона, ако вече потребителят е добавил коментар

        if ($scope.authentication.isAuth) {
            angular.forEach($scope.salon.Comments, function (item) {
                if (item.CreateBy === $scope.authentication.userName) {
                    $scope.addCommentButtonVisible = false;
                }
            });
        }
        else {
            $scope.addCommentButtonVisible = true;
        }

        var schedule = $scope.salon.SalonSchedule;

        var result = '';
        var i = 0;
        var weekdayNames = [
      "\u043f\u043d",
            "\u0432\u0442",
            "\u0441\u0440",
            "\u0447\u0442",
            "\u043f\u0442",
            "\u0441\u0431",
            "\u043d\u0434"
        ];

        var groupedTimes = [];
        var tempTimes = [];
        var remove = [];
        angular.forEach(schedule, function (item) {
            console.log(weekdayNames[item.DayOfWeek - 1]);
            console.log(item);
            for (j = 0; schedule.length > j; j++) {
                if ((item.StartTime === schedule[j].StartTime && item.EndTime === schedule[j].EndTime) && !schedule[j].Changed) {
                    tempTimes.push(schedule[j]);
                    remove.push(j); //от тук
                    console.log(schedule[j]);
                    console.log(schedule);
                    console.log(tempTimes);
                }
                
            }

            if (!item.Changed) {
                groupedTimes.push(tempTimes);

                angular.forEach(remove, function (index) {
                    schedule[index] = { 'Changed': 1 };
                });
            }
            tempTimes = [];
            remove = [];
            i++;
        });
        console.log('nakraq');
        console.log(schedule);
        console.log(groupedTimes);

        var tempText = '';
        var daysInArray = [];
        var textResult = [];

        angular.forEach(groupedTimes, function (array) {
            var currLength = array.length;
            var oneElement = currLength === 1;
            var hasDiffDays = false;
            for (var i = 0; i < currLength; i++) {
                if (oneElement) {
                    tempText = weekdayNames[array[i].DayOfWeek - 1] + ' : ' + $filter('limitTo')(array[i].StartTime, 5)
                        + ' - ' + $filter('limitTo')(array[i].EndTime, 5);
                }
                else {
                    daysInArray.push(weekdayNames[array[i].DayOfWeek - 1]);
                    if (i !== currLength - 1) {
                        if ((array[i].DayOfWeek + 1) !== array[i + 1].DayOfWeek) {
                            hasDiffDays = true;
                        }
                    }
                }
            }

            if (oneElement) {
                textResult.push(tempText);
            }
            else {
                if (hasDiffDays) {
                    textResult.push((daysInArray.join(", ") + ' : ' + $filter('limitTo')(array[0].StartTime, 5) + ' - '
                        + $filter('limitTo')(array[0].EndTime, 5)));
                }
                else {
                    textResult.push((daysInArray[0] + ' - ' + daysInArray[currLength - 1] + ' : ' + $filter('limitTo')(array[0].StartTime, 5) + ' - '
                        + $filter('limitTo')(array[0].EndTime, 5)))
                }
            }

            daysInArray = [];
        });
        console.log(textResult);

        $scope.workingTime = textResult;
    }).finally(function () {
        $scope.hideLoader();
    });

    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    $scope.showImages = function (index) {
        $scope.activeSlide = index;
        $scope.showModal('templates/modal-image.html');
    }

    $scope.addRating = {};
    $scope.addRating.rating1 = 0;
    $scope.addRating.comment = '';
    if ($scope.authentication.isAuth) {
        $scope.addRating.userName = $scope.authentication.userName;
    }
    else {
        $scope.addRating.userName = '';
    }
    $scope.rateFunction = function (rating) {
        //alert("Rating selected - " + rating);
    };

    $scope.showModal = function (templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }

    
    //коментари

    $ionicModal.fromTemplateUrl('templates/add-comment.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function (url) {
        $scope.showModal(url);
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.commentFormSubmit = function (form) {

        console.log(form);
        $scope.addRating.CreateBy = $scope.addRating.userName;
        $scope.addRating.SalonID = $stateParams.salonId;
        $scope.showLoader();
        SaveDataService.saveRating($scope.addRating).then(function (data) {
            //$scope.salon.Comments.unshift(data);
            //console.log($scope.salon.Comments);
            $scope.modal.hide();
            $scope.modal.remove();

            $scope.addRating = {};
            $scope.addCommentButtonVisible = false;
        }).then(function () {
            SaloniService.getSalonById($stateParams.salonId).then(function (result) {
                $scope.salon = result;
                $scope.commentsCount += 1;
            });
        }
        ).finally(function () {
            $scope.hideLoader();
        });

        //$ionicScrollDelegate.scrollTop(true);
    };

    $scope.reserveClick = function () {
        SelectedSalon.store($scope.salon);
    };

    $scope.addFavourite = function () {
        if (!$scope.salon.Favourite) {
            $scope.showLoader();
            var favToAdd = {};
            favToAdd.SalonID = $scope.salon.SalonID;
            favToAdd.CreateBy = $scope.authentication.userName;
            FavouritesService.addFavourite(favToAdd).then(function (data) {
                $scope.salon.Favourite = true;
                OrdersService.GetReservationCount($scope.authentication.userName, false).then(function (result) {
                    $scope.counts.reservationCount = result[0];
                    $scope.counts.favCount = result[1];
                });
            }).finally(function () {
                $scope.hideLoader();
            });
        }
    };

    $scope.openLink = function (link) {
        window.open(link, '_system', 'location=yes');
    }
})