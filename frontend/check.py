import urllib.request, re
html = urllib.request.urlopen('https://project-raze.vercel.app').read().decode()
js_files = set(re.findall(r'src="([^"]+\.js)"', html))
found = False
for js in js_files:
    if not js.startswith('http'):
        js = 'https://project-raze.vercel.app' + (js if js.startswith('/') else '/' + js)
    try:
        content = urllib.request.urlopen(js).read().decode()
    except Exception as e:
        continue
    if 'ngrok-skip-browser-warning' in content:
        print('FOUND IN', js)
        found = True
if not found:
    print('NOT FOUND')
