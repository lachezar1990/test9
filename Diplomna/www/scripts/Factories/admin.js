/// <reference path="angular.js" />

angular.module('adminService', [])

    .factory('AdminService', function ($http, $q) {

        var urlBase = 'http://localhost:20000/api/';
        return {
            getSalonsByUser: function (username) {
                var deferred = $q.defer();
                promise = $http.get(urlBase + 'Salons/' + username).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    deferred.resolve(response.data);
                });

                return deferred.promise;
            },
            getReservations: function (type, username, id) {
                var deferred = $q.defer();
                promise = $http.get(urlBase + 'ReserveForAdmin/' + type + '/' + username + '/' + id).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    deferred.resolve(response.data);
                });

                return deferred.promise;
            }
        }
    })