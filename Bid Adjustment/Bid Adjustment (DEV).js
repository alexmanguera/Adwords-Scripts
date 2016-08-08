/**************

====================
Bid Adjustment
Current Version: 1.4
====================

Change Log:
ver 1.0
- All results can only be seen within the log.
ver 1.1
- Apply value of upper-bid-limit (Max CPC) if new-bid is greater than upper-bid-limit.
ver 1.2
- Make use of array for Campaigns to allow processing of multiple Campaigns.
ver 1.3
- Allows to Compute for New Bid based on either ROAS method or conventional method.
ver 1.4
- Use "All-Time" bid as the new bid if keyword conversion for All-Time is not greater than 1.

**************/

var TARGET_CPA = 35;
var UPPER_BID_LIMIT = 10;
var TARGET_ROAS = 4;

var SEVEN_DAYS = "LAST_7_DAYS";
var FOURTEEN_DAYS = "LAST_14_DAYS";
var THIRTY_DAYS = "LAST_30_DAYS";
var ALL_TIME = "ALL_TIME";

// ---------------------------
// A = ROAS based.
// B = conventional.
var SELECTED_BID_METHOD = "A";
// ---------------------------

// ---------------------------
// provide the campaign names you need to process within the array.
var CAMPAIGN_NAME = [
					"AU > Brand Terms (BMM)",
					"AU > Generic Terms (BMM)"
					];
// ---------------------------

function main()
{

	function getAllKeywordsStats(campaignName) {
		
		for(var i=0; i < CAMPAIGN_NAME.length; i++)
		{
		
			var campaignIterator = AdWordsApp.campaigns()
				//.withCondition('Name = "' + campaignName + '"')
				.withCondition('Name = "' + CAMPAIGN_NAME[i] + '"')
				.get();
				
			if(campaignIterator.hasNext())
			{
				var campaign = campaignIterator.next();
				
				if(SELECTED_BID_METHOD == "A")
				{
					dispMethod = "ROAS based."
				}else{
					dispMethod = "Conventional."
				}
					
				Logger.log("===================================");
				Logger.log("Selected Method: " + dispMethod);
				Logger.log("Campaign Name: " + campaign.getName());
				Logger.log("Upper Bid Limit: " + UPPER_BID_LIMIT);
				Logger.log("Target CPA: " + TARGET_CPA);
				Logger.log("Target ROAS: " + TARGET_ROAS);
				Logger.log("===================================");
				Logger.log("\n");
								
				var keywordIterators = campaign.keywords()
										.withCondition('CampaignName = "'+ campaign.getName() +'"')
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
						var currentCPC = keywords.bidding().getCpc();
						
						var stats_seven_days = keywords.getStatsFor(SEVEN_DAYS);
						var stats_fourteen_days = keywords.getStatsFor(FOURTEEN_DAYS);
						var stats_thirty_days = keywords.getStatsFor(THIRTY_DAYS);
						var stats_all_time = keywords.getStatsFor(ALL_TIME);
						
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
						var roas_method = false;
						if(SELECTED_BID_METHOD == "A")
						{
							// ROAS
							var roas_method = true;
						}else{
							
							var roas_method = false;
						}
						// --------------------------
						
						
						// --------------------------
						// 7 Days - Cost / Conversion AND Bid result
						if(!roas_method)
						{
							var a_cost_over_conversion = getCostOverConversion(a_cost, a_convertedclicks);
							var a_bid_result = getBidResult(TARGET_CPA, a_cost_over_conversion, a_averagecpc);
						}
						else
						{
							// ROAS
							var a_conversion_value_over_cost = getConversionValueOverCost(campaign.getName(), keyword, SEVEN_DAYS);
							var a_bid_result_roas = getBidResultRoas(TARGET_ROAS, a_conversion_value_over_cost, a_averagecpc);
						}
						// --------------------------
						
						// --------------------------
						// 14 Days - Cost / Conversion AND Bid result
						if(!roas_method)
						{
							var b_cost_over_conversion = getCostOverConversion(b_cost, b_convertedclicks);
							var b_bid_result = getBidResult(TARGET_CPA, b_cost_over_conversion, b_averagecpc);
						}
						else
						{
							// ROAS
							var b_conversion_value_over_cost = getConversionValueOverCost(campaign.getName(), keyword, FOURTEEN_DAYS);
							var b_bid_result_roas = getBidResultRoas(TARGET_ROAS, b_conversion_value_over_cost, b_averagecpc);
						}
						// --------------------------
						
						// --------------------------
						// 30 Days - Cost / Conversion AND Bid result
						if(!roas_method)
						{
							var c_cost_over_conversion = getCostOverConversion(c_cost, c_convertedclicks);
							var c_bid_result = getBidResult(TARGET_CPA, c_cost_over_conversion, c_averagecpc);
						}
						else
						{
							// ROAS
							var c_conversion_value_over_cost = getConversionValueOverCost(campaign.getName(), keyword, THIRTY_DAYS);
							var c_bid_result_roas = getBidResultRoas(TARGET_ROAS, c_conversion_value_over_cost, c_averagecpc);
						}
						// --------------------------
						
						// --------------------------
						// All Time - Cost / Conversion AND Bid result
						if(!roas_method)
						{
							var d_cost_over_conversion = getCostOverConversion(d_cost, d_convertedclicks);
							var d_bid_result = getBidResult(TARGET_CPA, d_cost_over_conversion, d_averagecpc);
						}
						else
						{
							// ROAS
							var d_conversion_value_over_cost = getConversionValueOverCost(campaign.getName(), keyword, ALL_TIME);
							var d_bid_result_roas = getBidResultRoas(TARGET_ROAS, d_conversion_value_over_cost, d_averagecpc);
						}
						// --------------------------
						
						// ===============================================
						if(d_convertedclicks > 1)
						{
							var bid_array = [a_bid_result, b_bid_result, c_bid_result, d_bid_result];
							// ROAS
							var bid_array_roas = [a_bid_result_roas, b_bid_result_roas, c_bid_result_roas, d_bid_result_roas];
						}
						else
						{
							var bid_array = ["0.00", "0.00", "0.00", d_bid_result];
							// ROAS
							var bid_array_roas = ["0.00", "0.00", "0.00", d_bid_result_roas];
						}
						// ===============================================
	
						// --------------------------
						if(!roas_method)
						{
							var new_bid = getNewBid(bid_array);
							finalOutputNewBid = new_bid;
						}
						else
						{
							// ROAS
							var new_bid_roas = getNewBid(bid_array_roas);
							finalOutputNewBid = new_bid_roas;
						}
						// --------------------------
						
						var errorLog = "";
						var validNewBid = false;
						
						
						// use upper-bid-limit value if new-bid is greater than upper-bid-limit.
						if(finalOutputNewBid > UPPER_BID_LIMIT)
						{
							Logger.log("Notice!... New Bid ($"+finalOutputNewBid+") is above Upper-Bid-Limit. Using Upper-Bid-Limit as the New-Bid.");
							finalOutputNewBid = UPPER_BID_LIMIT;
							validNewBid = true;
						}
						else if(finalOutputNewBid > TARGET_CPA)
						{
							Logger.log("Skipping!... New Bid ($"+finalOutputNewBid+") is above Target CPA.");
							validNewBid = false;
						}
						else if(finalOutputNewBid == 0)
						{
							Logger.log("Skipping!... New Bid is $0.00");
							validNewBid = false;
						}
						else
						{
							validNewBid = true;
						}
						
						
						// ------------------------------------------------------------
						// Display Log
						if(!roas_method)
						{
							Logger.log(
										keyword + "\n:: 7 Day Bid = " + a_bid_result +
										" | 14 Day Bid = " + b_bid_result +
										" | 30 Day Bid = " + c_bid_result +
										" | All Time = " + d_bid_result +
										" | Current Bid = " + currentCPC + 
										" **New Bid = " + finalOutputNewBid
									  );
						}
						else
						{
							Logger.log(
										keyword + "\n:: 7 Day Bid = " + a_bid_result_roas +
										" | 14 Day Bid = " + b_bid_result_roas +
										" | 30 Day Bid = " + c_bid_result_roas +
										" | All Time = " + d_bid_result_roas +
										" | Current Bid = " + currentCPC + 
										" **New Bid = " + finalOutputNewBid
									  );
							
						}
						Logger.log("\n");
						// ------------------------------------------------------------
						
						
						// check to set maxCPC with new bid
						if(validNewBid)
						{
							if(typeof finalOutputNewBid != "undefined")
							{
								if(isNaN(finalOutputNewBid) == false)
								{
									keywords.setMaxCpc(finalOutputNewBid);
								}
							}
						}
						
					} // end while
				}
			} // end if
		} // end for loop
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
	function getBidResult(target_cpa, cost_over_conversion, averagecpc) {
		
		var output = 0;
		if(cost_over_conversion != 0)
		{
			output = target_cpa / cost_over_conversion;
			output = output * averagecpc;
		}
		output = output.toFixed(2);
		return output;
	}
	
	
	// ------------------------------------
	// ROAS
	// get Conversion/Cost result
	function getConversionOverCost(cost, convertedclicks) {
		
		var output = 0;
		if(cost != 0 && convertedclicks != 0)
		{
			var output = removeCommas(convertedclicks) / removeCommas(cost);
			output = output * 100;
		}
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
	// ROAS
	// get the Bid result.
	function getBidResultRoas(target_roas, conversion_value_over_cost, averagecpc) {
		
		var output = 0;
		if(conversion_value_over_cost != 0)
		{
			output = conversion_value_over_cost / target_roas;
			output = output * averagecpc;
		}
		output = output.toFixed(2);
		return output;
	}
	
	// ------------------------------------
	// query to retrieve the Conversion Value.	
	function getConversionValueOverCost(campaignName, keyword, timeline) {
		
		// "Criteria" is used to get the Keyword. KeywordText is deprecated.
		if(timeline == "ALL_TIME")
		{
		var report = AdWordsApp.report(
									'SELECT ConversionValue, Cost ' +
									'FROM KEYWORDS_PERFORMANCE_REPORT ' +
									'WHERE CampaignName = "' + campaignName + '" ' +
									'AND Criteria = "' + keyword + '"'
									);
		}
		else
		{
		var report = AdWordsApp.report(
									'SELECT ConversionValue, Cost ' +
									'FROM KEYWORDS_PERFORMANCE_REPORT ' +
									'WHERE CampaignName = "' + campaignName + '" ' +
									'AND Criteria = "' + keyword + '" ' +
									'DURING '+ timeline
									);			
		}
		var convValsIterator = report.rows();
		
		while(convValsIterator.hasNext())
		{
			var row = convValsIterator.next();
			var outConversionValue = row.ConversionValue;
			var outCost = row.Cost;
		}
		
		var output = 0;
		if(outConversionValue != 0 && outCost !=0)
		{
			var output = removeCommas(outConversionValue) / removeCommas(outCost);
			//var output = outConversionValue + " : " + outCost;
			output = output.toFixed(2);
		}
		return output;
	}
	
	
	
	// ------------------------------------
	// HELPER FUNCTION
	// ------------------------------------
	function getSum(total, num) {
		
		return total + num;
	}
	
	// remove commas in numbers.
	function removeCommas(str) {
		
		if(typeof str != "undefined")
		{
			while (str.search(",") >= 0) {
				str = (str + "").replace(',', '');
			}
		}
		return str;
	};
	
	
	
	getAllKeywordsStats(CAMPAIGN_NAME);
	
} // end function main()