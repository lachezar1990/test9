/// <reference path="angular.js" />

angular.module('favouritesService', [])

.factory('FavouritesService', function ($http, $q) {

    var urlBase = 'http://localhost:20000/api/';
    return {
        addFavourite: function (fav) {
            var deferred = $q.defer();
            $http.post(
                    urlBase + 'Favourites', fav
                ).
                success(function (data) {

                    deferred.resolve(data);

                }).
                error(function () {
                    deferred.resolve({ success: false });
                });

            return deferred.promise;
        },
        getFavourites: function (username) {
            var deferred = $q.defer();
            promise = $http.get(urlBase + 'Favourites/' + username).then(function (response) {
                // The then function here is an opportunity to modify the response
                console.log(response);
                // The return value gets picked up by the then in the controller.
                deferred.resolve(response.data);
            });

            return deferred.promise;
        },
        delFavourite: function (id) {
            var deferred = $q.defer();
            promise = $http.delete(urlBase + 'Favourites/' + id).then(function (response) {
                // The then function here is an opportunity to modify the response
                console.log(response);
                // The return value gets picked up by the then in the controller.
                deferred.resolve(response.data);
            });

            return deferred.promise;
        }
    }
})