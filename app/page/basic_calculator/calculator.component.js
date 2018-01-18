var fs = require('fs');

angular.module('CalculatorApp', [
    'ui-notification',
    'ui.bootstrap',
    // 'ngRoute'
])
    .controller('CalculatorController', function (
        $scope,
        $uibModal,
        Notification
    ) {

        var THIS = this;
        $scope.objValue = {
            total: 0,
            inputA: 0,
            inputB: 0
        };

        var pathStoredFile = './app/tempFile/localFile.txt';

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

        $scope.saveFile = function () {
            try {
                if (!$scope.objValue.inputA || !$scope.objValue.inputB || !$scope.objValue.type || $scope.objValue.total == 0) {
                    Notification.error({ message: "Can't save data. Please fill input for calculate." })
                } else {
                    fs.writeFileSync(pathStoredFile, JSON.stringify($scope.objValue), 'utf-8');
                    Notification.success({ message: "Data saved." })
                }
            }
            catch (e) {
                alert('Failed to save the file !');
            }
        }

        $scope.loadFile = function () {
            try {
                if (fs.existsSync(pathStoredFile)) {
                    $scope.objValue = JSON.parse(fs.readFileSync(pathStoredFile, 'utf-8'));
                } else {
                    Notification.warning({ message: "Don't have any data for load." })

                }
            }
            catch (e) {
                alert('Failed to save the file !');
            }
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

    })
