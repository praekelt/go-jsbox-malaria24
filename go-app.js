// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */

var moment = require('moment');

// Shared utils lib
go.utils = {

    is_none_msisdn: function (content) {
      if (content.toLowerCase() == 'none') {
        return true;
      }
    },

    is_valid_msisdn: function (content) {
        return !isNaN(content) &&
            parseInt(content[0], 10) === 0 &&
            content.length == 10;
    },

    validate_id_sa: function(id) {
        var i, c,
            even = '',
            sum = 0,
            check = id.slice(-1);

        if (id.length != 13 || id.match(/\D/)) {
            return false;
        }
        id = id.substr(0, id.length - 1);
        for (i = 0; id.charAt(i); i += 2) {
            c = id.charAt(i);
            sum += +c;
            even += id.charAt(i + 1);
        }
        even = '' + even * 2;
        for (i = 0; even.charAt(i); i++) {
            c = even.charAt(i);
            sum += +c;
        }
        sum = 10 - ('' + sum).charAt(1);
        return ('' + sum).slice(-1) == check;
    },

    now: function () {
        return moment();
    },

    generate_case_number: function (im, facility_code) {
        return im.api_request('kv.incr', {
            key: 'facility_code:' + facility_code,
            amount: 1,
        })
        .then(function(result){
            return result.value;
        })
        .then(function(sequence_number) {
            return [
                go.utils.now().format('YYYYMMDD'),
                facility_code,
                sequence_number,
            ].join('-');
        });
    },

    // Handy to leave at the bottom to ensure trailing commas in objects
    // don't become syntax errors.
    "commas": "commas"
};

go.app = function() {
  var vumigo = require('vumigo_v02');
  var Q = require('q');
  var Ona = require('go-jsbox-ona').Ona;
  var App = vumigo.App;
  var Choice = vumigo.states.Choice;
  var ChoiceState = vumigo.states.ChoiceState;
  var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
  var FreeText = vumigo.states.FreeText;
  var EndState = vumigo.states.EndState;
  var JsonApi = vumigo.http.api.JsonApi;

  var GoApp = App.extend(function(self) {
    App.call(self, 'Facility_Code_Entry');
    var $ = self.$;

    // NEW STEPS
    self.states.add('Extract_SA_ID_Info', function(name) {

    });

    self.states.add('Facility_Code_Entry', function(name, opts) {
      var question = $(
        "Welcome! To report a malaria case, please enter your " +
        "facility code. For example, 543456");
      return new FreeText(name, {
        question: opts.error || question,
        next: function(content) {
          var http = new JsonApi(self.im);
          var url = self.im.config.api_endpoint + 'facility/' + content + '.json';
          return http
            .get(url)
            .then(function (response) {
              return {
                  name: 'Facility_Code_Confirm',
                  creator_opts: response.data
              };
            })
            .catch(function (request, reason) {
              return {
                name: 'Facility_Code_Entry',
                creator_opts: {
                  'error': $("The facility code is invalid. Please enter again.")
                }
              };
            });
        }
      });
    });

    self.states.add('Facility_Code_Confirm', function(name, opts) {
      return Q()
        .then(function () {
          var question = $("Please confirm that you are reporting from '" + opts.facility_name + "'");
          return new ChoiceState(name, {
            question: question,
            choices: [
              new Choice('MSISDN_Entry', "Confirm"),
              new Choice('Facility_Code_Entry', "Not my facility")
            ],
            next: function(choice) {
              return choice.value;
            }
          });
        });

    });

    self.states.add('MSISDN_Entry', function(name) {
      var question = $("Please enter the South African cell phone number of " +
                       "patient or next of kin. For example 0720845785. Type " +
                       "none if they don't have a number.");
      var error = $('Sorry, that number is not valid');
      return new FreeText(name, {
        question: question,
        check: function(content) {
          if (!go.utils.is_none_msisdn(content) && !go.utils.is_valid_msisdn(content)) {
            return error;
          }
        },
        next: 'First_Name_Entry'
      });
    });

    self.states.add('First_Name_Entry', function(name) {
      var question = $("Please enter the first name of the patient. For example: Mbe");
      return new FreeText(name, {
        question: question,
        next: 'Last_Name_Entry'
      });
    });

    self.states.add('Last_Name_Entry', function(name) {
      var question = $("Please enter the last name of the patient. For example: Ngu");
      return new FreeText(name, {
        question: question,
        next: 'Patient_Abroad_Entry'
      });
    });

    self.states.add('Patient_Abroad_Entry', function(name) {
      return new ChoiceState(name, {
        question: $("Has the patient travelled abroad in the past 21 days"),
        choices: [
          new Choice('No', $("No")),
          new Choice('Ethiopia', $("Yes Ethiopia")),
          new Choice('Somalia', $("Yes Somalia")),
          new Choice('Mozambique', $("Yes Mozambique")),
          new Choice('Zambia', $("Yes Zambia")),
          new Choice('Zimbabwe', $("Yes Zimbabwe")),
          new Choice('Other', $("Other")),
        ],
        next: 'Locality_Entry'
      });
    });

    self.states.add('Locality_Entry', function(name) {
      var question = $("Please select the locality where the patient is currently staying:");
      var http = new JsonApi(self.im);
      var url = self.im.config.api_endpoint + 'localities/' + self.im.user.answers.Facility_Code_Entry + '.json';
      return http
        .get(url)
        .then(function (response) {
          return response.data;
        })
        .then(function(localities) {
          var choices = localities.map(function(locality) {
            return new Choice(locality, locality);
          }).concat([
            new Choice('_other', 'Other'),
          ]);
          return new ChoiceState(name, {
            question: question,
            choices: choices,
            next: function (choice) {
              if (choice.value == '_other') {
                return 'Locality_Entry_Other';
              }
              return 'Landmark_Entry';
            }
          });
        });
    });

    self.states.add('Locality_Entry_Other', function (name) {
      var question = $('Please write the locality where the patient is currently staying:');
      return new FreeText(name, {
        question: question,
        next: 'Landmark_Entry'
      });
    });

    self.states.add('Landmark_Entry', function(name) {
      var question = $("What is the closest landmark for the patient?");
      return new ChoiceState(name, {
        question: question,
        choices: self.im.config.landmarks.map(function(landmark) {
          return new Choice(landmark, landmark);
        }),
        next: 'Landmark_Entry_Description'
      });
    });

    self.states.add('Landmark_Entry_Description', function(name) {
      var question = $("Please describe the landmark.");
      return new FreeText(name, {
        question: question,
        next: 'ID_Type_Entry'
      });
    });

    self.states.add('ID_Type_Entry', function(name, opts) {
      var question = $("What kind of identification does the patient have?");
      return new ChoiceState(name, {
        question: opts.error || question,
        choices: [
          new Choice('SA_ID_Entry', $("South African ID")),
          new Choice('No_SA_ID_Year_Entry', $("None"))
        ],

        next: function(choice) {
          return choice.value;
        }

      });
    });

    self.states.add('SA_ID_Entry', function(name) {
      var question = $("Please enter the patient's ID number");
      return new FreeText(name, {
        question: question,
        next: function(content) {
          if (!go.utils.validate_id_sa(content)) {
            return {
              name: 'ID_Type_Entry',
              creator_opts: {
                error: $('The format of the ID number was incorrect. ' +
                         'What kind of identification does the patient have?')
              }
            };
          }
          return 'Submit_Case';
        }
      });

    });

    self.states.add('No_SA_ID_Year_Entry', function(name) {
      var question = $("Please enter the year the patient was born. For example: 1982");
      var error = $('Sorry, that year is invalid');
      return new FreeText(name, {
        question: question,
        check: function(content) {
          if (content.length != 4 || isNaN(content)) {
            return error;
          }
        },
        next: 'No_SA_ID_Month_Entry'
      });
    });

    self.states.add('No_SA_ID_Month_Entry', function(name) {
      var question = $("Please select the patient's month of birth");
      return new PaginatedChoiceState(name, {
        question: question,
        options_per_page: 6,
        choices: [
          new Choice(1, 'January'),
          new Choice(2, 'February'),
          new Choice(3, 'March'),
          new Choice(4, 'April'),
          new Choice(5, 'May'),
          new Choice(6, 'June'),
          new Choice(7, 'July'),
          new Choice(8, 'August'),
          new Choice(9, 'September'),
          new Choice(10, 'October'),
          new Choice(11, 'November'),
          new Choice(12, 'December'),
        ],
        error: $('Sorry, that month is invalid.'),
        next: 'No_SA_ID_Day_Entry'
      });
    });

    self.states.add('No_SA_ID_Day_Entry', function(name) {
      var question = $("Please enter the day the patient was born. For example: 22");
      var error = $('Sorry, that day is invalid.');
      return new FreeText(name, {
        question: question,
        check: function(content) {
          if (isNaN(content) || (parseInt(content, 10) > 31 || parseInt(content, 10) < 1)) {
            return error;
          }
        },
        next: 'No_SA_ID_Gender_Entry'
      });

    });
    self.states.add('No_SA_ID_Gender_Entry', function(name) {
      return new ChoiceState(name, {
        question: $("Please select the patient's gender:"),
        choices: [
          new Choice('male', $("Male")),
          new Choice('female', $("Female"))
        ],

        next: 'Submit_Case'
      });

    });

    self.states.add('Submit_Case', function(name) {
      return go.utils.generate_case_number(self.im, self.im.user.answers.Facility_Code_Entry)
        .then(function(case_number) {
          // Send response to Ona
          var ona_conf = self.im.config.ona;
          if (typeof ona_conf == 'undefined') {
            return self.im.log.info([
              "No Ona API configured.",
              "Not submitting data to Ona."
            ].join(" "));
          }
          var ona = new Ona(self.im, {
            auth: {
              username: ona_conf.username,
              password: ona_conf.password
            },
            url: ona_conf.url
          });
          var data = self.im.user.answers;
          data.case_number = case_number;
          data.create_date_time = go.utils.now().format();
          data.reported_by = self.im.user.addr;
          data.gender = self.im.user.answers.No_SA_ID_Gender_Entry;
          said = data.SA_ID_Entry;
          if (data.SA_ID_Entry) {
            data.No_SA_ID_Year_Entry = said.substring(0, 2);
            data.No_SA_ID_Month_Entry = said.substring(2, 4);
            data.No_SA_ID_Day_Entry = said.substring(4, 6);
          }

          var submission = self.create_ona_submission(data);

          return ona.submit({
            id: self.im.config.ona.id,
            submission: submission,
          });
        })
        .fail(function(err) {
          // Check for Ona response error
          return self.im.log.error([
            'Error when sending data to Ona:',
            JSON.stringify(err.response)
          ].join(' '));
        })
        .then(function() {
          return new EndState(name, {
            text: $("Thank you! Your report has been submitted. " +
                    "You will receive an SMS with the patient name and " +
                    "case number in the next hour."),
            next: 'Facility_Code_Entry'
          });
        });

    });
    // END NEW STEPS

    self.create_ona_submission = function(data) {
      var submission = {
        facility_code: data.Facility_Code_Entry,
        reported_by: data.reported_by,
        first_name: data.First_Name_Entry,
        id_type: data.ID_Type_Entry,
        last_name: data.Last_Name_Entry,
        locality: data.Locality_Entry,
        locality_other: data.Locality_Entry_Other,
        msisdn: data.MSISDN_Entry,
        date_of_birth: String(data.No_SA_ID_Year_Entry) + String(data.No_SA_ID_Month_Entry) + String(data.No_SA_ID_Day_Entry),
        create_date_time: data.create_date_time,
        abroad: data.Patient_Abroad_Entry,
        sa_id_number: data.SA_ID_Entry,
        gender: data.gender,
        landmark: data.Landmark_Entry,
        landmark_description: data.Landmark_Entry_Description,
        case_number: data.case_number
      };

      return submission;
    };

  });

  return {
    GoApp: GoApp
  };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;


    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
