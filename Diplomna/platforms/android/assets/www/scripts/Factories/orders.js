/// <reference path="angular.js" />

angular.module('ordersService', [])

    .factory('OrdersService', function ($http, $q) {

        var urlBase = 'http://localhost:20000/api/';
        return {
            saveOrder: function (order) {
                var deferred = $q.defer();
                $http.post(
                        urlBase + 'Reserve', order
                    ).
                    success(function (data) {

                        deferred.resolve(data);

                    }).
                    error(function () {
                        deferred.resolve({ success: false });
                    });

                return deferred.promise;
            },
            getReservations: function (type, username) {
                var deferred = $q.defer();
                promise = $http.get(urlBase + 'Reserve/' + type + '/' + username).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    deferred.resolve(response.data);
                });

                return deferred.promise;
            },
            getServicesById: function (id, type) {
                var deferred = $q.defer();

                type = type || 1;

                promise = $http.get(urlBase + 'Reserve/GetServicesById/' + id + '/' + type).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    deferred.resolve(response.data);
                });

                return deferred.promise;
            },
            GetReservationCount: function (username, isAdmin) {
                var deferred = $q.defer();
                promise = $http.get(urlBase + 'Reserve/GetReservationCount/' + username + '?isAdmin=' + isAdmin).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    deferred.resolve(response.data);
                });

                return deferred.promise;
            },
            annulOrder: function (order) {
                var deferred = $q.defer();
                $http.put(
                        urlBase + 'Reserve/' + order.UniqueID, order
                    ).
                    success(function (data) {
                        deferred.resolve({ success: true });
                        deferred.resolve(data);

                    }).
                    error(function (response) {
                        if (response.status === 409) {
                            alert('Възникна проблем! Статусът не резервацията не е променен!');
                        }
                        deferred.resolve({ success: false });
                    });

                return deferred.promise;
            },
            rejectOrder: function (order) {
                var deferred = $q.defer();
                $http.put(
                        urlBase + 'Reserve/' + order.UniqueID, order
                    ).
                    success(function (data) {
                        deferred.resolve({ success: true });
                        deferred.resolve(data);

                    }).
                    error(function (response) {
                        if (response.status === 409) {
                            alert('Възникна проблем! Статусът не резервацията не е променен!');
                        }
                        deferred.resolve({ success: false });
                    });

                return deferred.promise;
            },
            acceptOrder: function (order) {
                var deferred = $q.defer();
                $http.put(
                        urlBase + 'Reserve/' + order.UniqueID, order
                    ).
                    success(function (data) {
                        deferred.resolve({ success: true });
                        deferred.resolve(data);

                    }).
                    error(function (response) {
                        if (response.status === 409) {
                            alert('Възникна проблем! Статусът не резервацията не е променен!');
                        }
                        deferred.resolve({ success: false });
                    });

                return deferred.promise;
            },
        }
    })