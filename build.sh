#!/bin/bash

rm -rf webup webup.zip
mkdir -p webup
cp manifest.json webup
cp *.png webup
cp background.js webup
zip -r webup.zip webup