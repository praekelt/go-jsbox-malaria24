/*jshint -W083 */

// Shared utils lib
go.utils = {

    "is_valid_msisdn": function (content) {
        return !isNaN(content) &&
            parseInt(content[0], 10) === 0 &&
            content.length == 10;
    },

    // Handy to leave at the bottom to ensure trailing commas in objects
    // don't become syntax errors.
    "commas": "commas"
};
