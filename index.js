const noble = require('@abandonware/noble');
const ethers = require("ethers");

const IS_ETH = process.argv[2] === "eth";
const pkey = process.argv[3];
const NONCE = process.argv[4] ? "0x" + process.argv[4].toString(16) : 0;

const WORD = IS_ETH ? "ETH" : "Whisper";
const UB_SSID = '00756c74-7261-6c69-6768-74206265616d';
const WHISPER_UUID = '00000000-0000-0000-0000-000000000001';
const ETH_CHARACTERISTIC_UUID = '00000000-0000-0000-0000-000000000002';

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('[DUMMY_NODE] STATUS :: Scanning...');
    noble.startScanning([UB_SSID]);
  } else {
    console.log('[DUMMY_NODE] STATUS :: Scanning off!');
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    noble.stopScanning();
    const name = peripheral.advertisement.localName;
    console.log(`[DUMMY_NODE] CONNECTING :: Connecting to... ${name} ${peripheral.id}...`);
    connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {
  peripheral.connect(error => {
    if (error) console.error({error});

    console.log('[DUMMY_NODE] CONNECTING :: connecting too... ', peripheral.id);

    // specify the services and characteristics to discover
    const serviceUUIDs = [UB_SSID];
    const characteristicUUIDs = IS_ETH ? [ETH_CHARACTERISTIC_UUID] : [WHISPER_UUID];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });
  peripheral.on('disconnect', () => console.log('[DUMMY_NODE] STATUS :: Disconnected!'));
}

async function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
  console.log('[DUMMY_NODE] DISCOVERY :: Discovered services and characteristics');
  const characteristic = characteristics[0];

  // data callback receives notifications
	characteristic.on('data', (data, isNotification) => {
    console.log(`[DUMMY_NODE] Received :: ${data}`);
  });

  // subscribe to be notified whenever the peripheral update the characteristic
	characteristic.subscribe(error => {
    if (error) console.error(`Error subscribing to ${WORD}Characteristic!`);
    console.log(`[DUMMY_NODE] DISCOVERY :: Subscribed for ${WORD}Characteristic notifications!`);

    // create an interval to send data to the service
	  let count = 0;
	  if(!IS_ETH) {
		  console.log("[DUMMY_NODE] MODE :: CENTRAL");
		  setInterval(() => {
			  count++;
			  const msg = `[BLUETOOTH] From Greg -  ${count}`;
			  const message = Buffer.alloc(msg.length, msg, 'utf-8');
			  console.log(`[DUMMY_NODE] SENDING :: ${message}`);
			  characteristic.write(message, false, function (err) {
				  if (err) console.log(`[DUMMY_NODE] ERROR :: ${err}`);
				  console.log(`[DUMMY_NODE] SENDING :: Dummy message`);
			  });
		  }, 2500)
	  } else {
		  console.log(`[DUMMY_NODE] MODE :: ${WORD}`);
		  sendTx(characteristic);
	  }
	});
}

function sendTx(characteristic) {
	let wallet = new ethers.Wallet(pkey);
	let transaction = {
		nonce: NONCE,
		gasLimit: 21000,
		gasPrice: ethers.utils.bigNumberify("20000000000"),
		to: "0x1000000000000000000000000000000000000001",
		value: ethers.utils.parseEther("0.001"),
		data: "0x",
		chainId: ethers.utils.getNetwork('goerli').chainId
	};
	let signPromise = wallet.sign(transaction);
	signPromise.then(function (signedTx) {
		console.log(signedTx);
		characteristic.write(Buffer.from(signedTx), false, function (err) {
		 	if (err) console.log(`[DUMMY_NODE] ERROR :: ${err}`);
		 	console.log(`[DUMMY_NODE] SENDING :: Sent signed transaction`);
		 })
	})
}
