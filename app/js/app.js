/*!
 * Webogram v0.7.0 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */

'use strict'
/* global Config, templateUrl */

var extraModules = []
if (Config.Modes.animations) {
  extraModules.push('ngAnimate')
}

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  'mediaPlayer',
  'toaster',
  'izhukov.utils',
  'izhukov.mtproto',
  'izhukov.mtproto.wrapper',
  'myApp.filters',
  'myApp.services',
  /*PRODUCTION_ONLY_BEGIN
  'myApp.templates',
  PRODUCTION_ONLY_END*/
  'myApp.directives',
  'myApp.controllers'
].concat(extraModules)).config(['$locationProvider', '$routeProvider', '$compileProvider', 'StorageProvider', function ($locationProvider, $routeProvider, $compileProvider, StorageProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|filesystem|chrome-extension|app):|data:image\//)
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|tg|mailto|blob|filesystem|chrome-extension|app):|data:/)

  /*PRODUCTION_ONLY_BEGIN
  $compileProvider.debugInfoEnabled(false)
  PRODUCTION_ONLY_END*/

  if (Config.Modes.test) {
    StorageProvider.setPrefix('t_')
  }

  $routeProvider.when('/', {template: '', controller: 'AppWelcomeController'})
  $routeProvider.when('/login', {templateUrl: templateUrl('login'), controller: 'AppLoginController'})
  $routeProvider.when('/im', {templateUrl: templateUrl('im'), controller: 'AppIMController', reloadOnSearch: false})
  $routeProvider.otherwise({redirectTo: '/'})
}])
    .factory('commonUtilService', function () {
    return {
        encryptByDES(message, key) {
            var message = message || '';
            var key = key || '111111111111111111111111';
            var keyHex = TCBSCryptoJS.enc.Utf8.parse(key);
            var encrypted = TCBSCryptoJS.DES.encrypt(message, keyHex, {
                iv: TCBSCryptoJS.enc.Utf8.parse('01234567'),
                mode: TCBSCryptoJS.mode.CBC,
                padding: TCBSCryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        },
        decryptByDES(ciphertext, key) {
            var message = message || '';
            var key = key || '111111111111111111111111';
            var keyHex = TCBSCryptoJS.enc.Utf8.parse(key);
            // direct decrypt ciphertext
            var decrypted = TCBSCryptoJS.DES.decrypt({
                ciphertext: TCBSCryptoJS.enc.Base64.parse(ciphertext)
            }, keyHex, {
                iv: TCBSCryptoJS.enc.Utf8.parse('01234567'),
                mode: TCBSCryptoJS.mode.CBC,
                padding: TCBSCryptoJS.pad.Pkcs7
            });

            return decrypted.toString(TCBSCryptoJS.enc.Utf8);
        }
    }
})
    .filter('aSite', function ($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(_host +'/'+ url);
        };
    });