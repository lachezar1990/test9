/// <reference path="angular.js" />

var app = angular.module('ReserveMe', ['ionic', 'ngMessages', 'saloniService', 'servicesS', 'emplService',
    'timesService', 'ordersService', 'cnServices', 'saveService', 'favouritesService', 'adminService', 'commonServices', 'ngAnimate'
, 'LocalStorageModule', 'ngCordova'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('start', {
            cache: false,
            url: "/start",
            templateUrl: "templates/start-screen.html",
            controller: 'StartScreenController'
        })
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppController'
        })
        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html',
                    controller: 'NavCtrl'
                }
            }
        })
        .state('app.salon-detail', {
            url: '/salon/{salonId:int}',
            views: {
                'menuContent': {
                    templateUrl: 'templates/salon-details.html',
                    controller: 'SalonDetailCtrl'
                }
            }

        })
    .state('app.fav', {
        cache: false,
        url: '/fav',
        views: {
            'menuContent': {
                templateUrl: 'templates/fav.html',
                controller: 'FavCtrl'
            }
        }
    })
        .state('app.login', {
            cache: false,
            url: "/login",
            views: {
                'menuContent': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('app.register', {
            cache: false,
            url: "/register",
            views: {
                'menuContent': {
                    templateUrl: 'templates/register.html',
                    controller: 'RegisterController'
                }
            }
        })
        .state('app.change', {
            cache: false,
            url: "/change",
            views: {
                'menuContent': {
                    templateUrl: 'templates/change-password.html',
                    controller: 'ChangeController'
                }
            }
        })
        .state('app.conditions', {
            url: "/conditions",
            views: {
                'menuContent': {
                    templateUrl: 'templates/conditions.html'
                }
            }
        })
        .state('app.forus', {
            url: "/forus",
            views: {
                'menuContent': {
                    templateUrl: 'templates/forus.html'
                }
            }
        })
    .state('app.tabs', {
        cache: false,
        url: '/tabs/:salonId',
        views: {
            'menuContent': {
                templateUrl: 'templates/tabs.html',
                controller: 'ReserveCtrl'
            }
        }
    })
    .state('app.reservations', {
        cache: false,
        url: '/reservations',
        views: {
            'menuContent': {
                templateUrl: 'templates/reservations.html',
                controller: 'ReservationsCtrl'
            }
        }
    })
    .state('admin', {
        cache: false,
        url: "/admin",
        abstract: true,
        templateUrl: "templates/admin-master.html",
        controller: 'AdminSideMenuCtrl'
    })
        .state('admin.reservations', {
            cache: false,
            url: '/admin-reservations',
            views: {
                'adminContent': {
                    templateUrl: 'templates/admin-reservations.html',
                    controller: 'AdminReservationsCtrl'
                }
            }
        })
    $urlRouterProvider.otherwise('/start')

})
.config(function ($ionicConfigProvider, $httpProvider) {
    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
    $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
    $ionicConfigProvider.backButton.text('');
    //$ionicConfigProvider.backButton.previousTitleText('true');

    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(function ($ionicPlatform, $ionicPopup, $state, authService, $ionicHistory, $cordovaNetwork, $rootScope) {
    $ionicPlatform.registerBackButtonAction(function () {
        alert($state.current.name);
        if ($state.is('app.home')) { // your check here
            $ionicPopup.confirm({
                title: 'Изход',
                template: 'Сигурни ли сте, че искате да напуснете?',
                cancelText: 'Отказ', // String (default: 'Cancel'). The text of the Cancel button.
                okText: 'Добре', // String (default: 'OK'). The text of the OK button.
            }).then(function (res) {
                if (res) {
                    navigator.app.exitApp();
                }
            })
        }
        else {
            $ionicHistory.goBack();
        }
    }, 100);

    document.addEventListener("deviceready", function () {

        var type = $cordovaNetwork.getNetwork()

        var isOnline = $cordovaNetwork.isOnline()

        var isOffline = $cordovaNetwork.isOffline()


        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            var onlineState = networkState;
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            var offlineState = networkState;

            $ionicPopup.alert({
                title: "Нямате интернет",
                content: "Нямате свързаност към интернет."
            }).then(function (result) {
                ionic.Platform.exitApp();
            });
        })

    }, false);

    authService.fillAuthData();
});

app.controller('AppController', function ($scope, authService, OrdersService, $ionicLoading) {
    $scope.isSearchActive = false;

    $scope.ShowSearchInput = function () {
        $scope.isSearchActive = true;
    };

    $scope.HideSearchInput = function () {
        $scope.isSearchActive = false;
    };

    $scope.authentication = authService.authentication;

    $scope.counts = {};
    $scope.countOrdersAndFavs = function () {
        OrdersService.GetReservationCount($scope.authentication.userName, false).then(function (result) {
            $scope.counts.reservationCount = result[0];
            $scope.counts.favCount = result[1];
        });
    };
    if ($scope.authentication.isAuth) {
        $scope.countOrdersAndFavs();
    }
    else {
        $scope.counts.reservationCount = 0;
        $scope.counts.favCount = 0;
    }

    $scope.showLoader = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="android" />'
        });
    };
    $scope.hideLoader = function () {
        $ionicLoading.hide();
    };
})

app.controller('ServicesPageCtrl', function ($scope, ServicesService, $stateParams) {

    ServicesService.getAllBySalonId($stateParams.salonId).then(function (result) {
        $scope.services = result;
    });

    var imagePathServ = "http://localhost:20000/Images/ServiceImages/";

    $scope.getFullURLServ = function (name) {
        return imagePathServ + name;
    };
})
app.controller('SideMenuCtrl', function ($scope, $state, authService, $ionicHistory, $window) {


    $scope.logOut = function () {
        authService.logOut();
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $ionicHistory.clearCache();
        authService.fillAuthData();
        //$window.location.reload(true);
        $state.go('app.home', {}, { reload: true });
    };
})
app.controller('AdminSideMenuCtrl', function ($scope, OrdersService, authService, $ionicHistory, $state) {
    $scope.authentication = authService.authentication;

    OrdersService.GetReservationCount($scope.authentication.userName, true).then(function (result) {
        $scope.reservationCount = result[0];
    });

    $scope.logOut = function () {
        authService.logOut();

        $ionicHistory.clearCache();
        authService.fillAuthData();
        $state.go('app.home', {}, { reload: true });
    };
})
