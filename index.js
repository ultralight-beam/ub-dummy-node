const noble = require('@abandonware/noble');

const UB_SSID = '00756c74-7261-6c69-6768-74206265616d';
const ECHO_SERVICE_UUID = UB_SSID;
const WHISPER_UUID = '00000000-0000-0000-0000-000000000001';
const ECHO_CHARACTERISTIC_UUID = WHISPER_UUID;

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('[DUMMY_NODE] STATUS :: Scanning...');
    noble.startScanning([ECHO_SERVICE_UUID]);
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
    const serviceUUIDs = [ECHO_SERVICE_UUID];
    const characteristicUUIDs = [ECHO_CHARACTERISTIC_UUID];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });
  peripheral.on('disconnect', () => console.log('[DUMMY_NODE] STATUS :: Disconnected!'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
  console.log('[DUMMY_NODE] DISCOVERY :: Discovered services and characteristics');
  const echoCharacteristic = characteristics[0];

  // data callback receives notifications
  echoCharacteristic.on('data', (data, isNotification) => {
    console.log(`[DUMMY_NODE] Received :: ${data}`);
  });

  // subscribe to be notified whenever the peripheral update the characteristic
  echoCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to echoCharacteristic!');
    } else {
      console.log('[DUMMY_NODE] DISCOVERY :: Subscribed for echoCharacteristic notifications!');
    }
  });

  // create an interval to send data to the service
  let count = 0;
  setInterval(() => {
    count++;
    const msg = `[BLUETOOTH] From Greg -  ${count}`;
    const message = Buffer.alloc(msg.length, msg, 'utf-8');
    console.log(`[DUMMY_NODE] SENDING :: ${message}`);
    echoCharacteristic.write(message, false, function(err) {
      if(err) console.log(err)
    });
  }, 2500);
}
