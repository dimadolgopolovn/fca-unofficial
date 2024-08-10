"use strict";

var utils = require("../utils");
var log = require("npmlog");

function formatData(data) {
  return {
    userID: utils.formatID(data.uid.toString()),
    photoUrl: data.photo,
    indexRank: data.index_rank,
    name: data.text,
    isVerified: data.is_verified,
    profileUrl: data.path,
    category: data.category,
    score: data.score,
    type: data.type
  };
}

module.exports = function(defaultFuncs, api, ctx) {
  return function getUserID(name, callback) {
    var resolveFunc = function(){};
    var rejectFunc = function(){};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, friendList) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(friendList);
      };
    }

    // var form = {
    //   value: name.toLowerCase(),
    //   viewer: ctx.userID,
    //   rsp: "search",
    //   context: "search",
    //   path: "/home.php",
    //   request_id: utils.getGUID()
    // };

    // defaultFuncs
    //   .get("https://www.facebook.com/ajax/typeahead/search.php", ctx.jar, form)
    //   .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
    //   .then(function(resData) {
    //     if (resData.error) {
    //       throw resData;
    //     }

    //     var data = resData.payload.entries;

    //     callback(null, data.map(formatData));
    //   })
    //   .catch(function(err) {
    //     log.error("getUserID", err);
    //     return callback(err);
    //   });

    const fetch = require('node-fetch')
    const { CookieJar } = require('tough-cookie')
    const { URLSearchParams } = require('url')

    const toughJar = new CookieJar()
    // Convert cookies from ctx.jar (request.jar) to toughJar (tough-cookie.CookieJar)
    ctx.jar.getCookies('https://www.facebook.com', (err, cookies) => {
      if (err) {
        console.error('Error getting cookies from ctx.jar:', err)
        return
      }

      cookies.forEach(cookie => {
        toughJar.setCookieSync(cookie.cookieString(), 'https://www.facebook.com')
      })
    })


    // Assuming ctx, name, and other variables are provided
    const form = {
      value: name.toLowerCase(),
      viewer: ctx.userID,
      rsp: "search",
      context: "search",
      path: "/home.php",
      request_id: utils.getGUID()
    }

    async function fetchData() {
      try {
        const url = 'https://www.facebook.com/ajax/typeahead/search.php'
        const params = new URLSearchParams(form)

        const headers = {
          'Cookie': toughJar.getCookieStringSync(url)
        }

        const response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          headers: headers,
          redirect: 'manual' // To handle redirections manually if necessary
        })

        const body = await response.text()
        console.log("BODYD")
        console.log(body)

        // Assuming utils.parseAndCheckLogin and formatData are defined elsewhere
        const resData = await utils.parseAndCheckLogin(ctx, body)

        if (resData.error) {
          throw resData
        }
        console.log("resData")
        console.log(resData)

        const data = resData.payload.entries
        callback(null, data.map(formatData))
      } catch (err) {
        console.error("getUserID", err)
        callback(err)
      }
    }

    fetchData()

    return returnPromise;
  };
};
