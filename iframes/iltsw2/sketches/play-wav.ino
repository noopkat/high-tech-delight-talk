#include <SPI.h>
#include <SD.h>

#define SD_ChipSelectPin 4
#include <TMRpcm.h>           
TMRpcm tmrpcm;


void setup(){

  tmrpcm.speakerPin = 9;
  int ledPin = 3;

  digitalWrite(ledPin, HIGH);

  Serial.begin(9600);
  if (!SD.begin(SD_ChipSelectPin)) { 
    Serial.println("SD fail");  
    return;   
  }
  tmrpcm.play("c8k.wav"); 
}

void loop(){  


}
