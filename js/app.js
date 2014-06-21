(function() {
    var app = angular.module('ReviewNotifyApp',[]);
    app.factory('MyService', function () {
        var client = new Apigee.Client({
            orgName:'shivam.nagar', // Your Apigee.com username for App Services
            appName:'sandbox' // Your Apigee App Services app name
        });
        var reviewsQry = new Apigee.Collection({ "client":client, "type":"reviews", "qs": {
            "limit": 50,
            "ql": "order by modified desc"
        } });

        return {
            get: function (handle) {
                reviewsQry.fetch(handle);
            },
            failed: client.restoreCollection(localStorage.getItem('reviews')),
            set: function (review, handler) {
                reviewsQry.addEntity(review,handler);
            }
        };
    });

    app.controller("ReviewController", ['$scope','MyService',function($scope,MyService){
        $scope.reviews = [{ 'comments':'Loading...' }];
        $scope.review = {'rating':'0'};
        $scope.addReview = function(review){
            MyService.set(review, function(err,response){
                if (err) {
                    alert("write failed");
                } else {
                    $scope.loadReviews();
                    $scope.setReviewRating(0);

                }
            });
        };
        $scope.setReviewRating = function(star){
            $.map($('.divStars').children(),function(n,i){
                if(i<star) {n.classList.add('glyphicon-star'); n.classList.remove('glyphicon-star-empty'); return(n);}
                else {n.classList.add('glyphicon-star-empty'); n.classList.remove('glyphicon-star'); return(n)}
            })
            $scope.review.rating = star;
        };
        $scope.loadReviews = function(){
            var rotateAmt = 0;
            var animateHandle = setInterval(function(){
                rotateAmt +=10
                $("#btnReload span").css("transform","rotate("+rotateAmt+"deg)")
            }, 40);
            MyService.get(
                function(err, data) {
                    if (!err) {
                        console.log("read success");
                        $scope.reviews = data.entities;
                    } else {
                        $scope.reviews = [{'comments':'Error occured while fetching reviews.'}];
                    }
                    $scope.$apply();
                    clearInterval(animateHandle); rotateAmt = 0; $("#btnReload span").css("transform","rotate("+rotateAmt+"deg)");
                });
        };
    }]);
})();

$(document).ready(function(){
    $("#btnReload").click();
})