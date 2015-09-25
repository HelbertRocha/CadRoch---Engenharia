/**
 * Created by Opstrup on 14/09/15.
 */
'use strict';

angular.module('docsys-phonegap')

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/homeView.html',
        controller: 'HomeCtrl'
      });
  }])

  .controller('HomeCtrl', ['$location',
    '$scope',
    '$ionicModal',
    'authenticationServices',
    'userBackendApi',
    '$cordovaFileTransfer',
    '$state',
    '$cordovaCamera',
    '$ionicPlatform',
    function ($location,
              $scope,
              $ionicModal,
              authenticationServices,
              userBackendApi,
              $cordovaFileTransfer,
              $state,
              $cordovaCamera,
              $ionicPlatform) {

      /**
       * This function gets called when the controller get loaded into memory.
       * It sets up all the variables for the controller and creates the modal view,
       * which is used for creating new users.
       */
      $scope.init = function () {
        $scope.userIsAuthorised = false;
        $scope.userList = {};
        $scope.user = {};
        $scope.newuser = {};
        $scope.newuser.picture = "http://www.wallstreetotc.com/wp-content/uploads/2014/10/facebook-anonymous-app.jpg";
        $scope.hideSuccessMessage = true;
        $scope.successMessage = "New user created";
        $scope.profilePhotoTaken = false;
        initErrorMessages();
        createModalView();
      };

      /**
       * This function sets up the error messages.
       */
      function initErrorMessages() {
        $scope.hideErrorMessage = true;
        $scope.errorMessage = "";
        $scope.modalHideErrorMessage = true;
        $scope.modalErrorMessage = "";
      };

      /**
       * This function creates the modal view for the create new user form.
       */
      function createModalView() {
        $ionicModal.fromTemplateUrl('templates/createNewUserView.html', {
          scope: $scope
        }).then(function (modal) {
          $scope.createNewUserView = modal;
        });
      };

      $scope.showCreateNewUserView = function () {
        $scope.createNewUserView.show();

        // Clearing possible error messages on home view
        $scope.showErrorMessage("", false);
        $scope.hideErrorMessage = true;
      };

      $scope.hideCreateNewUserView = function () {
        $scope.createNewUserView.hide();

        // @todo should clear all text fields on exit
        // Clearing possible error messages on home view
        $scope.showErrorMessage("", true);
        $scope.modalHideErrorMessage = true;
      };

      $scope.showErrorMessage = function (message, modalError) {
        if (modalError) {
          $scope.modalHideErrorMessage = false;
          $scope.modalErrorMessage = message;
        } else {
          $scope.hideErrorMessage = false;
          $scope.errorMessage = message;
        }
      };

      /**
       * This function first checks if the user has filled out the username and password fields
       * after get make at GET request to the userBackendApi. On success GET, it then uses the
       * authenticationServices to check if the given user is authenticated.
       * If the check passes it redirects the user to the activity screen else it shows the
       * "username or password is not correct".
       * @todo make a error msg for unsuccessful GET request.
       */
      $scope.logIn = function () {
        if ($scope.user.username && $scope.user.password) {
          userBackendApi.query().$promise.then(function (userList) {
            $scope.userList = userList;
            if (authenticationServices.isUserAuthenticated($scope.userList, $scope.user)) {
              $scope.userIsAuthorised = true;
              $state.go('activity');
              // @todo clear error msg with successful login
            } else {
              $scope.showErrorMessage("Username or password is not correct", false);
            }
          })
        } else {
          $scope.showErrorMessage("Please fill out username and password", false);
        }
      };

      /**
       * This function creates a new user and postes all user information to the server
       * First it checks if the user has taken a profile picture and if the user information is valid.
       * It passes it POSTs all the information to the server and unloads the profile picture.
       */
      $scope.createNewUser = function () {
          // @todo check if user has taken a profile picture and upload picture here!
        if (authenticationServices.autehnticateNewUser($scope.newuser)) {
            userBackendApi.save($scope.newuser);
            $scope.hideCreateNewUserView();
            $scope.hideSuccessMessage = false;
          // Call save on userBackendApi and close modal view

          var options = {
            fileKey: "picture",
            fileName: "image.jpeg",
            chunkedMode: false,
            mimeType: "image/jpeg"
          };

          $cordovaFileTransfer.upload("http://192.168.1.46/docsys/public/profilePhotos", $scope.newuser.picture, options).then(function(result) {
            console.log("SUCCESS: " + JSON.stringify(result.response));
          }, function(err) {
            // write error msg here for user
            console.log(err);
            console.log("ERROR: " + JSON.stringify(err));
          });


        } else {
          $scope.showErrorMessage('Please fill all fields', true);
        }
      };

      /**
       * This function takes a profile picture for the user
       */
      $scope.takeProfilePicture = function () {
        // check if the device is ready for taking photos

        $ionicPlatform.ready(function () {
          var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };

          $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.newuser.picture = "data:image/jpeg;base64," + imageData;
            $scope.profilePhotoTaken = true;
          }, function (err) {
            console.log(err);
          });

        });
      };

      $scope.init();
    }]);
