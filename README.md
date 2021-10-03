# speederbot

This speederbot is set up to use a Google Cloud Function and Cloud Scheduler to run as a bot which calls the Here.com API and then . In normal use, the bot will run entirely for free.

## Limitations

This bot uses the Here.com API, which provides traffic flow data. Unfortunately traffic flow data is only available for major roads such as A roads in the UK. This is because their dataset needs to have a certain traffic density to work. Also, the data is anonymous. It provides traffic *flow*, not reporting of speeding by default.

## Important

You are going to be generating API Keys, Secret Keys and Access Tokens. **DO NOT** publish share or otherwise give these to anybody. This is *your* security and could seriously mess up your bot!

## Setup

### 1. The highest priority job is to get your Twitter account set up for your bot. This process can take up to 48 hours!
1. Create the Twitter account for your bot, e.g. @MySpeederBot - the account *must* have an email address associated with it.
2. Go to [Twitter Developer]https://developer.twitter.com/ - **Make sure that you are logged as your bot!**
3. Apply for a Twitter Developer account (press the Apply button in the top right)
4. I applied as follows:
	- Hobbyist
	- Making a bot
	- Filled in my details
	- Describe what your bot is going to do and if it's going to interact with any users etc - be detailed here!
	- I said no to everything in the 'specifics' **except** the second one, because my bot will only be tweeting. Here, I put an example of the tweet text my bot was going to use.
5. Assuming you gave them enough info, your application will get approved, otherwise they will ask for more info - this can take some time! It took me an exchange of 4 emails to get approved.
### 2. Create a Here.com developer account. This is Free:  https://developer.here.com/sign-up?create=Freemium-Basic&keepState=true&step=account
1. Create a new 'Freemium' project and create a REST API. You need to copy the API KEY (**NOT** the APP ID!)
2. The Bot uses a flow bounding box as the source of it's traffic flow data, draw a box around your road, test and note the 4 coordinates (e.g. 51.5082,-0.1285;51.5062,-0.1265). https://developer.here.com/documentation/examples/rest/traffic/traffic-flow-bounding-box Click into the "bbox" and move the map location to your desired road, try and make this as small as possible to only capture local traffic flows. Then click "Send Request" the results will appear in the black box and note down the 4 coordinates.
3. Check the output of the Send Request. Here Technologies appear to provide outputs for Major Trunk Roads. These are A-Roads and Motorways. Although there are some B-Roads included in the output, these appear to be the exception. Make a note of *which* road you want to use, e.g. A1 or M1. Also determine the actual speed limit for the section of road that you are monitoring.

### 3. Download the code from https://github.com/vespasianvs/speederbot - either as a zip file or use git to clone the repository.
1. Edit the file *index.js* as follows:
	- Put your HERE API KEY from step 2.2 where it says YOUR_NEXT_COM_API_KEY_HERE - make sure you copy any dashes or other punctuation at the start of the string.
	- Put your BBox coordinates from step 2.3 where it says YOUR_COORDINATES_HERE.
	- Put your Road name from step 2.3 where it says ROAD_NAME_HERE!
	- In ROAD_DESCRIPTION, give your road name a nice human readable description, e.g. 'High Street' or 'the A36'
	- In POSTED_SPEED_LIMIT, put the posted speed limit, e.g. 30mph
	- Set the trigger speed limit for DETECT_SPEED (I usually use 10mph above the posted speed limit)
2. Rename *config.js.sample* to *config.js*.

### 4. Log into your (approved?) Twitter Developer Account (as your bot) and head to the Developer Portal.
1. Click ' + Create Project App ' and enter a name for it (e.g. my_hometown_speederbot)
2. You will immediately be given an API Key and API Secret Key - copy the api key into 'Consumer Key' and API Secret Key into 'Consumer Secret' in *config.js*. **These will not be shown again!**
3. Click on App Settings then at the top click 'Keys and tokens'
4. Under Authentication Tokens, next to Access Token and Secret click the 'Generate Button'. Copy these tokens into the access_token_key and access_token_secret fields in *config.js*
### 5. Create a Google Cloud Developer Account (you'll need a Google account for this). https://cloud.google.com/
1. Head to the console and then Find 'Cloud Functions' from the menu.
2. Click 'Create Function'
	- Give your function a name, e.g. speeding-a36
	- region: for UK you want europe-west2
	- Set the trigger type to Cloud Pub/Sub
	- Click 'Select a Cloud Pub/Sub topic and then click 'Create a topic'
	- Enter a name, e.g. run-bot-a36 - you don't need to tick any of the boxes
	- Press Save, then press Next (at the bottom of the page)
	- In the inline editor, delete all of the text from index.js and then copy the contents of the file that you edited in step 6 (with your API Key, bbox etc)
	- Then change to package.json and copy the contents of package.json from this project into the inline editor.
	- In the inline editor click the + icon and set the filename to *config.js*
	- Copy the contents of config.js in this project into the Inline Editor (with all of your Keys and access tokens!)
	- Press Deploy
	- Once it has deployed, click the three dots under 'Actions' and click 'Test Function' if it runs - great it should post some tweets, if not you have something wrong in the code - you need to fix that! :)
3. Now head to Cloud Scheduler on the main navigation menu
4. Click 'Create Job'
	- Give it a name that makes sense
	- Set the frequency (I use every 15 mins, which is: */15 * * * * )
	- Set the timezone (Europe/London)
	- Click 'Continue'
	- Set the Target Type to Pub/Sub
	- Select the Pub/Sub topic that we created earlier, e.g. run-bot-a36
	- Set the message body to NULL
	- Click 'Next' then leave all of the retry settings as default and click 'Create'
	- On the cloud scheduler you can click 'Run Now' to see if the Result comes out as 'Success' - if it doesn't, you'll need to figure that out yourself!

Your bot should now query the Here.com API every 15 minutes and then post to Twitter. I have actually under Cloud Functions -> Actions, used the Copy Function to created three copies of the bot and set different bounding boxes and roads to have my Twitter Bot tweet about three different locations, which is pretty awesome. Each function needs to be run by a scheduler, but it can use the same schedule (just select the same topic in step 5.2.4 instead of creating a new topic).

### Important Cost things

* Here.Com allow you to make 250k queries a month - you're unlikely to hit this.
* Google Cloud allows you to run Cloud Functions up to 2 MILLION times before they charge you (this is all of your functions added up!)
* Google Cloud allows you to have three schedules free, after that it's 10p per month for each additional schedule (remember, one schedule can call multiple functions).

* Google *may* require you to have payment information on file - keep an eye on your account o make sure you're not running up a bill!

# Finally - Good Luck!

## If you find problems

If you feel like there is anything wrong with the code, any improvements to the instructions or anything else please feel free to fork the repository, fix it and then submit a Pull Reuqest. This is open source and it helps if everybody contributes. If none of that last sentence made any sense, go [here]https://github.com/vespasianvs/speederbot/issues and raise a new issue - but be precise with the problem you're having. 'It doesn't work' doesn't help anybody to fix anything!




