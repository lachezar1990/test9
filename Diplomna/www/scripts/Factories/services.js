/// <reference path="angular.js" />

angular.module('servicesS', [])

    .factory('ServicesService', function ($q, $http) {

        var promise;
        var urlBase = 'http://localhost:20000/api/ServicesForDetailsPages';
        var myService = {
            getAllBySalonId: function (salonId) {
                // $http returns a promise, which has a then function, which also returns a promise
                promise = $http.get(urlBase + '/' + salonId).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });

                // Return the promise to the controller
                return promise;
            },
            getServiceById: function (serviceId) {

                // $http returns a promise, which has a then function, which also returns a promise
                promise = $http.get(urlBase + '/' + serviceId).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    console.log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });


                // Return the promise to the controller
                return promise;
            }
        };
        return myService;

    })