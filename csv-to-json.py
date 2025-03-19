f = open("sheet.csv", "r")

res = {}

# skip first 2 lines
f.readline()
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

current = 0

data = data.split('\n')
for line in data:
	if line.replace(',', '').replace('"', '').replace(' ', '') == '':
		continue
	array = line.split(',')
	print(array)
	if len(array) > 10:
			array[9] = ','.join(array[9:])
			array = array[:10]
	if array[0].isdigit():
			current = array[0]
			res[current] = {
					"date": array[1],
					"time": array[2],
					"code": array[3],
					"title": array[4],
					"sum_student": int(array[5]) if array[5].isdigit() else 0,
					"group": [{
							"building": array[6],
							"room": array[7],
							"students": int(array[8]) if array[8].isdigit() else 0,
							"range": array[9]
					}]
			}
	else:
			res[current]["group"].append({
					"building": array[6],
					"room": array[7],
					"students": int(array[8]) if array[8].isdigit() else 0,
					"range": array[9]
			})

f = open("sheet.json", "w")
f.write(str(res))
f.close()