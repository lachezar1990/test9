/// <reference path="angular.js" />

angular.module('saloniService', [])

    .factory('SaloniService', function ($q, $http) {

        var promise;
        var urlBase = 'http://localhost:20000/api/SalonsMainScreenMobiles';
        var myService = {
            getAll: function (cityId, nId, page, username) {
                var deferred = $q.defer();
                // $http returns a promise, which has a then function, which also returns a promise
                promise = $http.get(urlBase + '/' + cityId + '/' + nId + '/' + page + '/' + username).success(function (data, status, headers, config) {
                    // The then function here is an opportunity to modify the response
                    var results = [];
                    results.data = data;
                    results.headers = headers();
                    results.hasMore = headers('has-more');
                    results.status = status;
                    results.config = config;
                    console.log(results);

                    deferred.resolve(results);
                });

                // Return the promise to the controller
                return deferred.promise;
            },
            getSalonById: function (salonId, username) {

                // $http returns a promise, which has a then function, which also returns a promise
                promise = $http.get(urlBase + '/' + salonId + '?username=' + username).then(function (response) {
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