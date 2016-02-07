app.controller('AdminReservationsCtrl', function ($scope, OrdersService, $ionicModal, $filter,
    $ionicPopup, AdminService, $ionicPopover, $ionicTabsDelegate, $ionicHistory) {

    $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
    });
    $ionicHistory.clearCache();


    AdminService.getSalonsByUser($scope.authentication.userName).then(function (result) {
        $scope.salons = result;
        if (result[0]) {
            $scope.selectedSalon = result[0];
        }
    }).then(function () {
        if ($scope.salons[0]) {
            AdminService.getReservations(1, $scope.authentication.userName, $scope.selectedSalon.SalonID).then(function (result) {
                $scope.reservations = result;
            });
        }
    });

    $scope.selectedTab = function (index) {
        if ($scope.salons) {
            if ($scope.salons[0]) {
                AdminService.getReservations(index, $scope.authentication.userName, $scope.selectedSalon.SalonID).then(function (result) {
                    $scope.reservations = result;
                });
            }
        }
    };

    $scope.SalonClick = function (salon) {
        $scope.selectedSalon = salon;

        if ($scope.salons) {
            if ($scope.salons[0]) {
                AdminService.getReservations(($ionicTabsDelegate.selectedIndex() + 1), $scope.authentication.userName, $scope.selectedSalon.SalonID).then(function (result) {
                    $scope.reservations = result;
                });
            }
        }

        $scope.popover.hide();
    };

    $scope.doRefresh = function () {
        if ($scope.salons) {
            if ($scope.salons[0]) {
                AdminService.getReservations(($ionicTabsDelegate.selectedIndex() + 1), $scope.authentication.userName, $scope.selectedSalon.SalonID).then(function (result) {
                    $scope.reservations = result;
                });
            }
        }

        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    };

    $ionicPopover.fromTemplateUrl('templates/admin-salons.html', {
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

    var imagePath = "http://localhost:20000/Images/SalonImages/";

    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    $scope.getPlural = function (count) {
        return count == 1 ? 'а' : 'и';
    };

    $scope.openDetailsModal = function (id) {

        $scope.reservation = $filter('filter')($scope.reservations, { OrderID: id })[0];

        OrdersService.getServicesById($scope.reservation.OrderID, 2).then(function (result) {
            $scope.services = result;
        }).then(function () {
            $ionicModal.fromTemplateUrl('templates/admin-reservation-details-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.modal.show();
                console.log($scope.services);
            });

        });

    };

    $scope.call = function (number) {
        window.open('tel:' + number, '_system');
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        if ($scope.modal)
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

    // Triggered on a button click, or some other target
    $scope.rejectRes = function (guid) {
        $scope.resForReject = $filter('filter')($scope.reservations, { UniqueID: guid })[0];

        // An elaborate, custom popup
        var myPopup = $ionicPopup.confirm({
            template: 'Сигурни ли сте, че искате да откажете резервацията?',
            title: 'Отказ на резервация №' + $scope.resForReject.OrderID,
            cancelText: 'Отказ', // String (default: 'Cancel'). The text of the Cancel button.
            okText: 'Откажи', // String (default: 'OK'). The text of the OK button.
            okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
        });
        myPopup.then(function (result) {
            if (result) {
                var resForSend = $scope.resForReject;
                resForSend.Rejected = true;

                OrdersService.rejectOrder(resForSend).then(function (data) {
                    if (data.success) {
                        $filter('filter')($scope.reservations, { UniqueID: guid })[0] = resForSend;
                        console.log(data);
                    }
                    else {
                        resForSend.Rejected = false;

                        alert('Възникна проблем! Статусът не резервацията не е променен!');
                    }
                });

                console.log('Tapped!', result);
            }
        });
    };

    $scope.acceptRes = function (guid) {
        $scope.resForAccept = $filter('filter')($scope.reservations, { UniqueID: guid })[0];

        // An elaborate, custom popup
        var myPopup = $ionicPopup.confirm({
            template: 'Сигурни ли сте, че искате да потвърдите резервацията?',
            title: 'Потвърждение на резервация №' + $scope.resForAccept.OrderID,
            cancelText: 'Отказ', // String (default: 'Cancel'). The text of the Cancel button.
            okText: 'Потвърди', // String (default: 'OK'). The text of the OK button.
            okType: 'button-balanced', // String (default: 'button-positive'). The type of the OK button.
        });
        myPopup.then(function (result) {
            if (result) {
                var resForSend = $scope.resForAccept;
                resForSend.Accepted = true;

                OrdersService.acceptOrder(resForSend).then(function (data) {
                    if (data.success) {
                        $filter('filter')($scope.reservations, { UniqueID: guid })[0] = resForSend;
                        console.log(data);
                    }
                    else {
                        resForSend.Accepted = false;

                        alert('Възникна проблем! Статусът не резервацията не е променен!');
                    }
                });

                console.log('Tapped!', result);
            }
        });
    };

    // Triggered on a button click, or some other target
    $scope.didntCome = function (guid) {
        $scope.resForReject = $filter('filter')($scope.reservations, { UniqueID: guid })[0];

        // An elaborate, custom popup
        var myPopup = $ionicPopup.confirm({
            template: 'Сигурни ли сте, че клиентът не се е появил?',
            title: 'Резервация №' + $scope.resForReject.OrderID,
            cancelText: 'Отказ', // String (default: 'Cancel'). The text of the Cancel button.
            okText: 'Не се е явил', // String (default: 'OK'). The text of the OK button.
            okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
        });
        myPopup.then(function (result) {
            if (result) {
                var resForSend = $scope.resForReject;
                resForSend.DidntCome = true;

                OrdersService.rejectOrder(resForSend).then(function (data) {
                    if (data.success) {
                        $filter('filter')($scope.reservations, { UniqueID: guid })[0] = resForSend;
                        console.log(data);
                    }
                    else {
                        resForSend.DidntCome = false;

                        alert('Възникна проблем! Статусът не резервацията не е променен!');
                    }
                });

                console.log('Tapped!', result);
            }
        });
    };

    $scope.finished = function (guid) {
        $scope.resForAccept = $filter('filter')($scope.reservations, { UniqueID: guid })[0];

        // An elaborate, custom popup
        var myPopup = $ionicPopup.confirm({
            template: 'Сигурни ли сте, че искате да приключите резервацията?',
            title: 'Приключване на резервация №' + $scope.resForAccept.OrderID,
            cancelText: 'Отказ', // String (default: 'Cancel'). The text of the Cancel button.
            okText: 'Приключи', // String (default: 'OK'). The text of the OK button.
            okType: 'button-balanced', // String (default: 'button-positive'). The type of the OK button.
        });
        myPopup.then(function (result) {
            if (result) {
                var resForSend = $scope.resForAccept;
                resForSend.Finished = true;

                OrdersService.acceptOrder(resForSend).then(function (data) {
                    if (data.success) {
                        $filter('filter')($scope.reservations, { UniqueID: guid })[0] = resForSend;
                        console.log(data);
                    }
                    else {
                        resForSend.Finished = false;

                        alert('Възникна проблем! Статусът не резервацията не е променен!');
                    }
                });

                console.log('Tapped!', result);
            }
        });
    };
})
