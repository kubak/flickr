// simple flickr module
var Flickr = {
    url : 'http://api.flickr.com/services/rest/',
    apiKey : false,
    defaults : {
		method : 'flickr.photos.search',
        format : 'json',
        nojsoncallback : 1,
        page : 1,
        per_page : 10    
    },
    init : function (apiKey) {
        if (typeof(apiKey) == 'undefined' || apiKey == '') {
            throw "api key undefined";
        }
        this.apiKey = apiKey;
    },
    request : function (options, callback) {
        if (!this.apiKey) {
            throw "api key undefined";
        }
        options = $.extend({}, this.defaults, options);
        $.extend(options, { api_key : this.apiKey});
        $.getJSON(this.url, options, function (data) {
            if (typeof(data.stat) == 'undefined' || data.stat == "fail") {
                // something is wrong for now we just stop here
                // console.log(data.code, data.message);
                return;
            }
            callback(data);
        });
    }, 
};

var FlickrViewer = {
    currentPage : 1,
    pages : 1,
    timeout : false,
    init : function () {
        $("#search").keypress(FlickrViewer.search);
        $("#next").click(FlickrViewer.next);
        $("#previous").click(FlickrViewer.previous); 
    },
    render : function (data) {
        $("#photos").empty();
        $.each(data.photos.photo, function (index, photo) {
            var imgUrl = "http://farm" + photo.farm +
                    ".static.flickr.com/" + photo.server + 
                    "/" + photo.id + "_" + photo.secret + "_" + "m.jpg";            
            $("#photos").append($('<img src="' + imgUrl + '" />'));
        });
        $("#current").text(data.photos.page);
        $("#total").text(data.photos.total + ' photos found');
        if (data.photos.page > 1) {
            $("#previous").css('text-decoration', 'underline');
        } else {
            $("#previous").css('text-decoration', 'line-through');
        }
        if (data.photos.page < data.photos.pages) {
            $("#next").css('text-decoration', 'underline');
        } else {
            $("#next").css('text-decoration', 'line-through');
        }
        FlickrViewer.currentPage = data.photos.page;
        FlickrViewer.pages = data.photos.pages;
    },
    search : function () {
        if ($(this).val().length < 3) {
            return;
        }
        clearTimeout(FlickrViewer.timeout);
        FlickrViewer.timeout = setTimeout(function () {
            var options = {
                tags : $('#search').val(),
                page : 1
            };
            Flickr.request(options, FlickrViewer.render);
        }, 150);
    },
    paginate : function (page) {
        console.log(page);
        var options = {
            tags : $('#search').val(),
            page : page
        };
        Flickr.request(options, FlickrViewer.render);
    },
    next : function () {
        if (FlickrViewer.currentPage < FlickrViewer.pages) {
            FlickrViewer.paginate(FlickrViewer.currentPage+1);
        }
    },
    previous : function () {
        if (FlickrViewer.currentPage > 1) {
            FlickrViewer.paginate(FlickrViewer.currentPage-1);
        }
    }
}
// usage
$(function () {
    Flickr.init('7dfeb99d41a4cd4869b755b220c88e9e');
    FlickrViewer.init();
});
