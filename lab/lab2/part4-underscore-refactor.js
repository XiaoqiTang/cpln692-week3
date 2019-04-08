(function(){

  var map = L.map('map', {
    center: [39.9522, -75.1639],
    zoom: 14
  });
  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  /* =====================

  # Lab 2, Part 4 — (Optional, stretch goal)

  ## Introduction

    You've already seen this file organized and refactored. In this lab, you will
    try to refactor this code to be cleaner and clearer - you should use the
    utilities and functions provided by underscore.js. Eliminate loops where possible.

  ===================== */

  // Mock user input
  // Filter out according to these zip codes:
  var acceptedZipcodes = [19106, 19107, 19124, 19111, 19118];
  // Filter according to enrollment that is greater than this variable:
  var minEnrollment = 300;


  // clean data
  _(schools).each(function(school, i){
    // If we have '19104 - 1234', splitting and taking the first (0th) element
    // as an integer should yield a zip in the format above
    if (typeof school.ZIPCODE === 'string') {
      split = school.ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      school.ZIPCODE = normalized_zip;
    }

    // Check out the use of typeof here — this was not a contrived example.
    // Someone actually messed up the data entry
    if (typeof school.GRADE_ORG === 'number') {  // if number
      school.HAS_KINDERGARTEN = school.GRADE_LEVEL < 1;
      school.HAS_ELEMENTARY = 1 < school.GRADE_LEVEL < 6;
      school.HAS_MIDDLE_SCHOOL = 5 < school.GRADE_LEVEL < 9;
      school.HAS_HIGH_SCHOOL = 8 < school.GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      school.HAS_KINDERGARTEN = school.GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      school.HAS_ELEMENTARY = school.GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      school.HAS_MIDDLE_SCHOOL = school.GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      school.HAS_HIGH_SCHOOL = school.GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  });



  var isOpenF = function(school) {
    return school.ACTIVE.toUpperCase() == 'OPEN';
  };


  // filter data
  var filtered_data = [];
  var filtered_out = [];
  _(schools).each(function(school, i){
    console.log("this is open", isOpenF(school))
    isOpen = isOpenF(school);
    isPublic = (school.TYPE.toUpperCase() !== 'CHARTER' &&
                school.TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (school.HAS_KINDERGARTEN ||
                school.HAS_ELEMENTARY ||
                school.HAS_MIDDLE_SCHOOL ||
                school.HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = school.ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(school.ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data.push(school);
    } else {
      filtered_out.push(school);
    }
  });
  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);

  // main loop
  var color;
  _(filtered_data).each(function(f_data, i){
    isOpen = f_data.ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (f_data.TYPE.toUpperCase() !== 'CHARTER' &&
                f_data.TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = f_data.ENROLLMENT > minEnrollment;

    // Constructing the styling  options for our map
    if (f_data.HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (f_data.HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000';
    }
    // The style options
    var pathOpts = {'radius': f_data.ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([f_data.Y, f_data.X], pathOpts)
      .bindPopup(f_data.FACILNAME_LABEL)
      .addTo(map);
  });

})();
