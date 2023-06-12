# -*- coding: utf-8 -*-

import music_tag
import requests
import sys
import re

filePath = sys.argv[1]

f = music_tag.load_file(filePath)

for index, item in enumerate(sys.argv):
    if index > 1:
        [keyStr, value] = re.split(r'=', item, 1)
        result = re.search(r"^-(\w+)$", keyStr)
        if result is not None and value != 'undefined':
            key = result[1]
            if key != 'image':
                f[key] = value
            else:
                response = requests.get(value)
                if (response.status_code == 200):
                    f['artwork'] = response.content


f.save()
print('success')
