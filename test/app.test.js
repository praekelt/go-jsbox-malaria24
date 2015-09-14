var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var fs = require('fs');


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app',
                    facility_codes: JSON.parse(
                        fs.readFileSync(
                            "src/lookups/facility_codes.json", "utf8")),
                    localities: JSON.parse(
                        fs.readFileSync(
                            "src/lookups/localities.json", "utf8"))

                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("Extract_SA_ID_Info: extract the SA ID out of the SA ID", function() {
            it("this still needs to be fleshed out", function() {
                true;
            });
        });

        describe("Facility_Code_Entry:", function() {
          it("should show the welcome screen", function() {
              return tester
                  .start()
                  .check.interaction({
                      state: 'Facility_Code_Entry',
                      reply: [
                          'Welcome! To report a malaria case, please enter your facility code. Demo facility, 154342'
                      ].join('\n')
                  })
                  .run();
          });

          it('should validate the input', function () {
              return tester
                  .setup.user.state('Facility_Code_Entry')
                  .input('123')
                  .check.reply.content(/The facility code is invalid/)
                  .run();
          });

          it('should continue with valid input', function () {
              return tester
                  .setup.user.state('Facility_Code_Entry')
                  .input('154342')
                  .check.reply.content(/Please enter the cell phone number/)
                  .run();
          });

        });

        describe('MSISDN_Entry', function() {
            it('should block bad phone numbers', function () {
                return tester
                    .setup.user.state('MSISDN_Entry')
                    .input('12345')
                    .check.reply.content(/Sorry, that number is not valid/)
                    .run();
            });

            it('should accept reasonable phone numbers', function () {
                return tester
                    .setup.user.state('MSISDN_Entry')
                    .input('0123456789')
                    .check.reply.content(/Please enter the first name of the patient. For example: Mbe/)
                    .run();
            });
        });

        describe('First_Name_Entry', function () {
            it('should accept any string input', function () {
                return tester
                    .setup.user.state('First_Name_Entry')
                    .input('Mbe')
                    .check.reply.content(/Please enter the last name of the patient./)
                    .run();
            });

            it('should block on null input', function () {
                return tester
                    .setup.user.state('First_Name_Entry')
                    .input(null)
                    .check.reply.content(/Please enter the first name of the patient/)
                    .run();
            });
        });

        describe('Last_Name_Entry', function () {
            it('should accept any string input', function () {
                return tester
                    .setup.user.state('Last_Name_Entry')
                    .input('Ngu')
                    .check.reply.content(/Has the patient travelled outside of the country/)
                    .run();
            });

            it('should block on null input', function () {
                return tester
                    .setup.user.state('Last_Name_Entry')
                    .input(null)
                    .check.reply.content(/Please enter the last name of the patient/)
                    .run();
            });
        });

        describe('Patient_Abroad_Entry', function () {
            it('should not accept invalid inputs', function () {
                return tester
                    .setup.user.state('Patient_Abroad_Entry')
                    .input('-1')
                    .check.reply.content(/Has the patient travelled outside of the country/)
                    .run();
            });

            it('should accept one of the valid inputs', function () {
                return tester
                    .setup.user.state('Patient_Abroad_Entry')
                    .input('1')
                    .check.reply.content(/Please select the locality/)
                    .run();
            });
        });

        describe('Locality_Entry', function () {

            it('should not accept everything', function () {
                return tester
                    .setup.user.state('Locality_Entry')
                    .input('fooo')
                    .check.reply.content(/Please select the locality/)
                    .run();
            });

            it('should accept something valid', function () {
                return tester
                    .setup.user.state('Locality_Entry')
                    .input('1')
                    .check.reply.content(/What kind of identification/)
                    .run();
            });
        });

        describe('ID_Type_Entry', function () {
            it('should go to the patient ID number', function () {
                return tester
                    .setup.user.state('ID_Type_Entry')
                    .input('1')
                    .check.reply.content(/Please enter the patient's ID number/)
                    .run();
            });

            it('should go to the patient\'s year of birth', function () {
                return tester
                    .setup.user.state('ID_Type_Entry')
                    .input('2')
                    .check.reply.content(/Please enter the year the patient was born/)
                    .run();
            });
        });

        describe('SA_ID_Entry', function () {
            it('should not accept invalid SA ID numbers', function () {
                return tester
                    .setup.user.state('SA_ID_Entry')
                    .input('foo')
                    .check.reply.content(/Sorry, that SA ID is not valid/)
                    .run();
            });

            it('should not accept invalid SA ID numbers', function () {
                return tester
                    .setup.user.state('SA_ID_Entry')
                    .input('8905100273087')
                    .check.reply.content(/Thank you! Your report has been submitted./)
                    .run();
            });
        });

        describe('No_SA_ID_Year_Entry', function () {
            it('should not accept an invalid year', function () {
                return tester
                    .setup.user.state('No_SA_ID_Year_Entry')
                    .input('pooh')
                    .check.reply.content(/Sorry, that year is invalid/)
                    .run();
            });

            it('should accept a valid year', function () {
                return tester
                    .setup.user.state('No_SA_ID_Year_Entry')
                    .input('2000')
                    .check.reply.content(/Please enter the month the patient was born/)
                    .run();
            });
        });

        describe('No_SA_ID_Month_Entry', function () {
            it('should not accept an invalid month', function () {
                return tester
                    .setup.user.state('No_SA_ID_Month_Entry')
                    .input('13')
                    .check.reply.content(/Sorry, that month is invalid/)
                    .run();
            });

            it('should accept a valid month', function () {
                return tester
                    .setup.user.state('No_SA_ID_Month_Entry')
                    .input('12')
                    .check.reply.content(/Please enter the day the patient was born./)
                    .run();
            });
        });

        describe('No_SA_ID_Day_Entry', function () {
            it('should not accept an invalid day', function () {
                return tester
                    .setup.user.state('No_SA_ID_Day_Entry')
                    .input('32')
                    .check.reply.content(/Sorry, that day is invalid./)
                    .run();
            });

            it('should accept a valid day', function () {
                return tester
                    .setup.user.state('No_SA_ID_Day_Entry')
                    .input('12')
                    .check.reply.content(/Please select the patient's gender/)
                    .run();
            });
        });

        describe('No_SA_ID_Gender_Entry', function () {
            it('should not accept invalid options', function () {
                return tester
                    .setup.user.state('No_SA_ID_Gender_Entry')
                    .input('3')
                    .check.reply.content(/Please select the patient's gender/)
                    .run();
            });

            it('should accept valid options', function () {
                return tester
                    .setup.user.state('No_SA_ID_Gender_Entry')
                    .input('1')
                    .check.reply.content(/Thank you! Your report has been submitted/)
                    .run();
            });
        });
    });
});
