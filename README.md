# Room Tracker

A simple website for storing and displaying air quality data from a hardware tracker.

## Hardware

This project uses a [Particle Photon](https://docs.particle.io/photon/) to read data from a [SEN55](https://sensirion.com/products/catalog/SEN55/) particulate matter/VOC/NOX sensor, a [SCD40](https://www.adafruit.com/product/5187) CO2 sensor, and a [SHT40](https://www.adafruit.com/product/4885) temperature/humidity sensor. The sensors are directly connected to the Photon via I2C.

Since libraries for these sensors are not available directly on Particle, you'll need to [upload them yourself](https://docs.particle.io/reference/developer-tools/cli/#particle-library-upload).

The firmware for the Photon is in `hardware/roomtracker.ino`.

## Data

Data collected from the sensors are published via Particle Cloud events. A serverless function proxies the data using an [API user token](https://docs.particle.io/reference/cloud-apis/access-tokens/#getting-an-api-user-token), which is then displayed live on the site using [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

A webhook is also used to send data to a Google Sheet using Apps Script, and that data is stored to GitHub using a GitHub Action. Historical data is stored in this repositiory under the `archive` directory.
