/**
 * Created by yuhwan on 2015. 10. 11..
 */
angular.module('StarterApp', ['starter.controllers', 'starter.services', 'ngMaterial', 'ngRoute', 'ngAnimate', 'chart.js'])

.config(function($routeProvider) {

    $routeProvider

        // Collection Page
        .when('/', {
            templateUrl: '../templates/collection-view.html',
            controller: 'collectionController'
        })

        // Ground Page
        .when('/ground', {
            templateUrl: '../templates/ground-view.html',
            controller: 'groundController'
        });


});

