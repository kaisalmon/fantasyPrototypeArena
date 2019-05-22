import os
import argparse
import json
from pprint import pprint

parser = argparse.ArgumentParser(description='Create the json file of download locations for icons, given a multilayer directory of icons.')

parser.add_argument('path',
                   help='The path of the icons, downloaded from http://game-icons.net')
parser.add_argument('output',
                   help='The json file to store the mapping')

args = parser.parse_args()
path = args.path

output = {}

for root, dirs, files in os.walk(path, topdown=False):
    for name in files:
        icon = name.split('.')[0]
        rel = (os.path.join(root, name))
        rel = rel.replace(path,"http://game-icons.net/icons/")
        rel = rel.replace("svg","png")
        output[icon] =  rel

with open(args.output, 'w') as outfile:
    json.dump(output, outfile, indent=4, sort_keys=True)
