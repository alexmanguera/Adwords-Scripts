var TARGET_CPA = 35;
var UPPER_BID_LIMIT = 10;
var CAMPAIGN_NAME = "AU - Bali Wedding (BMM)";

function main()
{

	function getAllKeywordsStats(campaignName) {
		
		var campaignIterator = AdWordsApp.campaigns()
			.withCondition('Name = "' + campaignName + '"')
			.get();
			
		if(campaignIterator.hasNext())
		{
			Logger.log("===================================");
			Logger.log("Campaign Name: " + campaignName);
			Logger.log("Upper Bid Limit: " + UPPER_BID_LIMIT);
			Logger.log("Target CPA: " + TARGET_CPA);
			Logger.log("===================================");
			Logger.log("\n");
			
			var campaign = campaignIterator.next();
			
			var keywordIterators = campaign.keywords()
									.withCondition('CampaignName = "'+ campaignName +'"')
									.withCondition("Status = ENABLED")
									.withCondition("AdGroupStatus = ENABLED")
									.get();
					
			if(keywordIterators.hasNext())
			{
				while(keywordIterators.hasNext())
				{
					var keywords = keywordIterators.next();
					
					var keyword = keywords.getText();
					var AdGroup = keywords.getAdGroup().getName();
					
					var stats_seven_days = keywords.getStatsFor('LAST_7_DAYS');
					var stats_fourteen_days = keywords.getStatsFor('LAST_14_DAYS');
					var stats_thirty_days = keywords.getStatsFor('LAST_30_DAYS');
					var stats_all_time = keywords.getStatsFor('ALL_TIME');
					
					// 7 days
					var a_averagecpc = stats_seven_days.getAverageCpc();
					var a_averagecpm = stats_seven_days.getAverageCpm();
					var a_averagepageviews = stats_seven_days.getAveragePageviews();
					var a_averageposition = stats_seven_days.getAveragePosition();
					var a_averagetimeonsite = stats_seven_days.getAverageTimeOnSite();
					var a_bouncerate = stats_seven_days.getBounceRate();
					var a_clickconversionrate = stats_seven_days.getClickConversionRate();
					var a_clicks = stats_seven_days.getClicks();
					var a_convertedclicks = stats_seven_days.getConvertedClicks();
					var a_cost = stats_seven_days.getCost();
					var a_ctr = stats_seven_days.getCtr();
					var a_impressions = stats_seven_days.getImpressions();
					
					// last 14 days
					var b_averagecpc = stats_fourteen_days.getAverageCpc();
					var b_averagecpm = stats_fourteen_days.getAverageCpm();
					var b_averagepageviews = stats_fourteen_days.getAveragePageviews();
					var b_averageposition = stats_fourteen_days.getAveragePosition();
					var b_averagetimeonsite = stats_fourteen_days.getAverageTimeOnSite();
					var b_bouncerate = stats_fourteen_days.getBounceRate();
					var b_clickconversionrate = stats_fourteen_days.getClickConversionRate();
					var b_clicks = stats_fourteen_days.getClicks();
					var b_convertedclicks = stats_fourteen_days.getConvertedClicks();
					var b_cost = stats_fourteen_days.getCost();
					var b_ctr = stats_fourteen_days.getCtr();
					var b_impressions = stats_fourteen_days.getImpressions();
					
					// last 30 days
					var c_averagecpc = stats_thirty_days.getAverageCpc();
					var c_averagecpm = stats_thirty_days.getAverageCpm();
					var c_averagepageviews = stats_thirty_days.getAveragePageviews();
					var c_averageposition = stats_thirty_days.getAveragePosition();
					var c_averagetimeonsite = stats_thirty_days.getAverageTimeOnSite();
					var c_bouncerate = stats_thirty_days.getBounceRate();
					var c_clickconversionrate = stats_thirty_days.getClickConversionRate();
					var c_clicks = stats_thirty_days.getClicks();
					var c_convertedclicks = stats_thirty_days.getConvertedClicks();
					var c_cost = stats_thirty_days.getCost();
					var c_ctr = stats_thirty_days.getCtr();
					var c_impressions = stats_thirty_days.getImpressions();
					
					// all time
					var d_averagecpc = stats_all_time.getAverageCpc();
					var d_averagecpm = stats_all_time.getAverageCpm();
					var d_averagepageviews = stats_all_time.getAveragePageviews();
					var d_averageposition = stats_all_time.getAveragePosition();
					var d_averagetimeonsite = stats_all_time.getAverageTimeOnSite();
					var d_bouncerate = stats_all_time.getBounceRate();
					var d_clickconversionrate = stats_all_time.getClickConversionRate();
					var d_clicks = stats_all_time.getClicks();
					var d_convertedclicks = stats_all_time.getConvertedClicks();
					var d_cost = stats_all_time.getCost();
					var d_ctr = stats_all_time.getCtr();
					var d_impressions = stats_all_time.getImpressions();
					
					// --------------------------
					// 7 Days - Cost / Conversion AND Bid result
					var a_cost_over_conversion = getCostOverConversion(a_cost, a_convertedclicks);
					var a_bid_result = getBidResult(TARGET_CPA, a_cost_over_conversion, a_averagecpc);
					
					// 14 Days - Cost / Conversion AND Bid result
					var b_cost_over_conversion = getCostOverConversion(b_cost, b_convertedclicks);
					var b_bid_result = getBidResult(TARGET_CPA, b_cost_over_conversion, b_averagecpc);
					
					// 30 Days - Cost / Conversion AND Bid result
					var c_cost_over_conversion = getCostOverConversion(c_cost, c_convertedclicks);
					var c_bid_result = getBidResult(TARGET_CPA, c_cost_over_conversion, c_averagecpc);
					
					// All Time - Cost / Conversion AND Bid result
					var d_cost_over_conversion = getCostOverConversion(d_cost, d_convertedclicks);
					var d_bid_result = getBidResult(TARGET_CPA, d_cost_over_conversion, d_averagecpc);
					// --------------------------
					
					var bid_array = [a_bid_result, b_bid_result, c_bid_result, d_bid_result];
					
					var new_bid = getNewBid(bid_array);
					
					// use upper-bid-limit value if new-bid is greater than upper-bid-limit.
					if(new_bid > UPPER_BID_LIMIT)
					{
						new_bid = UPPER_BID_LIMIT;
					}
					
					// Set the new Bid for this Keyword.
					if(new_bid <= UPPER_BID_LIMIT && new_bid <= TARGET_CPA && new_bid > 0)
					{
						keywords.setMaxCpc(new_bid);
					}
					else
					{
						Logger.log("Skipping!... New Bid is either 0, above Bid Limit and/or Target CPA.");
					}
					
					Logger.log(keyword + "\n:: 7 Day Bid = " + a_bid_result + " | 14 Day Bid = " + b_bid_result + " | 30 Day Bid = " + c_bid_result + " | All Time = " + d_bid_result + " | **New Bid = " + new_bid);
					Logger.log("\n");
					

				}
			}
		}
	} // end function getAllKeywords()
	
	
	// ------------------------------------
	// get Cost/Conversion result
	function getCostOverConversion(cost, convertedclicks) {
		
		var output = 0;
		if(cost != 0 && convertedclicks != 0)
		{
			var output = cost / convertedclicks;
		}
		return output;
	}
	
	// ------------------------------------
	// get the Bid result.
	function getBidResult(TARGET_CPA, cost_over_conversion, averagecpc) {
		
		var output = 0;
		if(cost_over_conversion != 0)
		{
			output = TARGET_CPA / cost_over_conversion;
			output = output * averagecpc;
		}
		output = output.toFixed(2);
		return output;
	}
	
	
	// ------------------------------------
	// compute for New Bid.
	function getNewBid(bids) {
		
		for(var i = bids.length-1; i--;)
		{
			if(bids[i] === "0.00")
			{
				bids.splice(i, 1);
			}
		}
		
		var total = 0;
		
		for (var x = 0; x < bids.length; x++)
		{ 
			total = total + Number(bids[x]);
		}
		
		var average = total / bids.length;
		
		return average.toFixed(2);
		//return bids.length;
		//return total.toFixed(2);
		
	}
	
	
	// ------------------------------------
	// HELPER FUNCTION
	// ------------------------------------
	function getSum(total, num) {
		
		return total + num;
	}
	
	
	
	getAllKeywordsStats(CAMPAIGN_NAME);
	
} // end function main()