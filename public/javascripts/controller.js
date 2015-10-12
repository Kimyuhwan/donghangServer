/**
 * Created by yuhwan on 2015. 10. 11..
 */
angular.module('starter.controllers', [])

.controller('collectionController', function($scope, $communication) {
    console.log('CollectionController Start');

    // global collection_dictionary
    var collection_dictionary = {};

    // get collections
    $communication.getCollections(function(res) {
        if(res.type) {
            console.log('Get Collection Success : # of collection = ' + res.data.length);

            var collections = res.data;
            var names = [];

            collections.forEach(function(collection) {
                names.push(collection.collection_id);
                collection_dictionary[collection.collection_id] = collection;
            });

            $scope.current_collection_id = collections[0].collection_id;
            $scope.current_collection = collections[0];

            // set collection names
            $scope.collections_name = names;
        }
    }, function() {
        console.log('error');
    });

    $scope.loadCollection = function(collection_id) {
       $scope.current_collection_id = collection_id;
       $scope.current_collection = collection_dictionary[collection_id];
    };

})

.controller('groundController', function($scope) {
  console.log('GroundController Start');
});