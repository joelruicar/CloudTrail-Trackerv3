

// export function searchPairedS3(events) {
//     const filtered = events.filter(ev =>
//         ev.eventSource === "s3.amazonaws.com"
//     );
//     console.log(filtered, "Filtered S3 Events");
//     events.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
//     const pairs = [];
//     const used = new Set();
//     for (let i = 0; i < filtered.length; i++) {
//         const e = filtered[i];
        
//         if (e.eventName === "CreateBucket" && !used.has(e.eventID)) {
//             const runTime = new Date(e.eventTime);
//             const username = e.userIdentity_userName;
//             let matchedEvent = null;

//             for (let j = i + 1; j < filtered.length; j++) {
//                 const e2 = filtered[j];
//                 if (used.has(e2.eventID)) continue;

//                 const e2Time = new Date(e2.eventTime);
//                 const timeDiff = e2Time - runTime;

//                 if (
//                     e2.userIdentity_userName === username && 
//                     e2.eventName === "DeleteBucket" &&
//                     timeDiff >= 0
//                 ) {
//                     matchedEvent = { e2, timeDiff };
//                     break;
//                 }
//             }
//             if (matchedEvent) {
//                 pairs.push({
//                     username,
//                     run: e.eventTime,
//                     end: matchedEvent.e2.eventTime,
//                     durationMs: matchedEvent.timeDiff
//                 });
//                 used.add(e.eventID);
//                 used.add(matchedEvent.e2.eventID);
//             } else {
//                 pairs.push({
//                     username,
//                     run: e.eventTime,
//                     end: null,
//                     durationMs: null
//                 });
//                 used.add(e.eventID);
//             }
//         }
//     }
//     return pairs;
// }


 export function getRegions (type_service) {
      var _this = this;
      return new Promise(function(resolve, reject) {


        var token = JSON.parse(window.localStorage.getItem("session")).user.token;
        var logins = {};
        var login_id = 'cognito-idp.' + _this.$cognitoAuth.options.region + '.amazonaws.com/' + _this.$cognitoAuth.options.UserPoolId;
        logins[login_id] = token;

        AWS.config.update({ region: "us-east-1" });
        AWS.config.credentials = new CognitoIdentityCredentials({
          IdentityPoolId: _this.$cognitoAuth.options.IdentityPoolId,
          Logins: logins,
          LoginId: login_id
        })

        var TYPE = require("aws-sdk/clients/"+type_service);
        var type = new TYPE({
          region: "us-east-1",
          credentials: AWS.config.credentials
        });

        var params = {};
        type.describeRegions(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            var regions = [];
            var regionsArray = data['Regions'];
            for (var i in regionsArray) {
              regions.push(regionsArray[i]['RegionName'])
            };
            resolve(regions);
          }
        });
      });

    }

export function searchEC2(events) {
         const filtered = events.filter(ev =>
         ev.eventSource === "ec2.amazonaws.com"
    );
    filtered.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
    for (let i = 0; i < filtered.length; i++) {
        const e = filtered[i];
        if (e.eventID.includes("3bccc801") ){
          console.log(e, "id");
        }
      }
    
    // console.log(filtered, "Filtered EC2 Events");
//     const pairs = [];
//     const used = new Set();
//     for (let i = 0; i < filtered.length; i++) {
//         const e = filtered[i];
        
//         if (e.eventName === "RunInstances" && !used.has(e.eventID)) {
//             const runTime = new Date(e.eventTime);
//             const username = e.userIdentity_userName;
//             let matchedEvent = null;

//             for (let j = i + 1; j < filtered.length; j++) {
//                 const e2 = filtered[j];
//                 if (used.has(e2.eventID)) continue;

//                 const e2Time = new Date(e2.eventTime);
//                 const timeDiff = e2Time - runTime;

//                 if (
//                     e2.userIdentity_userName === username && 
//                     e2.eventName === "DeleteBucket" &&
//                     timeDiff >= 0
//                 ) {
//                     matchedEvent = { e2, timeDiff };
//                     break;
//                 }
//             }
//             if (matchedEvent) {
//                 pairs.push({
//                     username,
//                     run: e.eventTime,
//                     end: matchedEvent.e2.eventTime,
//                     durationMs: matchedEvent.timeDiff
//                 });
//                 used.add(e.eventID);
//                 used.add(matchedEvent.e2.eventID);
//             } else {
//                 pairs.push({
//                     username,
//                     run: e.eventTime,
//                     end: null,
//                     durationMs: null
//                 });
//                 used.add(e.eventID);
//             }
//         }
//     }
//     return pairs;
// }
}

export function calculateEC2BillingDurations(events) {
    const timeWindowMs = 6 * 60 * 60 * 1000; // 6 horas

    // Ordenar por tiempo
    events.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));

    const billingPeriods = {};
    const usedEvents = new Set();

    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        const username = e.userIdentity_userName;

        if (!billingPeriods[username]) billingPeriods[username] = [];

        if ((e.eventName === "RunInstances" || e.eventName === "StartInstances") && !usedEvents.has(e.eventID)) {
        const startTime = new Date(e.eventTime);
        let endTime = null;
        let endEvent = null;

        // Buscar Stop o Terminate posterior del mismo usuario
        for (let j = i + 1; j < events.length; j++) {
            const e2 = events[j];
            if (usedEvents.has(e2.eventID)) continue;
            if (e2.userIdentity_userName !== username) continue;

            const e2Time = new Date(e2.eventTime);
            const timeDiff = e2Time - startTime;

            if (timeDiff < 0 || timeDiff > timeWindowMs) continue;

            if (e2.eventName === "StopInstances" || e2.eventName === "TerminateInstances") {
            endTime = e2Time;
            endEvent = e2;
            break;
            }
        }

        if (endTime) {
            billingPeriods[username].push({
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            durationMs: endTime - startTime
            });
            usedEvents.add(e.eventID);
            usedEvents.add(endEvent.eventID);
        } else {
            // Si no hay fin, asumimos que sigue corriendo
            billingPeriods[username].push({
            start: startTime.toISOString(),
            end: null,
            durationMs: null
            });
            usedEvents.add(e.eventID);
        }
        }
    }

    return billingPeriods;
}

function getPriceEC2(service, type_service, locationDescription, timeStart, timeEnd) {



}


export function calculateCourseCost(servicesUsed) {

return 0;

}