app.controller('ReserveCtrl', function ($scope, $state, $stateParams, $ionicTabsDelegate,
    CityService, $ionicPopover, $ionicModal, ServicesService, $ionicPopup, EmplService, TimesService, SelectedSalon, OrdersService, $cordovaCalendar) {
    //$scope.salonId = $stateParams.salonId;
    $scope.currentStep = 1;
    $scope.tabsTitle = 'Лични данни';

    var now = new Date();
    var nowForLater = new Date();
    nowForLater.setMonth(now.getMonth() + 2);

    $scope.minDateValue = now.toISOString().split("T")[0];
    $scope.maxDateValue = nowForLater.toISOString().split("T")[0];

    console.log(SelectedSalon.get());

    $scope.salon = SelectedSalon.get();

    $scope.selectedEmpl;

    $scope.hasServices = false;
    $scope.datetime = {};

    $scope.onTabSelected = function (title) {
        $scope.tabsTitle = title;
    };

    ServicesService.getAllBySalonId($stateParams.salonId).then(function (result) {
        $scope.services = result;
    });

    EmplService.getAllBySalonId($stateParams.salonId).then(function (result) {
        $scope.employees = result;
    });


    var imagePath = "http://localhost:20000/Images/SalonImages/";

    $scope.getFullURL = function (name) {
        return imagePath + name;
    };

    var imagePathEmpl = "http://localhost:20000/Images/EmplImages/";

    $scope.getFullURLEmpl = function (name) {
        return imagePathEmpl + name;
    };

    var imagePathServ = "http://localhost:20000/Images/ServiceImages/";

    $scope.getFullURLServ = function (name) {
        return imagePathServ + name;
    };

    $scope.personalFormSubmit = function (form, newRes) {
        $scope.submitted = true;
        $scope.newRes = newRes;

        console.log(newRes);
        if (form.$valid && newRes.sex) {
            console.log(form);
            $scope.currentStep = 2;
            $scope.newRes = newRes;
            $ionicTabsDelegate.select(1);
        }
    };

    //TODO: за втората стъпка

    $scope.selectedServices = [];

    $scope.toggleChange = function () {

        $scope.hasServices = false;
        var totalPrice = 0;
        var totalTime = 0;
        var tempHour = 0;
        var tempMinute = 0;
        var hourMinutes = 60;
        $scope.selectedServices = [];

        angular.forEach($scope.services, function (service) {
            if (service.checked) {
                totalPrice += service.Price;
                tempHour = parseInt(service.Time.substring(0, 2));
                tempMinute = parseInt(service.Time.substring(3, 5));

                totalTime += (tempHour * hourMinutes) + tempMinute;

                $scope.selectedServices.push(service);
                $scope.hasServices = true;
            }
        });

        $scope.totalPrice = totalPrice;

        var totalHours = parseInt((totalTime / hourMinutes));
        var totalMinutes = (totalTime % hourMinutes);

        $scope.totalTime = (totalHours < 10 ? '0' : '') + totalHours + ':' + (totalMinutes < 10 ? '0' : '') + totalMinutes;
        console.log(totalPrice);
    }

    $scope.servicesFormSubmit = function () {
        if ($scope.hasServices) {
            $scope.currentStep = 3;
            $ionicTabsDelegate.select(2);
        }
        else {
            var alertPopup = $ionicPopup.alert({
                title: 'Предупреждение!',
                template: 'Трябва да изберете поне една услуга, за да може да продължите с резервацията!',
                buttons: [{ text: 'Добре', type: 'button-calm' }]
            });
            alertPopup.then(function (res) {
                console.log('Thank you for not eating my delicious ice cream cone');
            });
        }
    };

    $scope.datetimeFormSubmit = function (form, datetime) {
        if (form.$valid) {
            if ($scope.selectedTime) {
                console.log(datetime);
                $scope.currentStep = 4;
                $scope.datetime = datetime;
                $ionicTabsDelegate.select(3);
            }
            else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Предупреждение!',
                    template: 'Трябва да изберете час за вашата услуга!',
                    buttons: [{ text: 'Добре', type: 'button-calm' }]
                });
                alertPopup.then(function (res) {
                    console.log('Thank you for not eating my delicious ice cream cone');
                });
            }
        }
    };


    $scope.EmplClick = function (empl) {
        $scope.selectedEmpl = empl;

        $scope.popover.hide();
    };

    $scope.EmplEmptyClick = function () {
        $scope.selectedEmpl = null;

        $scope.popover.hide();
    }

    $ionicPopover.fromTemplateUrl('templates/workers-popover.html', {
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

    //избор на час

    $ionicModal.fromTemplateUrl('templates/times-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.showLoader();
        TimesService.getAll($scope.datetime.date, $stateParams.salonId, (!$scope.datetime.dontCare ? $scope.selectedEmpl.EmployeeID : -1),
            $scope.datetime.dontCare, $scope.totalTime).then(function (result) {
                if (result.Result === 'OK') {
                    $scope.times = result;
                    $scope.showHours = true;
                    console.log(result);
                    $scope.modal.show();
                }
                else if (result.Result === 'Holiday') {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Няма час!',
                        template: 'Избраният ден е почивен за служителя или салона!',
                        buttons: [{ text: 'Добре', type: 'button-assertive' }]
                    });
                }
                else if (result.Result === 'No schedule') {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Няма час!',
                        template: 'За съжаление няма планирани часове!',
                        buttons: [{ text: 'Добре', type: 'button-assertive' }]
                    });
                }
            }).finally(function () {
                $scope.hideLoader();
            });

    };

    $scope.selectTime = function (time) {
        $scope.selectedTime = time;
        $scope.modal.hide();
    }

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

    //запазване

    $scope.conditionsChecked = {
        value: false
    };

    $scope.calendarEvent = {
        value: true
    };

    //$scope.badge1 = $scope.currentStep > 1 ? '\u2713' : '';

    $scope.reserve = function () {
        var reserveData = {};
        var problem = false;

        if ($scope.newRes) {
            reserveData.SalonID = $stateParams.salonId;
            reserveData.FirstName = $scope.newRes.firstname;
            reserveData.LastName = $scope.newRes.lastname;
            reserveData.Phone = $scope.newRes.phone;
            reserveData.Sex = $scope.newRes.sex;
            reserveData.MoreInfo = $scope.newRes.moreInfo;
        }
        else {
            problem = true;
        }

        if ($scope.selectedServices) {
            angular.forEach($scope.selectedServices, function (service) {
                if ($scope.selectedEmpl) {
                    service.EmployeeID = $scope.selectedEmpl.EmployeeID;
                    service.DontCare = false;
                }
                else {
                    service.DontCare = true;
                }
            });

            reserveData.Services = $scope.selectedServices;
        }
        else {
            problem = true;
        }

        if ($scope.datetime && $scope.selectedTime.StartTime && $scope.selectedTime.EndTime) {
            var notUtc = moment($scope.datetime.date);
            notUtc = notUtc.local();
            reserveData.Date = notUtc.utc();
            reserveData.StartTime = $scope.selectedTime.StartTime;
            reserveData.EndTime = $scope.selectedTime.EndTime;
        }
        else {
            problem = true;
        }

        if (!problem) {
            if ($scope.conditionsChecked.value) {
                if ($scope.authentication.isAuth) {
                    reserveData.UserName = $scope.authentication.userName;
                }
                OrdersService.saveOrder(reserveData).then(function (data) {
                    console.log(data);
                    OrdersService.GetReservationCount($scope.authentication.userName, false).then(function (result) {
                        $scope.counts.reservationCount = result[0];
                        $scope.counts.favCount = result[1];
                    });
                    //добавяне на събитие в календара
                    if ($scope.calendarEvent.value) {

                        var tempStartHour = parseInt(reserveData.StartTime.substring(0, 2));
                        var tempStartMinute = parseInt(reserveData.StartTime.substring(3, 5));
                        var tempEndHour = parseInt(reserveData.EndTime.substring(0, 2));
                        var tempEndMinute = parseInt(reserveData.EndTime.substring(3, 5));
                        var startDateTime = new Date($scope.datetime.date.getFullYear(), $scope.datetime.date.getMonth(), $scope.datetime.date.getDate(), tempStartHour, tempStartMinute, 0, 0, 0);
                        var endDateTime = new Date($scope.datetime.date.getFullYear(), $scope.datetime.date.getMonth(), $scope.datetime.date.getDate(), tempEndHour, tempEndMinute, 0, 0, 0);
                        $cordovaCalendar.createEvent({
                            title: 'Резервация в салон',
                            location: $scope.salon.SalonName,
                            notes: 'Имате резервация в салона',
                            startDate: startDateTime.toISOString(),
                            endDate: endDateTime.toISOString()
                        }).then(function (result) {
                            console.log(startDateTime.toISOString() + ' ' + endDateTime.toISOString() + ' дата' + reserveData.Date);
                        }, function (err) {
                            alert("Възникна грешка: " + err);
                        });

                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Успех!',
                        template: 'Вие успешно запазихте час!',
                        buttons: [{ text: 'Добре', type: 'button-calm' }]
                    });
                    alertPopup.then(function (res) {
                        if ($scope.authentication.isAuth) {
                            $state.go('app.reservations');
                        }
                        else {
                            $state.go('app.home');
                        }
                    });
                })
                console.log(reserveData);
            }
            else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Условия!',
                    template: 'За да запазите успешно, вие трябва да се съгласите с общите условия!',
                    buttons: [{ text: 'Добре', type: 'button-assertive' }]
                });
            }
        }
        else {
            var alertPopup = $ionicPopup.alert({
                title: 'Грешка!',
                template: 'Възникна непредвидена грешка!',
                buttons: [{ text: 'Добре', type: 'button-assertive' }]
            });
        }
    }
})