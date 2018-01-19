var fs = require('fs');

angular.module('CloudCalculatorApp', [
    'ui-notification',
    'ui.bootstrap',
    // 'ngRoute'
])
    .controller('CloudCalculatorController', function (
        $scope,
        $uibModal,
        Notification,
        $http
    ) {

        var THIS = this;
        $scope.objValue = {
            total: 0,
            isCloudSave: false
        };
        var pathStoredFile = './app/tempFile/';
        // var baseUrl = "http://35.186.153.185:4774/calc_test/";
        var baseUrl = "http://localhost:4774/calc_test/";

        $scope.saveAuthen = function (nameInput) {
            var _option = {
                method: 'POST',
                url: baseUrl + "public/pub_service/save_authen",
                data: { name: nameInput },
                headers: {}

            };

            $http(_option)
                .then(function (result) {
                    if (result.data.ERROR == '500') {
                        Notification.error({ message: "FAILED" })
                    } else {
                        $scope.objValue.authenName = nameInput;
                        $scope.uid = result.data.DATA._id;
                        $scope.nameInput = nameInput;
                        $scope.objValue.uid = result.data.DATA._id;
                        $scope.objValue.isCloudSave = result.data.DATA.cloudSave;
                    }
                }).catch(function (e) {
                    Notification.error({ message: "FAILED" })
                });
        };


        $scope.clearValue = function () {
            delete $scope.objValue.inputA;
            delete $scope.objValue.inputB;
            delete $scope.objValue.type;

            $scope.objValue.total = 0;
        }

        $scope.operateValue = function (inputA, inputB, type) {
            $scope.objValue.type = type;
            var validateData = validateFields(inputA, inputB);
            if (!validateData.correct) {
                Notification.error({ message: validateData.notiText })
            } else {
                if (type == 'plus') {
                    $scope.objValue.total = inputA + inputB;
                } else if (type == 'minus') {
                    $scope.objValue.total = inputA - inputB;
                } else if (type == 'by') {
                    $scope.objValue.total = (inputA * inputB).toFixed(2);
                } else if (type == 'divided') {
                    $scope.objValue.total = (inputA / inputB).toFixed(2);
                } else if (type == 'pow') {
                    $scope.objValue.total = Math.pow(inputA, inputB).toFixed(2);
                }
            }
        }

        $scope.inputChange = function (inputA, inputB, type) {
            $scope.objValue.type = type;

            if ($scope.objValue.type) {
                if (type == 'plus') {
                    $scope.objValue.total = inputA + inputB;
                } else if (type == 'minus') {
                    $scope.objValue.total = inputA - inputB;
                } else if (type == 'by') {
                    $scope.objValue.total = (inputA * inputB).toFixed(4);
                } else if (type == 'divided') {
                    $scope.objValue.total = (inputA / inputB).toFixed(4);
                } else if (type == 'pow') {
                    $scope.objValue.total = Math.pow(inputA, inputB);
                }
            }
        }

        $scope.saveData = function () {
            if (!$scope.objValue.inputA || !$scope.objValue.inputB || !$scope.objValue.type || $scope.objValue.total == 0) {
                Notification.error({ message: "Can't save data. Please fill input for calculate." })
            } else {
                if ($scope.objValue.isCloudSave) {
                    cloudSaveData();
                } else {
                    localSaveData();
                }
            }

        }

        function cloudSaveData() {
            var _option = {
                method: 'POST',
                url: baseUrl + "public/pub_service/save_data",
                data: $scope.objValue,
                headers: {}
            };

            $http(_option)
                .then(function (result) {
                    if (result.data.ERROR == '500') {
                        Notification.error({ message: "FAILED" })
                    } else {
                        Notification.success({ message: "Saved data with cloud service." })
                    }
                }).catch(function (e) {
                    Notification.error({ message: "FAILED" })
                });
        };

        function localSaveData() {
            try {
                fs.writeFileSync(pathStoredFile + $scope.objValue.uid + ".txt", JSON.stringify($scope.objValue), 'utf-8');
                Notification.success({ message: "Saved data with local file." })
            }
            catch (e) {
                alert('Failed to save the file !');
            }
        }
        $scope.loadSave = function () {
            if ($scope.objValue.isCloudSave) {
                cloudLoadSave();
            } else {
                localLoadSave();
            }
        }

        function localLoadSave() {
            try {
                if (fs.existsSync(pathStoredFile + $scope.objValue.uid + ".txt")) {
                    $scope.objValue = JSON.parse(fs.readFileSync(pathStoredFile + $scope.objValue.uid + ".txt", 'utf-8'));
                } else {
                    Notification.warning({ message: "Don't have any data for load." })
                }
            }
            catch (e) {
                alert('Failed to save the file !');
            }
        }

        function cloudLoadSave() {
            var modalHandler = $uibModal.open({
                templateUrl: '../tracking_save/tracking_save.html',
                size: 'sm',
                resolve: {
                    uid: function () {
                        return $scope.objValue.uid
                    },
                },
                controller: function ($scope, Notification, $uibModalInstance, uid) {
                    var THIS = this;
                    THIS.loading = false;

                    function getDataById() {
                        THIS.loading = true;

                        var data = JSON.stringify({uid : uid});
                        var _option = {
                            method: 'GET',
                            url: baseUrl + "public/pub_service/load_data/"+data,
                            headers: {}
                        };

                        $http(_option)
                            .then(function (result) {
                                THIS.loading = false;
                                if (result.data.ERROR == '500') {
                                    Notification.error({ message: "FAILED" })
                                } else {
                                    THIS.saveData = result.data.DATA;
                                }
                            }).catch(function (e) {
                                Notification.error({ message: "FAILED" })
                            });
                    }
                    getDataById();

                    THIS.selectRow = function (data) {
                        $uibModalInstance.close(data);
                    }
                },
                controllerAs: "THIS"
            });
            modalHandler.result.then(function (valResult) {
                if (valResult) {
                    $scope.objValue.inputA = valResult.inputA;
                    $scope.objValue.inputB = valResult.inputB;
                    $scope.objValue.type = valResult.type;
                    $scope.objValue.total = valResult.total;
                }
            });
        }
        function validateFields(inputA, inputB) {

            if (!inputA || !inputB) {
                if (!inputA && inputB) {
                    notiText = "Please fill Input A"
                } else if (inputA && !inputB) {
                    notiText = "Please fill Input B"
                } else {
                    notiText = "Please fill Input A and Input B"
                }
                return { correct: false, notiText: notiText }
            } else {
                return { correct: true, notiText: "" }
            }
        }

    }).directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
