#include <SensirionI2CSen5x.h>
#include <SensirionI2CScd4x.h>
#include <SensirionI2CSht4x.h>

SensirionI2CSen5x sen5x;
SensirionI2CScd4x scd4x;
SensirionI2CSht4x sht4x;

void setup()
{

    Serial.begin(115200);
    while (!Serial)
    {
        delay(100);
    }

    Wire.begin();

    uint16_t error;
    char errorMessage[256];

    sen5x.begin(Wire);
    scd4x.begin(Wire);
    sht4x.begin(Wire);

    /*
     * Devices Setup
     */

    error = sen5x.deviceReset();
    if (error)
    {
        Serial.print("SEN5x: Error trying to execute deviceReset(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
    }

    // Adjust tempOffset to account for additional temperature offsets
    // exceeding the SEN module's self heating.
    float tempOffset = 0.0;
    error = sen5x.setTemperatureOffsetSimple(tempOffset);
    if (error)
    {
        Serial.print("SEN5x: Error trying to execute setTemperatureOffsetSimple(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
    }
    else
    {
        Serial.print("SEN5x: Temperature Offset set to ");
        Serial.print(tempOffset);
        Serial.println(" deg. Celsius (SEN54/SEN55 only)");
    }

    // stop potentially previously started measurement
    error = scd4x.stopPeriodicMeasurement();
    if (error)
    {
        Serial.print("SCD4x: Error trying to execute stopPeriodicMeasurement(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
    }

    /*
     * Devices Start Measurement
     */

    error = sen5x.startMeasurement();
    if (error)
    {
        Serial.print("SEN5x: Error trying to execute startMeasurement(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
    }

    error = scd4x.startPeriodicMeasurement();
    if (error)
    {
        Serial.print("SCD4x: Error trying to execute startPeriodicMeasurement(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
    }
}

void loop()
{
    uint16_t error;
    char errorMessage[256];

    delay(29950); // 30 seconds

    // Read Measurement (SEN5x)
    float massConcentrationPm1p0;
    float massConcentrationPm2p5;
    float massConcentrationPm4p0;
    float massConcentrationPm10p0;
    float ambientHumidity1;
    float ambientTemperature1;
    float vocIndex;
    float noxIndex;

    bool sen5xSuccess = true;

    error = sen5x.readMeasuredValues(
        massConcentrationPm1p0, massConcentrationPm2p5, massConcentrationPm4p0,
        massConcentrationPm10p0, ambientHumidity1, ambientTemperature1, vocIndex,
        noxIndex);
    if (error)
    {
        Serial.print("Error trying to execute readMeasuredValues(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
        sen5xSuccess = false;
    }

    // Read Measurement (SCD4x)
    uint16_t co2 = 0;
    float temperature2 = 0.0f;
    float humidity2 = 0.0f;

    bool scd4xSuccess = true;

    error = scd4x.readMeasurement(co2, temperature2, humidity2);
    if (error)
    {
        Serial.print("Error trying to execute readMeasurement(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
        scd4xSuccess = false;
    }
    else if (co2 == 0)
    {
        Serial.println("Invalid sample detected, skipping.");
        scd4xSuccess = false;
    }

    // Read Measurement (SHT40)
    float temperature;
    float humidity;

    bool sht4xSuccess = true;

    error = sht4x.measureHighPrecision(temperature, humidity);
    if (error)
    {
        Serial.print("Error trying to execute measureHighPrecision(): ");
        errorToString(error, errorMessage, 256);
        Serial.println(errorMessage);
        sht4xSuccess = false;
    }

    // Generate Payload
    String payload = "{";

    if (sen5xSuccess)
    {
        payload += "\"PM1\":";
        payload += String(massConcentrationPm1p0, 1);
        payload += ",\"PM2.5\":";
        payload += String(massConcentrationPm2p5, 1);
        payload += ",\"PM4\":";
        payload += String(massConcentrationPm4p0, 1);
        payload += ",\"PM10\":";
        payload += String(massConcentrationPm10p0, 1);
        payload += ",\"HUM1\":";
        if (!isnan(ambientHumidity1))
        {
            payload += String(ambientHumidity1, 2);
        }
        payload += ",\"TMP1\":";
        if (!isnan(ambientTemperature1))
        {
            payload += String(ambientTemperature1, 2);
        }
        payload += ",\"VOC\":";
        if (!isnan(vocIndex))
        {
            payload += String(vocIndex, 0);
        }
        payload += ",\"NOX\":";
        if (!isnan(noxIndex))
        {
            payload += String(noxIndex, 0);
        }
    }

    if (scd4xSuccess)
    {
        if (sen5xSuccess)
        {
            payload += ",";
        }
        payload += "\"CO2\":";
        payload += String(co2);
        payload += ",\"TMP2\":";
        payload += String(temperature2, 2);
        payload += ",\"HUM2\":";
        payload += String(humidity2, 2);
    }

    if (sht4xSuccess)
    {
        if (scd4xSuccess || sen5xSuccess)
        {
            payload += ",";
        }
        payload += "\"TMP\":";
        payload += String(temperature, 2);
        payload += ",\"HUM\":";
        payload += String(humidity, 2);
    }

    payload += "}";
    // Serial.println(payload);

    Particle.publish("roomData", payload);
}
