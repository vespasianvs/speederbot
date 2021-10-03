const https = require("https");
const config = require("./config");
const twitter = require("twitter-lite");
const client = new twitter(config);

const API_KEY = "YOUR_NEXT_COM_API_KEY_HERE";
const COORDINATES = "51.0717,-1.7911;51.0665,-1.7874";
const ROAD_NAME = "A36";
const DETECT_SPEED = 50;

exports.checkData = () => {
	https.get(`https://traffic.ls.hereapi.com/traffic/6.1/flow.json?bbox=${COORDINATES}&units=imperial&apiKey=${API_KEY}`, (res) => {
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				const parsedData = JSON.parse(rawData);
				const speeds = [];
				const data = parsedData.RWS[0].RW.filter((roadData) => roadData.DE === ROAD_NAME);
				const foundDate = new Date(parsedData.CREATED_TIMESTAMP).toLocaleString("en-GB", { timeZone: "Europe/London" });
				data.forEach((d) => {
					d.FIS[0].FI.forEach((fis) => {
						fis.CF.forEach((cf) => {
							if (cf.SSS) {
								cf.SSS.SS.forEach((ss) => {
									if (ss.SU >= DETECT_SPEED && !speeds.includes(ss.SU)) speeds.push(ss.SU)
								});
							}
							if (cf.SU >= DETECT_SPEED && !speeds.includes(ss.SU)) speeds.push(cf.SU)
						});
					});
				});

				speeds.forEach((speed) => {
					client.post("statuses/update", { status: 
						`At ${foundDate} a driver seems to have been travelling at an average speed of ${speed} MPH in a 40mph area on Churchill Way East #SpeederBot #Speeding`
					}).then((result) => {
						console.log("POSTED SPEED", speed, result)
					}).catch((err) => console.error("Failed to post", err));
				})
			} catch (e) {
				console.error(e.message);
			}
		});
	})
}
