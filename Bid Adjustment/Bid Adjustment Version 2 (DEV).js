/**************

====================
Bid Adjustment
Current Version: 2.0
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
ver 1.5
- Apply a limit to the increase (ex. 100% from current bid) and decrease (ex. 50% from current bid) of new bids based from the set upper-bid-limit (Max CPC).
ver 1.5.1
- Address issue with some incorrect results when checking for Min/Max percent increase/decrease of Bid from the Current CPC.
- Fix error with using new bid even if 0.00, instead use the existing CPC Bid as new Bid (no changes made to CPC of the keyword).
ver 2.0
- Complete overhaul of how Keyword iterations are made. Used KEYWORDS_PERFORMANCE_REPORT as initial query for keywords.
- More optimized implementation in terms of speed execution.
ver 2.0.1
- Fix issue when doing comparisons of Number values. Explicitly define the values as Numbers instead of the default string (javascript default).
ver 2.0.2
- Include output details such as keyword id and group id to determine duplicate keywords from separate ad groups.


**************/

var TARGET_CPA = 35;
var UPPER_BID_LIMIT = 10;
var TARGET_ROAS = 4;
var MAX_PERCENT_BID_INCREASE = 100;
var MAX_PERCENT_BID_DECREASE = 50;

// ---------------------------
// A = ROAS based.
// B = conventional.
var SELECTED_BID_METHOD = "B";
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
		
		if(SELECTED_BID_METHOD == "A")
		{
			dispMethod = "ROAS based."
		}else{
			dispMethod = "Conventional."
		}
		
		Logger.log("===================================");
		Logger.log("Selected Method: " + dispMethod);
		Logger.log("Upper Bid Limit: " + UPPER_BID_LIMIT);
		Logger.log("Target CPA: " + TARGET_CPA);
		Logger.log("Target ROAS: " + TARGET_ROAS);
		Logger.log("===================================");
		Logger.log("\n");
		
		
		
		
		for(var i=0; i < CAMPAIGN_NAME.length; i++)
		{
			var array_keywords_another = [];
			var array_keywords = [];
			
			Logger.log("===================================");
			Logger.log("Currently working on Campaign: " + CAMPAIGN_NAME[i] + '...');
			Logger.log("===================================");
			Logger.log("\n");
			
			var query_seven_days 	= AdWordsApp.report('SELECT Id, Criteria, AdGroupName, CampaignName, AdGroupId, CostPerConversion, AverageCpc, CpcBid, ConversionValue, Cost FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignName = "' + CAMPAIGN_NAME[i] + '" AND AdGroupStatus = ENABLED DURING LAST_7_DAYS');
			var query_fourteen_days = AdWordsApp.report('SELECT Id, Criteria, AdGroupName, CampaignName, AdGroupId, CostPerConversion, AverageCpc, CpcBid, ConversionValue, Cost FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignName = "' + CAMPAIGN_NAME[i] + '" AND AdGroupStatus = ENABLED DURING LAST_14_DAYS');
			var query_thirty_days 	= AdWordsApp.report('SELECT Id, Criteria, AdGroupName, CampaignName, AdGroupId, CostPerConversion, AverageCpc, CpcBid, ConversionValue, Cost FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignName = "' + CAMPAIGN_NAME[i] + '" AND AdGroupStatus = ENABLED DURING LAST_30_DAYS');
			var query_all_time_days = AdWordsApp.report('SELECT Id, Criteria, AdGroupName, CampaignName, AdGroupId, CostPerConversion, AverageCpc, CpcBid, ConversionValue, Cost FROM KEYWORDS_PERFORMANCE_REPORT WHERE CampaignName = "' + CAMPAIGN_NAME[i] + '" AND AdGroupStatus = ENABLED');
			
			awqlIteratorSevenDays = query_seven_days.rows();
			awqlIteratorFourteenDays = query_fourteen_days.rows();
			awqlIteratorThirtyDays = query_thirty_days.rows();
			awqlIteratorAllTime = query_all_time_days.rows();
			
			var SevenDays_array = [];
			var x = 0;
			
			while(awqlIteratorSevenDays.hasNext())
			{
				x++;
				
				awqlIteratorSevenDaysRow = awqlIteratorSevenDays.next();
				awqlIteratorSevenDays_keywordid = awqlIteratorSevenDaysRow.Id;
				awqlIteratorSevenDays_keyword = awqlIteratorSevenDaysRow.Criteria;
				awqlIteratorSevenDays_adgroup = awqlIteratorSevenDaysRow.AdGroupName;
				awqlIteratorSevenDays_campaign = awqlIteratorSevenDaysRow.CampaignName;
				awqlIteratorSevenDays_adgroupid = awqlIteratorSevenDaysRow.AdGroupId;
				awqlIteratorSevenDays_costperconversion = awqlIteratorSevenDaysRow.CostPerConversion;
				awqlIteratorSevenDays_averagecpc = awqlIteratorSevenDaysRow.AverageCpc;
				awqlIteratorSevenDays_cpcbid = awqlIteratorSevenDaysRow.CpcBid;
				awqlIteratorSevenDays_conversionvalue = awqlIteratorSevenDaysRow.ConversionValue;
				awqlIteratorSevenDays_cost = awqlIteratorSevenDaysRow.Cost;
			
				SevenDays_array[x] = [awqlIteratorSevenDays_keywordid,awqlIteratorSevenDays_keyword,awqlIteratorSevenDays_costperconversion,awqlIteratorSevenDays_averagecpc,awqlIteratorSevenDays_cpcbid,awqlIteratorSevenDays_conversionvalue,awqlIteratorSevenDays_cost,awqlIteratorSevenDays_adgroupid];
			}
			
			//Logger.log(SevenDays_array.length);
			
			// ===============================================
			
			var FourteenDays_array = [];
			var xx = 0;
			
			while(awqlIteratorFourteenDays.hasNext())
			{
				xx++;
				
				awqlIteratorFourteenDaysRow = awqlIteratorFourteenDays.next();
				awqlIteratorFourteenDays_keywordid = awqlIteratorFourteenDaysRow.Id;
				awqlIteratorFourteenDays_keyword = awqlIteratorFourteenDaysRow.Criteria;
				awqlIteratorFourteenDays_adgroup = awqlIteratorFourteenDaysRow.AdGroupName;
				awqlIteratorFourteenDays_campaign = awqlIteratorFourteenDaysRow.CampaignName;
				awqlIteratorFourteenDays_adgroupid = awqlIteratorFourteenDaysRow.AdGroupId;
				awqlIteratorFourteenDays_costperconversion = awqlIteratorFourteenDaysRow.CostPerConversion;
				awqlIteratorFourteenDays_averagecpc = awqlIteratorFourteenDaysRow.AverageCpc;
				awqlIteratorFourteenDays_cpcbid = awqlIteratorFourteenDaysRow.CpcBid;
				awqlIteratorFourteenDays_conversionvalue = awqlIteratorFourteenDaysRow.ConversionValue;
				awqlIteratorFourteenDays_cost = awqlIteratorFourteenDaysRow.Cost;
				
				FourteenDays_array[xx] = [awqlIteratorFourteenDays_keywordid,awqlIteratorFourteenDays_keyword,awqlIteratorFourteenDays_costperconversion,awqlIteratorFourteenDays_averagecpc,awqlIteratorFourteenDays_conversionvalue,awqlIteratorFourteenDays_cost,awqlIteratorFourteenDays_adgroupid];
			}
			
			//Logger.log(FourteenDays_array.length);
			
			// ===============================================
			
			var ThirtyDays_array = [];
			var xxx = 0;
			
			while(awqlIteratorThirtyDays.hasNext())
			{
				xxx++;
				
				awqlIteratorThirtyDaysRow = awqlIteratorThirtyDays.next();
				awqlIteratorThirtyDaysRow_keywordid = awqlIteratorThirtyDaysRow.Id;
				awqlIteratorThirtyDaysRow_keyword = awqlIteratorThirtyDaysRow.Criteria;
				awqlIteratorThirtyDaysRow_adgroup = awqlIteratorThirtyDaysRow.AdGroupName;
				awqlIteratorThirtyDaysRow_campaign = awqlIteratorThirtyDaysRow.CampaignName;
				awqlIteratorThirtyDaysRow_adgroupid = awqlIteratorThirtyDaysRow.AdGroupId;
				awqlIteratorThirtyDaysRow_costperconversion = awqlIteratorThirtyDaysRow.CostPerConversion;
				awqlIteratorThirtyDaysRow_averagecpc = awqlIteratorThirtyDaysRow.AverageCpc;
				awqlIteratorThirtyDaysRow_cpcbid = awqlIteratorThirtyDaysRow.CpcBid;
				awqlIteratorThirtyDaysRow_conversionvalue = awqlIteratorThirtyDaysRow.ConversionValue;
				awqlIteratorThirtyDaysRow_cost = awqlIteratorThirtyDaysRow.Cost;
				
				ThirtyDays_array[xxx] = [awqlIteratorThirtyDaysRow_keywordid,awqlIteratorThirtyDaysRow_keyword,awqlIteratorThirtyDaysRow_costperconversion,awqlIteratorThirtyDaysRow_averagecpc,awqlIteratorThirtyDaysRow_conversionvalue,awqlIteratorThirtyDaysRow_cost,awqlIteratorThirtyDaysRow_adgroupid];
			}
			
			//Logger.log(ThirtyDays_array.length);
			
			// ===============================================
			
			var AllTime_array = [];
			var xxxx = 0;
			
			while(awqlIteratorAllTime.hasNext())
			{
				xxxx++;
				
				awqlIteratorAllTimeRow = awqlIteratorAllTime.next();
				awqlIteratorAllTime_keywordid = awqlIteratorAllTimeRow.Id;
				awqlIteratorAllTime_keyword = awqlIteratorAllTimeRow.Criteria;
				awqlIteratorAllTime_adgroup = awqlIteratorAllTimeRow.AdGroupName;
				awqlIteratorAllTime_campaign = awqlIteratorAllTimeRow.CampaignName;
				awqlIteratorAllTime_adgroupid = awqlIteratorAllTimeRow.AdGroupId;
				awqlIteratorAllTime_costperconversion = awqlIteratorAllTimeRow.CostPerConversion;
				awqlIteratorAllTime_averagecpc = awqlIteratorAllTimeRow.AverageCpc;
				awqlIteratorAllTime_cpcbid = awqlIteratorAllTimeRow.CpcBid;
				awqlIteratorAllTime_conversionvalue = awqlIteratorAllTimeRow.ConversionValue;
				awqlIteratorAllTime_cost = awqlIteratorAllTimeRow.Cost;				
				
				AllTime_array[xxxx] = [awqlIteratorAllTime_keywordid,awqlIteratorAllTime_keyword,awqlIteratorAllTime_costperconversion,awqlIteratorAllTime_averagecpc,awqlIteratorAllTime_conversionvalue,awqlIteratorAllTime_cost,awqlIteratorAllTime_adgroupid];
			}
			
			//Logger.log(AllTime_array.length);
			
			
			var errorLog = "";
			var validNewBid = false;
			var skipping = false;
						
			for (a = 1; a < SevenDays_array.length; a++)
			{
				for (b = 1; b < FourteenDays_array.length; b++)
				{
					if(Number(SevenDays_array[a][0]) == Number(FourteenDays_array[b][0]))
					{
						for (c = 1; c < ThirtyDays_array.length; c++)
						{
							if(Number(FourteenDays_array[b][0]) == Number(ThirtyDays_array[c][0]))
							{
								for (d = 1; d < AllTime_array.length; d++)
								{
									if(Number(ThirtyDays_array[c][0]) == Number(AllTime_array[d][0]))
									{
										if(array_keywords.indexOf(AllTime_array[d][0] + AllTime_array[d][7]) >= 0)
										{
											continue;
										}else{
											curr_keywordid = AllTime_array[d][0] + AllTime_array[d][7];
											array_keywords = [curr_keywordid];
										}
										
										if(SELECTED_BID_METHOD == "B")
										{
											// conventional
											a_bid_result = getBidResult(TARGET_CPA, SevenDays_array[a][2], SevenDays_array[a][3]);
											b_bid_result = getBidResult(TARGET_CPA, FourteenDays_array[b][2], FourteenDays_array[b][3]);
											c_bid_result = getBidResult(TARGET_CPA, ThirtyDays_array[c][2], ThirtyDays_array[c][3]);
											d_bid_result = getBidResult(TARGET_CPA, AllTime_array[d][2], AllTime_array[d][3]);
										}
										else
										{
											// roas based
											a_conversion_value_over_cost = getConversionValueOverCost(SevenDays_array[a][4], SevenDays_array[a][5]);
											a_bid_result = getBidResultRoas(TARGET_ROAS, a_conversion_value_over_cost, SevenDays_array[a][3]);
											
											b_conversion_value_over_cost = getConversionValueOverCost(FourteenDays_array[b][4], FourteenDays_array[b][5]);
											b_bid_result = getBidResultRoas(TARGET_ROAS, b_conversion_value_over_cost, FourteenDays_array[b][3]);
											
											c_conversion_value_over_cost = getConversionValueOverCost(ThirtyDays_array[c][4], ThirtyDays_array[c][5]);
											c_bid_result = getBidResultRoas(TARGET_ROAS, c_conversion_value_over_cost, ThirtyDays_array[c][3]);
											
											d_conversion_value_over_cost = getConversionValueOverCost(AllTime_array[d][4], AllTime_array[d][5]);
											d_bid_result = getBidResultRoas(TARGET_ROAS, d_conversion_value_over_cost, AllTime_array[d][3]);
										}
										
										var bid_array = [a_bid_result, b_bid_result, c_bid_result, d_bid_result];
										
										var new_bid = getNewBid(bid_array);
										
										// ------------------------------------------------------------	
										if(Number(new_bid) > Number(TARGET_CPA))
										{
											Logger.log("Skipping!... New Bid ($"+new_bid+") is above Target CPA ($" +TARGET_CPA + ").");
											validNewBid = false;
										}
										else if(Number(new_bid) == 0)
										{
											new_bid = SevenDays_array[a][4];
											//Logger.log("Skipping!... New Bid is $0.00");
											validNewBid = false;
											skipping = true;
										}
										else
										{
											validNewBid = true;
										}
										// ------------------------------------------------------------	
										
										// ------------------------------------------------------------
										//if(!skipping)
										//{
											// check if it passes the bid limits for an increase/decrease.
											var resultMaxCpcLimit = checkMaxCpcLimit(SevenDays_array[a][4], new_bid);
											//var applyLimitBid = false;
											
											if(Number(new_bid) > Number(SevenDays_array[a][4]))
											{
												if(Number(new_bid) > Number(resultMaxCpcLimit))
												{
													//applyLimitBid = true;
													var LimitFinalOutputNewBid = resultMaxCpcLimit;
												}else{
													LimitFinalOutputNewBid = new_bid;
												}
											}
											else if(Number(new_bid) < Number(SevenDays_array[a][4]))
											{
												if(Number(new_bid) < Number(resultMaxCpcLimit))
												{
													//applyLimitBid = true;
													var LimitFinalOutputNewBid = resultMaxCpcLimit;
												}else{
													LimitFinalOutputNewBid = new_bid;
												}
											}
											else
											{
												LimitFinalOutputNewBid = new_bid;
											}
										//}	
										// ------------------------------------------------------------			
									
										// ------------------------------------------------------------	
										array_keywords_another[a] = [SevenDays_array[a][1],LimitFinalOutputNewBid,SevenDays_array[a][0],SevenDays_array[a][7]];
										// ------------------------------------------------------------	
										
										//Logger.log(a +  ' -- ' + SevenDays_array[a][1] + ' | ' + a_bid_result + ' | ' + b_bid_result + ' | ' + c_bid_result + ' | ' + d_bid_result + ' == Current Bid: ' + SevenDays_array[a][4] + ' == New Bid: ' + new_bid);
										Logger.log(SevenDays_array[a][1] + ' Ad Group Id: ' + SevenDays_array[a][7] + ' | ' + a_bid_result + ' | ' + b_bid_result + ' | ' + c_bid_result + ' | ' + d_bid_result + ' == Current Bid: ' + SevenDays_array[a][4] + ' == New Bid: ' + new_bid);
										Logger.log("\n");
										
										break;
									}else{
										continue;
									}
								}
							}
						}
					}
				}
			} // end for loop
			
			
			// =======================================
			Logger.log("=======================================================================");
			Logger.log("Applying Generated New Bids...");
			Logger.log("=======================================================================");
			Logger.log("\n");
			
			var keywordIterators = AdWordsApp.keywords()
									.withCondition('CampaignName = "'+ CAMPAIGN_NAME[i] +'"')
									.withCondition("Status = ENABLED")
									.withCondition("AdGroupStatus = ENABLED")
									.get();
			
			if(keywordIterators.hasNext())
			{
				var y = 0;
				while(keywordIterators.hasNext())
				{
					y++;
					
					var keywords = keywordIterators.next();
					
					var keyword = keywords.getText();
					var AdGroup = keywords.getAdGroup().getName();
					var currentCPC = keywords.bidding().getCpc();
					
					for (a = 1; a < array_keywords_another.length; a++)
					{
						if(keyword == array_keywords_another[a][0])
						{
							if(currentCPC != array_keywords_another[a][1])
							{
								Logger.log('Keyword ID: ' + array_keywords_another[a][2] + ' -- Ad Group ID: ' + array_keywords_another[a][3] + ' -- Keyword: ' + array_keywords_another[a][0] + ' | (Current Bid: ' + currentCPC + ') -- Applying New Bid (' + array_keywords_another[a][1] + ')...Done!');
								keywords.setMaxCpc(array_keywords_another[a][1]);
							}
						}
					}
					
				}
			}
			// =======================================
			
			Logger.log("\n");
			Logger.log('Campaign "' + CAMPAIGN_NAME[i] + '" is done!');
			Logger.log("\n");
			
		} // end for loop
		
		
		
		
		// =======================================
		Logger.log("\n");
		Logger.log('Total Process is Complete!');
		Logger.log("\n");
		// =======================================
		
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
	function getConversionValueOverCost(ConversionValue, Cost) {
		
		var output = 0;
		if(ConversionValue != 0 && Cost !=0)
		{
			var output = removeCommas(ConversionValue) / removeCommas(Cost);
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
	}
	
	// check if new bid is not beyond the set max percent limit for both increasing and decreasing bids.
	function checkMaxCpcLimit(currentCPC, finalOutputNewBid)
	{
		var CorrectcurrentCPC = Number(currentCPC);
		var CorrectfinalOutputNewBid = Number(finalOutputNewBid);
		
		if(CorrectfinalOutputNewBid > CorrectcurrentCPC)
		{
			var x = CorrectcurrentCPC;
			var y = MAX_PERCENT_BID_INCREASE;
			var z = parseFloat(y)/100;
			var out = x * z;
			out = out + x;
			out = out.toFixed(2);
			out = Number(out);
			
			
			if(CorrectfinalOutputNewBid <= out)
			{
				var valid = 'OK';
				Logger.log('OK! + New Bid (' + CorrectfinalOutputNewBid + ') is less than/equal to ' + MAX_PERCENT_BID_INCREASE + '% (' + out + ') of Current CPC: ' + CorrectcurrentCPC);
				
				//return true;
			}
			else if(CorrectfinalOutputNewBid > out)
			{
				var valid = 'NOT OK';
				Logger.log('NOT OK! + New Bid (' + CorrectfinalOutputNewBid + ') is more than ' + MAX_PERCENT_BID_INCREASE + '% (' + out + ') of Current CPC: ' + CorrectcurrentCPC + '. Will be applying (' + out + ') as the new bid');
				
				//return false;
			}
			var output = out;
		}
		else if(CorrectfinalOutputNewBid < CorrectcurrentCPC)
		{
			var x = CorrectcurrentCPC;
			var y = MAX_PERCENT_BID_DECREASE;
			var z = parseFloat(y)/100;
			var out = x * z;
			out = out.toFixed(2);
			out = Number(out);
			
			if(CorrectfinalOutputNewBid >= out)
			{
				var valid = 'OK';
				Logger.log('OK! - New Bid (' + CorrectfinalOutputNewBid + ') is more than/equal to ' + MAX_PERCENT_BID_DECREASE + '% (' + out + ') of Current CPC: ' + CorrectcurrentCPC);
				
				//return true;
			}
			else
			{
				var valid = 'NOT OK';
				Logger.log('NOT OK! - New Bid (' + CorrectfinalOutputNewBid + ') is less than ' + MAX_PERCENT_BID_DECREASE + '% (' + out + ') of Current CPC: ' + CorrectcurrentCPC + '. Will be applying (' + out + ') as the new bid');
				
				//return false;
			}
			var output = out;
		}
		
		if(Number(output) > Number(UPPER_BID_LIMIT))
		{
			//applyLimitBid = true;
			Logger.log("Notice!... New Bid ($"+output+") is above Upper-Bid-Limit. Using Upper-Bid-Limit as the New-Bid.");
			output = UPPER_BID_LIMIT;
		}
		
		return output;
	}
	
	//checkMaxCpcLimit();
	
	getAllKeywordsStats(CAMPAIGN_NAME);
	
} // end function main()