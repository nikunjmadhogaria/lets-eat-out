const normalizedRestaurantsData = restaurantsData;

$(document).ready(function() {

    initializeFancyScrolls();

    initializeTooltips();

    populateRestaurants(restaurantsData);

    restaurantDataNormalizer(normalizedRestaurantsData);

    currencySelectBoxHandler();

    searchBoxHandler();

    cuisineFilterHandler();

    sortByHandler();
});

const restaurantDataNormalizer = function(normalizedRestaurantsData) {
    for (restaurant of normalizedRestaurantsData) {
        let currencySymbol = extractCurrencySymbol(restaurant["Currency"]);
        if (currencySymbol === "$") {
            restaurant["Normalized Currency"] = restaurant["Average Cost for two"];
        } else {
            restaurant["Normalized Currency"] = currencyConversion[currencySymbol]["$"] * restaurant["Average Cost for two"];
        }
    }
}

const populateRestaurants = function(data) {
    let restaurantListHtml = "";
    for (restaurant of data) {
        restaurantListHtml += `
    				<div class="row restaurant-entry cuisine-match search-match">
                        <div class="col-sm-3">
                            <div class="restaurant-img"></div>
                        </div>
                        <div class="col-sm-7 restaurant-details">
                            <h2 class="restaurant-name">
                            	${restaurant["Restaurant Name"]}
                        	</h2>
                            <div class="row restaurant-param-details">
                                <div class="col-sm-4 restaurant-parameter-name">
                                    CUISINES:
                                </div>
                                <div class="col-sm-8 restaurant-parameter-value restaurant-cuisines">
                                    ${restaurant["Cuisines"]}
                                </div>
                                <div class="col-sm-4 restaurant-parameter-name">
                                    COST FOR TWO:
                                </div>
                                <div class="col-sm-8 restaurant-parameter-value">
                                	<span class="default cost-for-two">
                                    	${extractCurrencySymbol(restaurant["Currency"])}
                                    	${restaurant["Average Cost for two"]}
                                	</span>
                                	${getCostForTwoHtmlForAllCurrencies(
                                		extractCurrencySymbol(restaurant["Currency"]),
                                		restaurant["Average Cost for two"]
                                	)}
                                </div>
                            </div>
                            <div class="row restaurant-action">
                                <div class="col-sm-12">
                                	<a href="#" class="btn book-table-link
                                	${restaurant["Has Table booking"] === "Yes" ? "active" : ""}"><i class="fa fa-calendar" aria-hidden="true"></i>Book Table</a>
                                	<a href="#" class="btn order-link
                                	${restaurant["Has Online delivery"] === "Yes" ? "active" : ""}"><i class="fa fa-shopping-cart" aria-hidden="true"></i>Order Now</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2" class="restaurant-score">
                            <div class="restaurant-score-value">
                                <span class="restaurant-rating" data-toggle="tooltip" title="${restaurant["Rating text"]}">
                                	${getDecimalValue(restaurant["Aggregate rating"])}
                                </span><br>
                                <span class="restaurant-votes">
                                	${restaurant["Votes"]} vote${addSifPlural(restaurant["Votes"])}
                            	</span>
                            </div>
                        </div>
                    </div>
                `;
    }
    $("#restaurant-list").html(restaurantListHtml);
}

const extractCurrencySymbol = function(currency) {
    return currency.substring(currency.indexOf("(") + 1, currency.indexOf(")"));
}

const getDecimalValue = function(numberString) {
    return parseFloat(numberString).toFixed(1);
}

const addSifPlural = function(numberString) {
    return parseInt(numberString) > 1 ? "s" : "";
}

const getCostForTwoHtmlForAllCurrencies = function(currencySymbol, cost) {
    htmlForOtherCurrencies = `
		<span class="${currencySymbol} cost-for-two">
	    	${currencySymbol}
	    	${cost}
		</span>
	`;
    for (convertedCurrency of Object.keys(currencyConversion[currencySymbol])) {
        htmlForOtherCurrencies += `
			<span class="${convertedCurrency} cost-for-two">
		    	${convertedCurrency}
		    	${parseInt(Math.round(cost * currencyConversion[currencySymbol][convertedCurrency]))}
			</span>
		`;
    }

    return htmlForOtherCurrencies;
}

const initializeFancyScrolls = function() {
    $("#cuisine-filter-items").slimscroll({
        height: '95px',
        // alwaysVisible: true,
        railVisible: true,
        railColor: '#c1c1c1',
        railOpacity: 0.6,
        wheelStep: 4
    });
}

const initializeTooltips = function() {
    $('body').tooltip({
        selector: '.restaurant-rating'
    });
}

const currencySelectBoxHandler = function() {
    $("#selected-currency").change(function() {
        setCurrency($(this).val());
    });
}

const setCurrency = function(currencySymbol) {
    $(".cost-for-two").hide();
    $(`[class = '${currencySymbol} cost-for-two'`).show();
}

const searchBoxHandler = function() {
    $("#search-box").keyup(function() {
        searchByRestaurantName($(this).val());
    });
}

const searchByRestaurantName = function(name) {
    let searchTerm = name.trim().toLowerCase();
    if (searchTerm.length > 0) {
        $(".search-match").removeClass("search-match");
        $(".restaurant-name").each(function() {
            let restaurantName = $(this).text().trim().toLowerCase();
            if (restaurantName.indexOf(searchTerm) !== -1) {
                $(this).parents(".restaurant-entry").addClass("search-match");
            }
        });
    } else {
        $(".restaurant-entry").addClass("search-match");
    }
}

const cuisineFilterHandler = function() {
    $("#cuisine-filter-items input").change(function() {
        filterbyCuisines();
    });
}

const filterbyCuisines = function() {
    let regexPatternForSelectedCuisines = "";
    $("#cuisine-filter-items input:checked").each(function() {
        regexPatternForSelectedCuisines += $(this).next().text().trim() + "|";
    });
    regexPatternForSelectedCuisines = regexPatternForSelectedCuisines.slice(0, -1);
    if (regexPatternForSelectedCuisines) {
        $(".cuisine-match").removeClass("cuisine-match");
        let regex = new RegExp(regexPatternForSelectedCuisines, "ig");
        $(".restaurant-cuisines").each(function() {
            let restaurantCuisines = $(this).text().trim();
            if (restaurantCuisines.match(regex)) {
                $(this).parents(".restaurant-entry").addClass("cuisine-match");
            }
        });
    } else {
        $(".restaurant-entry").addClass("cuisine-match");
    }
}

const sortByHandler = function() {
    $("[name='sort-by']").change(function() {
        sortBySelection($(this).val());
    });
}

const sortBySelection = function(sortBy) {
    let key = sortBy.split(";")[0];
    let order = sortBy.split(";")[1];
    normalizedRestaurantsData.sort(function(a, b) {
        if (order === "high to low") {
            return b[key] - a[key];
        } else if (order === "low to high") {
            return a[key] - b[key];
        }
    });
    populateRestaurants(normalizedRestaurantsData);
    searchByRestaurantName($("#search-box").val());
    filterbyCuisines();
    setCurrency($("#selected-currency").val());
}