/// <reference path="angular.js" />

'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {

    var serviceBase = 'http://localhost:20000/';
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: ""
    };

    var _saveRegistration = function (registration) {

        _logOut();

        return $http.post(serviceBase + 'api/account/RegisterUser', registration).then(function (response) {
            return response;
        });

    };

    var _changePassword = function (change) {

        return $http.post(serviceBase + 'api/account/ChangePassword', change).then(function (response) {
            return response;
        });

    };

    var _login = function (loginData) {

        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        var deferred = $q.defer();

        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (data, status, headers, config) {
            $http.get(serviceBase + 'api/Account/GetRoles/' + loginData.userName).success(function (response) {

                var savedData = response;
                localStorageService.set('authorizationData', { token: data.access_token, userName: loginData.userName, roles: savedData });

                _authentication.isAuth = true;
                _authentication.userName = loginData.userName;
                _authentication.roles = savedData;

                _authentication.isInRole = {};
                _authentication.isInRole.isSalonAdmin = false;
                _authentication.isInRole.isUser = false;

                angular.forEach(_authentication.roles, function (item) {
                    if (item === 'SalonAdmin') {
                        _authentication.isInRole.isSalonAdmin = true;
                    }
                    else if (item === 'User') {
                        _authentication.isInRole.isUser = true;
                    }
                });

                deferred.resolve(data);
            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.roles = [];
        _authentication.isInRole = {};
    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
            if (authData.roles) {
                _authentication.roles = authData.roles;

                _authentication.isInRole = {};
                _authentication.isInRole.isSalonAdmin = false;
                _authentication.isInRole.isUser = false;

                angular.forEach(_authentication.roles, function (item) {
                    if (item === 'SalonAdmin') {
                        _authentication.isInRole.isSalonAdmin = true;
                    }
                    else if (item === 'User') {
                        _authentication.isInRole.isUser = true;
                    }
                });
            }
        }
        else {
            _authentication.isAuth = false;
            _authentication.userName = '';
            _authentication.roles = [];
            _authentication.isInRole = {};
        }
    }

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.changePassword = _changePassword;

    return authServiceFactory;
}]);