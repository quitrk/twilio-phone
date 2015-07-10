const HOSTNAME = 'https://api.twilio.com';
const API = '/2010-04-01/Accounts/auth';
const INCOMING_PHONE_NUMBERS = '/IncomingPhoneNumbers';
const INCOMING_PHONE_NUMBERS_JSON = '/IncomingPhoneNumbers.json';
const AVAILABLE_PHONE_NUMBERS = '/AvailablePhoneNumbers';

var nock = require('nock');
var twilioPhone = require('../lib/twilio-phone')('auth', 'auth');
var expect = require('chai').expect;

describe('twilio-phone', function () {
  describe('purchasePhoneNumber', function () {
    it('should retrieve an error if phone number format is not valid', function (done) {
      var number = 'some number';
      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: number })
        .catch(function (error) {
          done();
        })
    });

    it('should retrieve available phone number from the same area code.', function (done) {
      var newNumber = '+16191210102';
      var nearNumber = '+16196210102';

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON)
        .reply(200, {
          phone_number: newNumber
        });

      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: nearNumber })
        .then(function (purchasedNumber) {
          expect(purchasedNumber).to.equal(newNumber);
          done();
        })
        .catch(function (error) {
          done(error)
        });
    });

    it('should retrieve an error if incomingPhoneNumbers post api call with area code retrieves an error other than 21452 (no more available phones).', function (done) {
      var newNumber = '+16466062898';
      var nearNumber = '+12126210102';

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          AreaCode: '212'
        })
        .reply(401, {
          code: 1452
        });

      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: nearNumber })
        .catch(function (error) {
          done()
      });
    });

    it('should retrieve an error if availablePhoneNumbers api call retrieves an error.', function (done) {
      var newNumber = '+16466062898';
      var nearNumber = '+12126210102';

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          AreaCode: '212'
        })
        .reply(401, {
          code: 21452
        });

      nock(HOSTNAME)
        .get(API + AVAILABLE_PHONE_NUMBERS + '/US/Local.json?NearNumber=' + encodeURIComponent(nearNumber))
        .reply(404);

      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: nearNumber })
        .catch(function (error) {
          done()
      });
    });

    it('should retrieve an error if incomingPhoneNumbers post api call with phone number retrieves an error.', function (done) {
      var newNumber = '+16466062898';
      var nearNumber = '+12126210102';

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          AreaCode: '212'
        })
        .reply(401, {
          code: 21452
        });
      
      nock(HOSTNAME)
        .get(API + AVAILABLE_PHONE_NUMBERS + '/US/Local.json?NearNumber=' + encodeURIComponent(nearNumber))
        .reply(200, {
          availablePhoneNumbers: [
            {
              phone_number: newNumber
            }
          ]
        });

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          PhoneNumber: newNumber
        })
        .reply(404);

      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: nearNumber })
        .catch(function (error) {
          done()
      });
    });

    it('should retrieve a nearby phone number if area code has no more available phone numbers.', function (done) {
      var newNumber = '+16466062898';
      var nearNumber = '+12126210102';

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          AreaCode: '212'
        })
        .reply(401, {
          code: 21452
        });

      nock(HOSTNAME)
        .get(API + AVAILABLE_PHONE_NUMBERS + '/US/Local.json?NearNumber=' + encodeURIComponent(nearNumber))
        .reply(200, {
          availablePhoneNumbers: [
            {
              phone_number: newNumber
            }
          ]
        });

      nock(HOSTNAME)
        .post(API + INCOMING_PHONE_NUMBERS_JSON, {
          PhoneNumber: newNumber
        })
        .reply(201, {
          phone_number: newNumber
        });

      twilioPhone.purchasePhoneNumber({ nearPhoneNumber: nearNumber })
        .then(function (purchasedNumber) {
          expect(purchasedNumber).to.equal(newNumber);
          done();
        })
        .catch(function (error) {
          done(error)
        });
      });
  });

  describe('deleteAllPhoneNumbers', function () {
    it('should retrieve all attached phone numbers and delete them', function (done) {
      nock(HOSTNAME)
        .get(API + INCOMING_PHONE_NUMBERS_JSON)
        .reply(201, {
          incomingPhoneNumbers: [
            {
              sid: '1'
            },
            {
              sid: '2'
            }
          ]
        });

      nock(HOSTNAME)
        .delete(API + INCOMING_PHONE_NUMBERS + '/1.json')
        .reply(204);

      nock(HOSTNAME)
        .delete(API + INCOMING_PHONE_NUMBERS + '/2.json')
        .reply(204);
       
      twilioPhone.deleteAllPhoneNumbers()
        .then(function (result) {
          expect(result.length).to.equal(2);
          expect(result[0]).to.equal(null);
          expect(result[1]).to.equal(null);

          done();
        })
        .catch(function (error) {
          done(error);
        })
    });

    it('should retrieve an error if incomingPhoneNumbers get api call retrieves an error', function (done) {
      nock(HOSTNAME)
        .get(API + INCOMING_PHONE_NUMBERS_JSON)
        .reply(404);

      twilioPhone.deleteAllPhoneNumbers()
        .catch(function (error) {
          done();
        })
    });

    it('should retrieve an error if any of the calls to delete retrieves an error.', function (done) {
      nock(HOSTNAME)
        .get(API + INCOMING_PHONE_NUMBERS_JSON)
        .reply(201, {
          incomingPhoneNumbers: [
            {
              sid: '1'
            },
            {
              sid: '2'
            }
          ]
        });

      nock(HOSTNAME)
        .delete(API + INCOMING_PHONE_NUMBERS + '/1.json')
        .reply(204);

      nock(HOSTNAME)
        .delete(API + INCOMING_PHONE_NUMBERS + '/2.json')
        .reply(404);
       
      twilioPhone.deleteAllPhoneNumbers()
        .catch(function (error) {
          done();
        })
    });
  });
}) 