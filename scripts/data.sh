#!/bin/sh

mkdir seed-data

for i in {1..8}; do 
curl "https://api.jikan.moe/v4/manga?page=${i}" -o "seed-data/page-${i}.json"; 
echo "Downloaded page ${i}"; 
sleep 1; 
done
