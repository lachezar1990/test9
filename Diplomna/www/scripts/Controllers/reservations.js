app.controller('ReservationsCtrl', function ($scope, OrdersService, $ionicModal, $filter, $ionicPopup) {

    OrdersService.getReservations(2, $scope.authentication.userName).then(function (result) {
        $scope.reservations = result;
    });

    var imagePath = "http://localhost:20000/Images/SalonImages/";

    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    $scope.getPlural = function (count) {
        return count == 1 ? 'а' : 'и';
    };

    $scope.openDetailsModal = function (id) {

        $scope.reservation = $filter('filter')($scope.reservations, { OrderID: id })[0];

        OrdersService.getServicesById($scope.reservation.OrderID).then(function (result) {
            $scope.services = result;
        }).then(function () {
            $ionicModal.fromTemplateUrl('templates/reservation-details-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.modal.show();
                console.log($scope.services);
            });

        });

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

    // Triggered on a button click, or some other target
    $scope.annulRes = function (guid) {
        $scope.resForAnnul = $filter('filter')($scope.reservations, { UniqueID: guid })[0];
        $scope.rejByUserReason = {};
        $scope.emptyComment = false;

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            templateUrl: 'templates/AnnulPopup.html',
            title: 'Анулиране на резервация №' + $scope.resForAnnul.OrderID,
            scope: $scope,
            buttons: [
              { text: 'Отказ' },
              {
                  text: '<b>Анулирай</b>',
                  type: 'button-assertive',
                  onTap: function (e) {
                      if (!$scope.rejByUserReason.comment) {
                          //don't allow the user to close unless he enters wifi password
                          $scope.emptyComment = true;
                          e.preventDefault();
                      } else {
                          return $scope.rejByUserReason.comment;
                      }
                  }
              }
            ]
        });
        myPopup.then(function (result) {
            if (result) {
                var resForSend = $scope.resForAnnul;
                resForSend.RejectedByUser = true;
                resForSend.RejectedByUserReason = result;
                resForSend.RejectedBy = $scope.authentication.userName;

                OrdersService.annulOrder(resForSend).then(function (data) {
                    if (data.success) {
                        $filter('filter')($scope.reservations, { UniqueID: guid })[0] = resForSend;
                        console.log(data);
                    }
                    else {
                        resForSend.RejectedByUser = false;
                        resForSend.RejectedByUserReason = null;
                        resForSend.RejectedBy = null;
                        alert('Възникна проблем! Статусът не резервацията не е променен!');
                    }
                });

                console.log('Tapped!', result);
            }
        });
    };
})