/**************

====================
MCC Ad Checker
Current Version: 1.0
====================

Change Log:
ver 1.0
- Works for MCC Account.

**************/

// email recipient of the report.
var EMAIL = "web01@contevo.com.au";

// supply a manager-account-id if you want to process
// all accounts under a manager-account.
// if this is not empty, manager-account will be used instead of specific client-accounts.
var MANAGER_ACCOUNT = "934-413-5589"; // clients.contevo2 manager-account

// supply client-ids for all client-account that you want to process.
// this will be used instead, if manager-account is not specified.
var CLIENT_ACCOUNTS = ["901-943-5940", "428-094-9659"]; // Get Workwear Direct, Wridgways


var EMAIL_REPORT = [];

function main()
{
    //--------------------------------------------//
	// for MCC
	// Select the accounts to be processed. You can process up to 50 accounts.
	if(MANAGER_ACCOUNT.length < 1 || MANAGER_ACCOUNT == "")
	{
		var accountSelector = MccApp.accounts()
							.withIds(["'"+CLIENT_ACCOUNTS.join("','")+"'"])
							.withLimit(50);
	}
	else
	{
		var accountSelector = MccApp.accounts()
							.withCondition("ManagerCustomerId IN ['" + MANAGER_ACCOUNT + "']")
							.withLimit(50);	
	}

	// Process the account in parallel. The callback method is optional.
	accountSelector.executeInParallel('adCheck', 'allFinished');
	
    //--------------------------------------------//
}// end function main


function adCheck() {
			
	var campaignIterator = AdWordsApp.campaigns()
							.withCondition("Status = ENABLED")
							.get();
							
	//--------------------------------------------//
	// for MCC
	var account = AdWordsApp.currentAccount();
	var currAccountName = account.getName();
	var currAccountId = account.getCustomerId();
	//--------------------------------------------//

	if(campaignIterator.hasNext())
	{
		Logger.log('Total campaigns found : ' + campaignIterator.totalNumEntities());
		
		while(campaignIterator.hasNext())
		{
			var campaign = campaignIterator.next();
			
			Logger.log("Campaign Name: " + campaign.getName());
			
			var adGroupIterator = campaign.adGroups()
				.withCondition("Status = ENABLED")
				.get();
			
			if(adGroupIterator.hasNext())
			{
				Logger.log('Total Ad Groups found : ' + adGroupIterator.totalNumEntities());
				
				while(adGroupIterator.hasNext())
				{
					var adgroup = adGroupIterator.next();						
					
					var adsIterator = adgroup.ads()
										//.withCondition('Type=TEXT_AD')
										.withCondition("Status = ENABLED")
										.get();
					
					//if(adsIterator.hasNext())
					//{
						Logger.log(currAccountName + " - " + adgroup.getName() + " (" + adsIterator.totalNumEntities() + ")");
					
						if(adsIterator.totalNumEntities() < 2)
						{
							message = "- " + currAccountName + " | " + campaign.getName() + " | " + adgroup.getName() + " (" + adsIterator.totalNumEntities() + ")\r\n";
							EMAIL_REPORT.push(message);
						}
					//}	
				}
			}
		}
	}
	var finalOutput = EMAIL_REPORT.join(" ");
	return finalOutput;
	
	
}// end function getAllCampaigns


function allFinished(results) {
	
	Logger.log('Process has finished!');
	sendSimpleTextEmail(results);
	
}// end function allFinished


// send Email Report
function sendSimpleTextEmail(emailReport) {
	
	var outputArray = [];
	
	for (var i = 0; i < emailReport.length; i++) {
		outputArray.push(emailReport[i].getReturnValue());
	}
	
	MailApp.sendEmail(
					EMAIL,
					'Ad Checker Report',
					'Account | Campaign | Ad Group (no. of Ads)\r\n\r\n' + outputArray.join()
					);
					
}