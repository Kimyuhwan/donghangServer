/**
 * Created by yuhwan on 2015. 10. 12..
 */
angular.module('starter.services', [])

.factory('$communication', ['$http', function($http){

        var baseUrl = "http://128.199.239.83:3000/";

        return {
            getCollections: function(success, error) {
                $http.get(baseUrl + 'gesture_test/getcollection').success(success).error(error)
            }
        };
    }
])

.factory('$localstorage', ['$window', function($window) {
  return {
    setCollections: function(collections) {
      $window.localStorage['COLLECTIONS'] = collections;
    },
    getCollections: function() {
      return $window.localStorage['COLLECTIONS'];
    }
  }
}]);