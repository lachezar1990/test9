/// <reference path="angular.js" />

angular.module('commonServices', [])

.factory('SelectedSalon', function ($rootScope) {
    var mem = [];

    return {
        store: function (value) {
            mem = value;
        },
        get: function () {
            return mem;
        }
    };
})
;