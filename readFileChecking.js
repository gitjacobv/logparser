fs = require('fs');
fs.readFile('api.err', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var str = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);

  var count = 0;
  var i;

  for(i=0; i<str.length; i++){

    var errs = [
      //error:(\s+)Soap.request:(\s+)Error:(\s+)ETIMEDOUT/,
      //error:(\s+)Soap.request:(\s+)Error:(\s+)ESOCKETTIMEDOUT/,
      //error:(\s+)Soap.request:(\s+)Error:(\s+)connect(\s+)ECONNREFUSED/,
      //error:(\s+)Soap.request:(\s+)Error:(\s+)read(\s+)ECONNRESET/,
      //error:(\s+)Soap.request:(\s+)parseString:(\s+)Invalid(\s+)XML(\s+)Error./,
      //error:(\s+)Soap.request(\s+)fail/,
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
      /error:(\s+)Unable(\s+)to(\s+)parse(\s+)HTTP(\s+)body-(\s+)error(\s+)occurred/,
      /error:(\s+)Package.index:(\s+)Error:(\s+)Error(\s+)loading(\s+)packages/,
      /error:(\s+)Package.index:(\s+)Error:(\s+)Error(\s+)loading(\s+)subscriptions/,
      /error:(\s+)Package.index:(\s+)Error:(\s+)Unable(\s+)to(\s+)unsubscribe/,
      /error:(\s+)Subscription.adc_on:(\s+)Error:(\s+)Unable(\s+)to(\s+)unsubscribe/,
      /error:(\s+)Subscription.adc_on:(\s+)Error:(\s+)Error(\s+)loading(\s+)subscriptions/,
      /error:(\s+)Subscription.create/,
      /error:(\s+)Subscription.create: Error: Unable to unsubsribe/,
      /error:(\s+)MobilePackage.subscribe:(\s+)Missing(\s+)Required(\s+)Paramater/,
      /error:(\s+)Sending(\s+)500(\s+)\(\"Server(\s+)Error\"\)(\s+)response/,
    ]

    var j;
    var found = undefined;
    for(j=0; j<errs.length; j++){
      if(!found){

        found = str[i].match(errs[j]);

      } else{
        break;
      }
    }

    if(found){
      count++;
    } else{
      var split = str[i].split('\n', 2);
      if( !split[0].match(/error:(\s+)Soap.request:(\s+)Error:(\s+)ETIMEDOUT/) &&
          !split[0].match(/error:(\s+)Soap.request:(\s+)Error:(\s+)ESOCKETTIMEDOUT/) &&
          !split[0].match(/error:(\s+)Soap.request:(\s+)Error:(\s+)connect(\s+)ECONNREFUSED/) &&
          !split[0].match(/error:(\s+)Soap.request:(\s+)Error:(\s+)read(\s+)ECONNRESET/) &&
          !split[0].match(/error:(\s+)Soap.request:(\s+)parseString:(\s+)Invalid(\s+)XML(\s+)Error./) 
          //!split[0].match(/error:(\s+)Soap.request(\s+)fail/)
        ){
        console.log(split[0]);
      }

    }

  }

  console.log(str.length)
  console.log(count)

  // for(i=0; i<10; i++){
  //   console.log(str[i]);
  // }
});
