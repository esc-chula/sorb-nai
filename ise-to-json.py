f = open("ise.csv", "r")

res = {}

# skip first line
f.readline()

data = f.read()

f.close()
# find where is the " and the other ", merge into one line
i = data.find('"')
j = data.find('"', i+1)
while i != -1 and j != -1:
		data = data[:i] + data[i+1:j].replace('\n', '') + data[j+1:]
		i = data.find('"')
		j = data.find('"', i+1)
data = data.replace('�', '')
current = 0

data = data.split('\n')
for line in data:
	if line.replace(',', '').replace('"', '').replace(' ', '') == '':
		continue
	array = line.split(',')
	if len(array) > 6 and array[6].startswith('Cancelled'):
		continue
	array[1] = array[1].replace('*', '')
	print(array[:8])
	if array[1].isdigit() and array[1] != current:
			current = array[1]
			res[current] = {
					"code": array[1],
					"title": array[2].split('Sec')[0].strip(),
					"date": array[4],
					"time": array[5],
					"group": [{
     					"sec": array[3],
							"building": [array[6]],
							"room": [array[7]],
					}]
			}
	else:
		if array[3] in res[current]["group"][-1]["sec"]:
			res[current]["group"][-1]["building"].append(array[6])
			res[current]["group"][-1]["room"].append(array[7])
		else:
			res[current]["group"].append({
					"sec": array[3],
					"building": [array[6]],
					"room": [array[7]],
			})
   

f = open("sheet.json", "w")
f.write(str(res))
f.close()
