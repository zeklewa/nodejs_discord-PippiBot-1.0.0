var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = {
    // Generate imgur links
    genImgur: function () 
    {
        var chars = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'; 
        var stringlength = 5; /* could be 6 or 7, but takes forever because there are lots of dead images */
        var text = '';
        for (var i = 0; i < stringlength; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            text += chars.substring(rnum,rnum+1);
        }
     
    var source = 'https://i.imgur.com/' + text + '.jpg';
    return source;

    },

    // Check if image exists
    imageExists: function (image_url) 
    {
        var http = new XMLHttpRequest();

        http.open('HEAD', image_url, false);
        http.send();

        return http.status == 200;
    },

    // Get file extension
    getExtension: function (fileName) 
    {
        return fileName.substr(fileName.lastIndexOf('.') + 1);
    },

    // Convert UNIX time to hhmmss
    timeConverter: function (delta) 
    {
        // calculate (and subtract) whole hours
        delta /= 1000;
        var hours = Math.floor(delta / 3600);
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        var seconds = delta % 60;  // in theory the modulus is not required
        time = '`' + hours + "h " + minutes + "m " + Math.floor(seconds) + "s`";
        return time;
    }
};