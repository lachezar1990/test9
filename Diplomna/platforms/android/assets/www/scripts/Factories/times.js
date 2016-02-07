/// <reference path="angular.js" />

angular.module('timesService', [])

    .factory('TimesService', function ($q, $http) {

        var promise;
        var urlBase = 'http://localhost:20000/api/FreeTimes';
        var myService = {
            getAll: function (datetime, salonId, emplId, DontCare, ServiceDur) {
                var data = {};
                data.DateTimeRes = datetime;
                data.SalonId = salonId;
                data.EmplId = emplId;
                data.DontCare = DontCare;
                data.ServiceDur = ServiceDur;

                console.log(data);
                // $http returns a promise, which has a then function, which also returns a promise
                promise = $http.get(urlBase + '/', {
                    params: data
                }).then(function (response) {
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