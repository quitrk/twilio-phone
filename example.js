var twilioPhone = require('./lib/twilio-phone')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

twilioPhone.purchasePhoneNumber({nearPhoneNumber: '+16196210102'})
  .then(function(purchasedNumber) {
    console.log('Yeay - I am proud owner of ' + purchasedNumber);
  })
  .catch(function(error) {
    console.error('Aw crap.');
    console.error(error);
  });

twilioPhone.deleteAllPhoneNumbers()
  .then(function (result) {
    console.log('Successfully removed ' + result.length + ' phone numbers.');
  })
  .catch(function (error) {
    console.log(error);
  });