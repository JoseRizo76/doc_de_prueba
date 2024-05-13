/* DECLARACION DE LIBRERIA */
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "token.h"
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Tarea de freeOS
TaskHandle_t Task2; // , Task3;

bool wifi_conectado = false;
bool firebase_conectado = false;

void conectWifi()
{
  if (!(WiFi.status() == WL_CONNECTED))
  {
    digitalWrite(13, LOW);
    digitalWrite(12, LOW);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    byte contador = 0;
    Serial.print("Conectando ..");
    while (WiFi.status() != WL_CONNECTED && contador <= 10)
    {
      Serial.print('.');
      contador++;
      digitalWrite(2, HIGH);
      delay(200);
      digitalWrite(2, LOW);
      delay(200);
    }
    Serial.println("");
    if (WiFi.status() == WL_CONNECTED)
    {
      delay(10);
      digitalWrite(12, HIGH);
      // IPAddress staticIP(192, 168, 0, 20);
      // IPAddress gateway(192, 168, 0, 1);
      // IPAddress subnet(255, 255, 255, 0);
      // IPAddress dns(8, 8, 8, 8);
      // WiFi.config(staticIP, gateway, subnet, dns);
      Serial.println("IP Address configured: " + WiFi.localIP().toString());
      wifi_conectado = true;
    }
    else
    {
      digitalWrite(13, HIGH);
      wifi_conectado = false;
    }
  }
  else
  {
    digitalWrite(12, HIGH);
    digitalWrite(13, LOW);
    digitalWrite(2, LOW);
    wifi_conectado = true;
    delay(2000);
  }
}

void sendFloat(String path, float value)
{
  if (Firebase.RTDB.setFloat(&fbdo, path.c_str(), value))
  {
    Serial.print("Writing value: ");
    Serial.println("PASSED");
  }
  else
  {
    Serial.println("FAILED");
  }
}

void setup()
{
  Serial.begin(115200);
  const int P_Salida[] = {2, 12, 13};
  for (byte i = 0; i < sizeof(P_Salida) / sizeof(P_Salida[0]); i++)
  {
    pinMode(P_Salida[i], OUTPUT);
  }
  conectWifi();
  conect_firebase(wifi_conectado);
  Serial.println(auth.token.uid.c_str());
  xTaskCreatePinnedToCore(loop3, "Task_2", 8600, NULL, 1, &Task2, 0); // APIWEATHER
  // xTaskCreatePinnedToCore(loop3,"Task_3",1600,NULL,1,&Task3,0); // RECONECTAR WIFI
}

void loop()
{
  delay(2000);
  if (!firebase_conectado)
    conect_firebase(wifi_conectado);
  // Serial.println("VOID LOOP");
}

void conect_firebase(bool estadocpy)
{
  if (estadocpy)
  {
    config.api_key = API_KEY;
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    config.database_url = DATABASE_URL;
    Firebase.reconnectWiFi(true);
    fbdo.setResponseSize(4096);

    config.token_status_callback = tokenStatusCallback;
    config.max_token_generation_retry = 5;
    Firebase.begin(&config, &auth);
    Serial.println("Getting User UID");
    while ((auth.token.uid) == "")
    {
      Serial.print('.');
      delay(1000);
    }
    firebase_conectado = true;
  }
  else
  {
    Serial.println("SIN INTERNET, ERROR FIREBASE");
  }
}

void loop3(void *parameter)
{
  for (;;)
  {
    delay(4000);
    conectWifi();
    Weather((wifi_conectado && firebase_conectado));
  }
  vTaskDelay(10);
}

// void loop2(void *parameter) {
//   for (;;) {
//     delay(10000);
//       Weather((wifi_conectado&& firebase_conectado));
//     vTaskDelay(10);
//   }
// }

void Weather(bool estadocpy)
{
  if (estadocpy)
  {
    HTTPClient http;
    if (http.begin(URL + "lat=" + lat + "&lon=" + lon + "&appid=" + ApiKey))
    {
      int httpCode = http.GET();
      if (httpCode > 0)
      {
        int contentLength = http.getSize();
        if (contentLength > 0)
        {
          std::unique_ptr<char[]> JSON_Data(new char[contentLength + 1]);

          http.getString().toCharArray(JSON_Data.get(), contentLength + 1);

          DynamicJsonDocument doc(contentLength + 1);
          DeserializationError error = deserializeJson(doc, JSON_Data.get());

          if (!error)
          {
            JsonObject obj = doc.as<JsonObject>();

            const float temp = obj["main"]["temp"].as<float>();
            const float press = obj["main"]["pressure"].as<float>();
            const float speed = obj["wind"]["speed"].as<float>();
            const float humidity = obj["main"]["humidity"].as<float>();
            const float p_rocio = (temp - ((100 - humidity) / 5));
            const char *dato = obj["name"].as<const char *>();

            FirebaseJsonArray arr2;
            arr2.add(humidity, temp, speed, press, p_rocio, dato, true);
            sendArrayToFirebase("/API-WEATHER", &arr2);
          }
          else
          {
            Serial.println("Failed to parse JSON!");
          }
        }
        else
        {
          Serial.println("Content-Length is zero!");
        }
      }
      else
      {
        Serial.println("Failed to connect to weather API!");
      }

      http.end();
    }
    else
    {
      Serial.println("Failed to begin HTTP request!");
    }
  }
  else
    Serial.println("WEATHER ERROR SIN INTERNET");
}

void sendArrayToFirebase(String path, FirebaseJsonArray *arr)
{
  arr->setFloatDigits(2);
  arr->setDoubleDigits(4);
  bool success = Firebase.RTDB.setArray(&fbdo, path.c_str(), arr);
  Serial.printf("Set array... %s\n", success ? "ok" : fbdo.errorReason().c_str());

  /*
  if (success) {
      success = Firebase.RTDB.getArray(&fbdo, path.c_str());

      // Imprimir el resultado de obtener el array de Firebase
      Serial.printf("Get array... %s\n", success ? fbdo.to<FirebaseJsonArray>().raw() : fbdo.errorReason().c_str());
  }*/
}
