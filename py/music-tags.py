import music_tag
import requests
import sys

filePath = sys.argv[1]
title = sys.argv[2]
artist = sys.argv[3]
album = sys.argv[4]
year = sys.argv[5]
image = sys.argv[6]

f = music_tag.load_file(filePath)

if title != 'undefined':
    f['title'] = title

if artist != 'undefined':
    f['artist'] = artist

if album != 'undefined':
    f['album'] = album

if year != 'undefined':
    f['year'] = year

if image != 'undefined':
    response = requests.get(image)
    if (response.status_code == 200):
        f['artwork'] = response.content


f.save()
print(title, 'success')
