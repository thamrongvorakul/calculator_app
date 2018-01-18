angular.module('GlobalFunction', [])
    .factory('GlobalFunction', function (

        $http,
        $state,
        $templateCache,
        $q
    ) {

        var factory = {};
        var canceler = $q.defer();



        factory.httpPost = function (url, data, option, header, callback) {
            var handler = setTimeout(function () {
                canceler.resolve();
                canceler = $q.defer();
                console.info("Timeout");
            }, 60000);

            var _option = {
                method: 'POST',
                url: url,
                data: data,
                timeout: canceler.promise,
                headers: {
                    'uid': sessionStorage.getItem("UID"),
                    'ucode': sessionStorage.getItem("UCODE")
                }

            };
            if (option) {
                for (var key in option) {
                    if (option.hasOwnProperty(key)) {
                        _option[key] = option[key];
                    }
                }
            }
            if (header) {
                for (var key in header) {
                    if (header.hasOwnProperty(key)) {
                        _option.headers[key] = header[key];
                    }
                }
            }
            $http(_option)
                .then(function (result) {
                    if (result.data.status == "ERROR") {
                        callback(JSON.stringify(result.data.message, null, 4), null)
                    } else {
                        callback(null, result.data);

                    }
                }).catch(function (e) {
                    clearTimeout(handler);
                    callback(e, "Connection timeout");
                });
        };

        factory.sendLoadData = function (url, data, callback) {
            var url = url;
            var option = {};
            var header = {};
            factory.httpPost(url, data, option, header, function (err, result) {
                if (err) {
                    callback(err, result);
                } else {
                    callback(null, result)
                }
            });
        }

        
        factory.filterPaymentStatus = function (key) {
            var text = {
                "0": "Admin Checking",
                "1": "Waiting For Deliver",
                "2": "Delivering To Buyer",
                "3": "Goods Received",
                "4": "Rejected"
            };

            var classText = {
                "0": "label-info",
                "1": "label-warning",
                "2": "label-info",
                "3": "label-success",
                "4": "label-danger"
            }

            return {
                text: text[key],
                classText: classText[key]
            }
        }
        factory.filterWalletStatus = function (key) {
            var text = {
                "0": "Pending",
                "1": "Transfered",
                "2": "Rejected",
            };
            return {
                text: text[key]
            }
        }
        factory.buyerReportStatus = function (key) {
            
            var text = {
                "Processing": "In Progress",
                "Closed": "Closed",
            };
            var classText = {
                "Processing" : "label-info",
                "Closed" : "label-danger"
            }
            return {
                text: text[key],
                classText : classText[key]
            }
        }

        return factory;


    });
