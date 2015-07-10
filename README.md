## Twilio-phone

### Info

The goal is to implement a node module which interacts with Twilio's API and purchases a phone number.
The module should accept a phone number and attempt to purchase another number in the same area code.
If no phone number is available in the same area code, it should purchase a phone number which is in the same state as the input phone number.

Additionally, the module should expose a function that deletes all phone numbers that are associacted with the Twilio Account. (While you're testing this implementation, don't worry about deleting pre-existing numbers)

### Getting Started

```javascript
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
```

### Test cases that might be helpful

Area code 619 is not exhausted yet.
Area code 212 is already exhausted (e.g. another phone number in NY needs to be purchased).
