fs = require('fs');
fs.readFile('api.err', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var str = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);

  var count = 0;
  var i;

  var errRegex = [
    /error:(\s+)Soap.request:(\s+)Error:(\s+)ETIMEDOUT/,
    /error:(\s+)Soap.request:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
    /error:(\s+)Soap.request:(\s+)Error:(\s+)connect(\s+)ECONNREFUSED/,
    /error:(\s+)Soap.request:(\s+)Error:(\s+)read(\s+)ECONNRESET/,
    /error:(\s+)Soap.request:(\s+)parseString:(\s+)Invalid(\s+)XML(\s+)Error./,
    /error:(\s+)Soap.request(\s+)fail/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)ETIMEDOUT/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)Unknown(\s+)Error/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)connect(\s+)ECONNREFUSED/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)read(\s+)ECONNRESET/,
    /error:(\s+)Ureg.inquirePromoRecurring:(\s+)Error:(\s+)An(\s+)unexpected(\s+)InvalidXMLError(\s+)occurred./,
    /error:(\s+)Ureg.inquirePackages:(\s+)Error:(\s+)ETIMEDOUT/,
    /error:(\s+)Ureg.inquirePackages:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
    /error:(\s+)Ureg.unsubscribePackage:(\s+)Error:(\s+)ETIMEDOUT/,
    /error:(\s+)Ureg.unsubscribePackage:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
    /error:(\s+)Ureg.unsubscribePackage:(\s+)Error:(\s+)Unknown(\s+)Error/,
    /error:(\s+)Ureg.register:(\s+)Error:(\s+)Unknown(\s+)Error/,
    /error:(\s+)Ureg.register:(\s+)Error:(\s+)An(\s+)unexpected(\s+)InvalidXMLError(\s+)occurred./,
    /error:(\s+)Ureg.register:(\s+)Error:(\s+)ETIMEDOUT/,
    /error:(\s+)Ureg.register:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
    /error:(\s+)Ureg.register:(\s+)Error:(\s+)connect(\s+)ECONNREFUSED/,
    //More errors to follow
    /error:(\s+)Unable(\s+)to(\s+)parse(\s+)HTTP(\s+)body-(\s+)error(\s+)occurred/,
    /error:(\s+)Package.index:(\s+)Error:(\s+)Error(\s+)loading(\s+)packages/,
    /error:(\s+)Package.index:(\s+)Error:(\s+)Error(\s+)loading(\s+)subscriptions/,
    /error:(\s+)Package.index:(\s+)Error:(\s+)Unable(\s+)to(\s+)unsubscribe/,
    /error:(\s+)Subscription.adc_on:(\s+)Error:(\s+)Unable(\s+)to(\s+)unsubscribe/,
    /error:(\s+)Subscription.adc_on:(\s+)Error:(\s+)Error(\s+)loading(\s+)subscriptions/,
    /error:(\s+)Subscription.create/,
    /error:(\s+)Subscription.create: Error: Unable to unsubsribe/,
    /error:(\s+)MobilePackage.subscribe:(\s+)Missing(\s+)Required(\s+)Paramater/, //(promo_id)
    //More errors here
    /error:(\s+)Sending(\s+)500(\s+)\(\"Server(\s+)Error\"\)(\s+)response/,
  ];



  var errString = [
    "error: Soap.request: Error: ETIMEDOUT",
    "error: Soap.request: Error: ESOCKETTIMEDOUT",
    "error: Soap.request: Error: connect ECONNREFUSED",
    "error: Soap.request: Error: read ECONNRESET",
    "error: Soap.request: parseString: Invalid XML Error.",
    "error: Soap.request fail",
    "error: Ureg.inquirePromoRecurring: Error: ETIMEDOUT",
    "error: Ureg.inquirePromoRecurring: Error: Unknown Error",
    "error: Ureg.inquirePromoRecurring: Error: ESOCKETTIMEDOUT",
    "error: Ureg.inquirePromoRecurring: Error: connect ECONNREFUSED",
    "error: Ureg.inquirePromoRecurring: Error: read ECONNRESET",
    "error: Ureg.inquirePromoRecurring: Error: An unexpected InvalidXMLError occurred.",
    "error: Ureg.inquirePackages: Error: ETIMEDOUT",
    "error: Ureg.inquirePackages: Error: ESOCKETTIMEDOUT",
    "error: Ureg.unsubscribePackage: Error: ETIMEDOUT",
    "error: Ureg.unsubscribePackage: Error: ESOCKETTIMEDOUT",
    "error: Ureg.unsubscribePackage: Error: Unknown Error",
    "error: Ureg.register: Error: Unknown Error",
    "error: Ureg.register: Error: An unexpected InvalidXMLError occurred.",
    "error: Ureg.register: Error: ETIMEDOUT",
    "error: Ureg.register: Error: ESOCKETTIMEDOUT",
    "error: Ureg.register: Error: connect ECONNREFUSED",
    "error: Unable to parse HTTP body- error occurred",
    "error: Package.index: Error: Error loading packages",
    "error: Package.index: Error: Error loading subscriptions",
    "error: Package.index: Error: Unable to unsubscribe",
    "error: Subscription.adc_on: Error: Unable to unsubscribe",
    "error: Subscription.adc_on: Error: Error loading subscriptions",
    "error: Subscription.create",
    "error: Subscription.create: Error: Unable to unsubsribe",
    "error: MobilePackage.subscribe: Missing Required Paramater",
    "error: Sending 500 (\"Server Error\") response",
  ];

  var errCount = Array.apply(null, Array(errRegex.length)).map(Number.prototype.valueOf,0);

  for(i=0; i<str.length; i++){

    var j;
    var found = undefined;
    for(j=0; j<errRegex.length; j++){
      if(!found){

        found = str[i].match(errRegex[j]);

        if(found){
          errCount[j]++;
          break;
        }
      }
    }

    if(found){
      count++;
    } else{
      var split = str[i].split('\n', 2);
      //console.log(split[0]);
      console.log(str[i])
    }

  }

  //print errors
  for(i=0; i<errRegex.length; i++){
    console.log(errString[i] + ' -> ' + errCount[i]);
  }

  // for(i=0; i<errRegex.length; i++){
  //   console.log(errRegex[i].source.replace(/\(\\s\+\)/g  , " ").replace(/\\/g,""));
  // }

  console.log('Number of timestamps: ', str.length);
  console.log('Number of errors: ', count);

});
