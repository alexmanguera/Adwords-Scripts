/**************

====================
Exact/Broad Organizer
Current Version: 1.2.3
====================

Change Log:
ver 1.0
- Iterate over all keywords in a Campaign and copy the keyword to the Negative keyword list.
ver 1.1
- Create Negative Keyword list based off of the Campaign.
ver 1.2
- Ability to run on multiple Campaigns by specifying the Campaign Names within the CAMPAIGN_NAME array.
- Search for Unused Negative Keywords and remove from the list.
ver 1.2.1 (Bug Fix)
- Searching of keywords that has Exact Match Type (has [ ] symbols).
ver 1.2.2 (Bug Fix)
- Resolve issue with Phrase Match Type keywords.
ver 1.2.3
- Recognize keywords of different match type if existing or has been changed in the Campaign.
**************/

var CAMPAIGN_NAME = [
					'Search > Accounting (Phrase)','Search > Accounting (Exact)'
					];

function main() {

	function getKeywordsFromCampaign() {
		
		for(var i=0; i < CAMPAIGN_NAME.length; i++)
		{
			Logger.log("\n");
			Logger.log("============================================");
			Logger.log("Processing Keywords from Campaign: " + CAMPAIGN_NAME[i] + "...");
			Logger.log("============================================");
			
			var campaignIterator = AdWordsApp.campaigns()
										.withCondition('Name = "'+ CAMPAIGN_NAME[i] +'"')
										.get();
			  
			if (campaignIterator.hasNext())
			{
			
				var campaign = campaignIterator.next();
		
				var keywordIterators = campaign.keywords()
											.withCondition("Status = ENABLED")
											.withCondition("AdGroupStatus = ENABLED")
											.get();
				
				// =====================================
				var negativeKeywordList = AdWordsApp.negativeKeywordLists()
											.withCondition("Name = '" + CAMPAIGN_NAME[i] + "'").get();
				
				while(negativeKeywordList.hasNext())
				{
					var Negative = negativeKeywordList.next();
			
					if(keywordIterators.hasNext())
					{
						while(keywordIterators.hasNext())
						{
							var keywords = keywordIterators.next();
							var keyword = keywords.getText();
							
							var valid = true;
							
							if(keywords.getMatchType() === "EXACT")
							{
								var keywordfinal = keyword.replace('[','');
								keywordfinal = keywordfinal.replace(']','');								
							}
							else if(keywords.getMatchType() === "PHRASE"){
								var keywordfinal =  keyword.replace(/"/g, '' );
							}
							else{
								var keywordfinal = keyword;
							}
							
							var sharedNegativeKeywordSelector = Negative.negativeKeywords()
																.withCondition('KeywordText = "' + keywordfinal + '"')
																.withLimit(1);
																 
							var sharedNegativeKeywordIterator = sharedNegativeKeywordSelector.get();
							
							Logger.log("\n");
							Logger.log(keyword + ' ...');
							
							if(sharedNegativeKeywordIterator.hasNext())
							{
								valid = false;
								Logger.log('Not OK! (Keyword already exists in Negative List)');
								//break;
							}
							else
							{
								Logger.log('OK!');
								Negative.addNegativeKeyword(keyword);
							}
						}
					}
				}
				// =====================================
				
				Logger.log("\n");
				Logger.log("============================================");
				Logger.log("Searching for Unused Negative Keywords...");
				Logger.log("============================================")
				searchUnusedNegativeKeywords(CAMPAIGN_NAME[i]);
				
				Logger.log("\n");
				Logger.log("============================================");
				Logger.log('Done! All Keywords are processed for Campaign: '+ CAMPAIGN_NAME[i]);
				Logger.log("============================================");
			}
			else
			{
				Logger.log('Campaign not found!');
			}
		}
	}
	
	function createNegativeKeywordList() {
		
		for(var i=0; i < CAMPAIGN_NAME.length; i++)
		{
			var negativeKeywordList = AdWordsApp.negativeKeywordLists()
									.withCondition("Name = '" + CAMPAIGN_NAME[i] + "'").get();		  
				
			if (negativeKeywordList.hasNext())
			{
				Logger.log("\n");
				Logger.log(CAMPAIGN_NAME[i] + ': Negative list already exists!');
			}
			else
			{
				var negativeKeywordListOperators = AdWordsApp.newNegativeKeywordListBuilder()
											  .withName(CAMPAIGN_NAME[i])
											  .build();
				
				Logger.log("\n");
				Logger.log('Created New Negative List: ' + CAMPAIGN_NAME[i]);
			}
		}
	}
	
	function searchUnusedNegativeKeywords(campaignName)
	{
		var negativeKeywordList = AdWordsApp.negativeKeywordLists()
											.withCondition("Name = '" + campaignName + "'").get();
						
		while(negativeKeywordList.hasNext())
		{
			var Negative = negativeKeywordList.next();
			
			var sharedNegativeKeywordSelector = Negative.negativeKeywords();
												 
			var sharedNegativeKeywordIterator = sharedNegativeKeywordSelector.get();
			
			if(sharedNegativeKeywordIterator.hasNext())
			{
				while(sharedNegativeKeywordIterator.hasNext())
				{
					var negativeKeyword = sharedNegativeKeywordIterator.next();
					//Logger.log('Text: ' + negativeKeyword.getText() + ', MatchType: ' +	negativeKeyword.getMatchType());
					
					var keyword = negativeKeyword.getText();
					
					if(negativeKeyword.getMatchType() === "EXACT")
					{
						var keywordfinal = keyword.replace('[','');
						keywordfinal = keywordfinal.replace(']','');						
					}
					else if(negativeKeyword.getMatchType() === "PHRASE"){
						var keywordfinal =  keyword.replace(/"/g, '' );
					}
					else{
						var keywordfinal = keyword;
					}
					
					var keywordIterators = AdWordsApp.keywords()
											.withCondition('CampaignName = "'+ campaignName +'"')
											.withCondition('Text = "'+ keywordfinal +'"')
											.withCondition("Status = ENABLED")
											.withCondition("AdGroupStatus = ENABLED")
											.withLimit(1)
											.get();
					
					if(keywordIterators.hasNext())
					{
						var keywordMatchType = keywordIterators.next();
						
						if(negativeKeyword.getMatchType() === keywordMatchType.getMatchType())
						{
							continue;
						}
						else
						{
							Logger.log("\n");
							Logger.log('...Removing Negative Keyword: ' + negativeKeyword.getText());
							negativeKeyword.remove();
						}
					}
					else
					{
						Logger.log("\n");
						Logger.log('...Removing Negative Keyword: ' + negativeKeyword.getText());
						negativeKeyword.remove();
					}
				}
			}
		}
	}
	
	createNegativeKeywordList();
	getKeywordsFromCampaign();
}