go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    // var Choice = vumigo.states.Choice;
    // var ChoiceState = vumigo.states.ChoiceState;
    var FreeText = vumigo.states.FreeText;
    var EndState = vumigo.states.EndState;

    var GoApp = App.extend(function(self) {
        App.call(self, 'state_welcome');
        var $ = self.$;
        // var interrupt = true;

        self.states.add('state_welcome', function(name) {
            var question = $("Welcome! To report a malaria case, please enter your facility code. For example, 543456");
            var error = $("The facility code is invalid. Please enter again.");
            return new FreeText(name, {
                  question: question,
                  check: function(content) {
                      if (go.utils.is_valid_name(content) || true ) {
                          return null;  // vumi expects null or undefined if check passes
                      } else {
                          return error;
                      }
                  },
                  next: 'state_validate_facility_code'
            });

        });

        // self.add('state_household_head_surname', function(name) {
        //     var question = $("Please enter the surname of the Head of the Household of the pregnant woman. For example, Mbire.");
        //     var error = $("That surname is not invalid. Please enter the surname of the Head of the Household.");
        //     return new FreeText(name, {
        //         question: question,
        //         check: function(content) {
        //             if (go.utils.is_valid_name(content)) {
        //                 return null;  // vumi expects null or undefined if check passes
        //             } else {
        //                 return error;
        //             }
        //         },
        //         next: 'state_last_period_month'
        //     });
        // });




        self.states.add('state_validate_facility_code', function(name) {
          var question = $("FacilityCode validated!");
          var error = $("FacilityCode invalid");
          return new FreeText(name, {
                question: question,
                check: function(content) {
                    if (go.utils.is_valid_name(content) || true) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return error;
                    }
                },
                next: 'state_validate_facility_code'
          });



        });
        self.states.add('state_invalid_facility_code', function(name) {});
        self.states.add('state_patient_mssisdn', function(name) {});
        self.states.add('state_patient_firstname', function(name) {});
        self.states.add('state_patient_surname', function(name) {});
        self.states.add('state_patient_travel_abroad', function(name) {});
        self.states.add('state_patient_locality', function(name) {});
        self.states.add('state_patient_rsaid', function(name) {});
        self.states.add('state_patient_noid', function(name) {});
        self.states.add('state_patient_dob', function(name) {});
        self.states.add('state_patient_sex', function(name) {});
        self.states.add('state_submit_case', function(name) {});




        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'states_welcome'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
