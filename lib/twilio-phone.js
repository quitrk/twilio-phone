var errorCodes = {
  noPhoneNumbersAvailable: 21452
};

var twilioPhone = function (accountSid, authToken) {
  var twilio = require('twilio')(accountSid, authToken),
      Q = require('q'),
      phone = require('phone');

  function handleError (deferred, error) {
    deferred.reject(error);
    return deferred.promise;
  };

  function getAreaCode (phoneNumber) {
    //validate E164 format
    var validNumber = phone(phoneNumber);

    if (validNumber.length && validNumber[1] === 'USA') {
      //assuming US country code (+1) and 3 digits area code
      return validNumber[0].slice(2, 5);
    }
  };

  return {
    purchasePhoneNumber: function (phone) {
      var deferred = Q.defer(),
          nearPhoneNumber = phone.nearPhoneNumber,
          areaCode = getAreaCode(nearPhoneNumber);

      if (!areaCode) {
        return handleError(deferred, 'Phone number cannot be validated.');
      }

      twilio.incomingPhoneNumbers.create({ areaCode: areaCode })
        .then(function (result) {
          deferred.resolve(result.phone_number);
        })
        .catch(function (error) {
          if (error.code !== errorCodes.noPhoneNumbersAvailable) {
            return handleError(deferred, error);
          }
        
          twilio.availablePhoneNumbers('US').local.get({ NearNumber: nearPhoneNumber })
            .then(function (data) {
              return twilio.incomingPhoneNumbers.create({ phoneNumber: data.availablePhoneNumbers[0].phone_number });
            })
            .then(function (result) {
              deferred.resolve(result.phone_number);
            })
            .catch(function (error) {
              deferred.reject(error);
            })
        });

      return deferred.promise;
    },

    deleteAllPhoneNumbers: function () {
      var deferred = Q.defer();

      twilio.incomingPhoneNumbers.list()
        .then(function (result) {
          var promises = [];

          result.incomingPhoneNumbers.forEach(function (number) {
            var promise = twilio.incomingPhoneNumbers(number.sid).delete();

            promises.push(promise);
          });

          Q.all(promises).then(function (result) {
            deferred.resolve(result);
          }).catch(function (error) {
            return handleError(deferred, error);
          });
        }).catch(function (error) {
            return handleError(deferred, error);
        });
  
      return deferred.promise;
    }
  }
};

module.exports = twilioPhone;