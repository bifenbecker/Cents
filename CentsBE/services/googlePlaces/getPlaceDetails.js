const axios = require('axios');
const { envVariables } = require('../../constants/constants');
/**
 *
 * sample response:
 * detaisl.data.candidates = {
   "candidates" : [
      {
         "formatted_address" : "140 George St, The Rocks NSW 2000, Australia",
         "geometry" : {
            "location" : {
               "lat" : -33.8599358,
               "lng" : 151.2090295
            },
            "viewport" : {
               "northeast" : {
                  "lat" : -33.85824767010727,
                  "lng" : 151.2102470798928
               },
               "southwest" : {
                  "lat" : -33.86094732989272,
                  "lng" : 151.2075474201073
               }
            }
         },
         "name" : "Museum of Contemporary Art Australia",
         "opening_hours" : {
            "open_now" : false,
            "weekday_text" : []
         },
         "photos" : [
            {
               "height" : 2268,
               "html_attributions" : [
                  "\u003ca href=\"https://maps.google.com/maps/contrib/113202928073475129698/photos\"\u003eEmily Zimny\u003c/a\u003e"
               ],
               "photo_reference" : "CmRaAAAAfxSORBfVmhZcERd-9eC5X1x1pKQgbmunj
               oYdGp4dYADIqC0AXVBCyeDNTHSL6NaG7
               -UiaqZ8b3BI4qZkFQKpNWTMdxIoRbpHzy-
               W_fntVxalx1MFNd3xO27KF3pkjYvCEhCd--QtZ-S087Sw5Ja_2O3MGhTr2mPMgeY8M3aP1z4gKPjmyfxolg",
               "width" : 4032
            }
         ],
         "rating" : 4.3
      }
   ],
   "debug_log" : {
      "line" : []
   },
   "status" : "OK"
}
* documentation link: https://developers.google.com/places/web-service/search#find-place-responses
 */
async function getLocationDetails(address) {
    const details = await axios.get(envVariables.GOOGLE_PLACES_FIND_URL, {
        params: {
            input: address,
            inputtype: 'textquery',
            fields: 'formatted_address,name,geometry,place_id',
            key: process.env.GOOGLE_PLACES_API_KEY,
        },
    });
    if (details && details.data.candidates && details.data.candidates.length) {
        return details.data.candidates[0];
    }
    return null;
}

module.exports = exports = getLocationDetails;
