const noble = require('@abandonware/noble');

const UB_SSID = 'c3fcb7cb-aed4-4a5a-9565-ca4cbb76b0ff';
const ECHO_SERVICE_UUID = UB_SSID;
const ECHO_CHARACTERISTIC_UUID = 'ec0e';

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Scanning...');
    noble.startScanning([ECHO_SERVICE_UUID]);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    noble.stopScanning();
    const name = peripheral.advertisement.localName;
    console.log(`Connecting to ${name} ${peripheral.id}...`);
    connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {
  peripheral.connect(error => {
    if (error) console.error({error});

    console.log('Connected to :: ', peripheral.id);

    // specify the services and characteristics to discover
    const serviceUUIDs = [ECHO_SERVICE_UUID];
    const characteristicUUIDs = [ECHO_CHARACTERISTIC_UUID];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });
  peripheral.on('disconnect', () => console.log('Disconnected!'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
  console.log('Discovered services and characteristics');
  const echoCharacteristic = characteristics[0];

  // data callback receives notifications
  echoCharacteristic.on('data', (data, isNotification) => {
    console.log(`Received :: ${data}`);
  });

  // subscribe to be notified whenever the peripheral update the characteristic
  echoCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to echoCharacteristic!');
    } else {
      console.log('Subscribed for echoCharacteristic notifications!');
    }
  });

  // create an interval to send data to the service
  let count = 0;
  setInterval(() => {
    count++;
    const message = new Buffer('Go fuck yourself ' + count, 'utf-8');
    console.log(`Sending :: ${message}`);
    echoCharacteristic.write(message, false, function(err) {
      if(err) console.log(err)
    });
  }, 2500);
}
